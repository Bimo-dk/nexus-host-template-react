import React, { useEffect, useRef, useState } from 'react';
import { loadRemoteModule } from '@softarc/native-federation-runtime';
import type { RemoteConfig } from '@bimo-dk/nexus-core';

interface Props {
  remote: RemoteConfig;
  compact?: boolean;
}

/**
 * Renders one federated remote via the BYOF `mount(el)` convention.
 * The host provides the div; the remote brings its own framework
 * runtime inside.
 */
export function RemoteSlot({ remote, compact = false }: Props): React.ReactElement {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let teardown: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      try {
        const mod = (await loadRemoteModule({
          remoteEntry: remote.url,
          exposedModule: remote.exposedModule,
        })) as Record<string, unknown>;
        if (cancelled) return;
        if (typeof mod['mount'] === 'function' && elRef.current) {
          const result = (mod['mount'] as (el: HTMLElement) => void | (() => void))(elRef.current);
          if (typeof result === 'function') teardown = result;
        } else {
          setError('Remote does not export mount(el)');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [remote.url, remote.exposedModule]);

  if (error) {
    return (
      <div style={{ color: '#b91c1c', fontSize: 12, padding: 8, background: '#fee2e2', borderRadius: 6 }}>
        {error}
      </div>
    );
  }
  return (
    <div
      style={{
        padding: compact ? 8 : 16,
        maxHeight: compact ? 220 : undefined,
        overflow: compact ? 'hidden' : undefined,
      }}
    >
      <div ref={elRef} />
    </div>
  );
}
