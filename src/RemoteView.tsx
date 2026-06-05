import React, { lazy, Suspense } from 'react';
import { loadRemoteModule } from '@softarc/native-federation-runtime';

interface Props {
  remoteEntry: string;
  exposedModule: string;
}

const cache = new Map<string, React.ComponentType>();

export function RemoteView({ remoteEntry, exposedModule }: Props): React.ReactElement {
  const key = `${remoteEntry}::${exposedModule}`;

  if (!cache.has(key)) {
    const Lazy = lazy(() =>
      (loadRemoteModule({ remoteEntry, exposedModule }) as Promise<Record<string, unknown>>).then(
        mod => ({ default: (mod['default'] ?? Object.values(mod)[0]) as React.ComponentType }),
      ),
    );
    cache.set(key, Lazy);
  }

  const Component = cache.get(key)!;
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--host-text-muted)' }}>Loading...</div>}>
      <Component />
    </Suspense>
  );
}
