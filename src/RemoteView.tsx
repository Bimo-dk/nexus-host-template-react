import React, { useEffect, useRef, useState } from 'react';
import { loadRemoteModule } from '@softarc/native-federation-runtime';

interface Props {
  remoteEntry: string;
  exposedModule: string;
}

/**
 * Renders a federated remote into a host-owned DOM node.
 *
 * Cross-framework safe ("Bring Your Own Framework"):
 *
 *   - If the remote exports a `mount(el: HTMLElement)` function we hand
 *     it our div ref and let the remote stand up its own framework
 *     runtime (Vue's `createApp`, React's `createRoot`, etc). The host
 *     never has to share React with the remote, so the classic
 *     "Cannot read properties of null (reading 'useState')" cross-React
 *     bug never surfaces.
 *
 *   - Falls back to rendering `mod.default` as a React component for
 *     legacy remotes that only expose a function/class. Same-framework
 *     remotes built before this convention still load.
 */
export function RemoteView({ remoteEntry, exposedModule }: Props): React.ReactElement {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [LegacyComponent, setLegacyComponent] =
    useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let teardown: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        const mod = (await loadRemoteModule({ remoteEntry, exposedModule })) as Record<
          string,
          unknown
        >;
        if (cancelled) return;

        if (typeof mod['mount'] === 'function' && elRef.current) {
          teardown = (mod['mount'] as (el: HTMLElement) => () => void)(elRef.current);
          return;
        }

        const fallback = (mod['default'] ?? Object.values(mod)[0]) as React.ComponentType;
        if (typeof fallback === 'function') {
          setLegacyComponent(() => fallback);
        } else {
          setError('Remote exposed neither a mount() function nor a React component');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [remoteEntry, exposedModule]);

  if (error) {
    return (
      <div style={{ padding: 24, color: 'var(--accent-red, #b91c1c)' }}>
        <strong>Remote failed to mount:</strong> {error}
      </div>
    );
  }

  if (LegacyComponent) {
    return <LegacyComponent />;
  }

  // BYOF path: the remote will populate this div via its own mount().
  return <div ref={elRef} />;
}
