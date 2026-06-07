import React from 'react';
import type { RemoteConfig } from '@bimo-dk/nexus-core';
import { RemoteSlot } from './RemoteSlot';

interface Props {
  remotes: RemoteConfig[];
  online: boolean;
}

const tints = [
  'linear-gradient(135deg, #ef4444, #fb7185)',
  'linear-gradient(135deg, #06b6d4, #67e8f9)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #6366f1, #818cf8)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
];

const fwColours: Record<string, { bg: string; fg: string }> = {
  angular: { bg: '#fee2e2', fg: '#b91c1c' },
  vue:     { bg: '#dcfce7', fg: '#14532d' },
  react:   { bg: '#dbeafe', fg: '#1e40af' },
};

export function Dashboard({ remotes, online }: Props): React.ReactElement {
  return (
    <section style={{ padding: '0 8px 24px' }}>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 24,
          padding: 28,
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)',
          color: 'white',
          borderRadius: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <span style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8 }}>
            Nexus React Shop
          </span>
          <h1 style={{ margin: '4px 0 12px', fontSize: 28, fontWeight: 700 }}>
            Cross-framework retail demo
          </h1>
          <p style={{ maxWidth: '60ch', opacity: 0.9, lineHeight: 1.5 }}>
            Every product card, cart widget and checkout panel below is loaded from a separate remote
            via Module Federation. Vue, React, and Angular components all render in the same shop without
            sharing a runtime — that's the Bring-Your-Own-Framework pattern.
          </p>
        </div>
        <aside style={{ display: 'flex', gap: 16 }}>
          <Stat label="Loaded remotes" value={remotes.length} />
          <Stat label="Registry" value={online ? 'live' : 'offline'} status={online ? 'ok' : 'down'} />
        </aside>
      </header>

      {remotes.length === 0 ? (
        <div
          style={{
            padding: 32,
            background: 'var(--host-surface)',
            border: '1px dashed var(--host-border)',
            borderRadius: 12,
            textAlign: 'center',
            color: 'var(--host-text-muted)',
          }}
        >
          <h3>No remotes registered yet</h3>
          <p>Add one via the portal at <a href="http://localhost:8669">localhost:8669</a>.</p>
        </div>
      ) : (
        <>
          <SectionTitle>Featured products</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {remotes.slice(0, 6).map((r, i) => (
              <article
                key={r.name + i}
                style={{
                  background: 'var(--host-surface)',
                  border: '1px solid var(--host-border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ aspectRatio: '1.4', background: tints[i % tints.length], position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: 999,
                      textTransform: 'uppercase',
                    }}
                  >
                    {r.framework || 'remote'}
                  </span>
                </div>
                <h3 style={{ margin: '12px 16px 4px', fontSize: 14 }}>{r.name} entry</h3>
                <p style={{ margin: '0 16px 12px', color: 'var(--host-primary-dark)', fontWeight: 700 }}>
                  $ {(29 + i * 7).toFixed(2)}
                </p>
                <RemoteSlot remote={r} compact />
              </article>
            ))}
          </div>

          <SectionTitle>Live demo of each remote</SectionTitle>
          <div style={{ display: 'grid', gap: 16 }}>
            {remotes.map((r) => {
              const col = fwColours[r.framework] ?? { bg: '#e5e7eb', fg: '#374151' };
              return (
                <article
                  key={`demo:${r.name}`}
                  style={{
                    background: 'var(--host-surface)',
                    border: '1px solid var(--host-border)',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <header
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 18px',
                      background: '#f0f9ff',
                      borderBottom: '1px solid var(--host-border)',
                    }}
                  >
                    <strong>{r.name}</strong>
                    <code style={{ color: 'var(--host-text-muted)', fontSize: 12 }}>/{r.routePath}</code>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontWeight: 700,
                        background: col.bg,
                        color: col.fg,
                      }}
                    >
                      {r.framework}
                    </span>
                  </header>
                  <RemoteSlot remote={r} />
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  status,
}: {
  label: string;
  value: number | string;
  status?: 'ok' | 'down';
}): React.ReactElement {
  const colour = status === 'ok' ? '#6ee7b7' : status === 'down' ? '#fda4af' : 'white';
  return (
    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', minWidth: 100 }}>
      <span style={{ display: 'block', fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </span>
      <strong style={{ fontSize: 22, color: colour }}>{value}</strong>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <h2
      style={{
        margin: '32px 0 16px',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: 'var(--host-text-muted)',
      }}
    >
      {children}
    </h2>
  );
}
