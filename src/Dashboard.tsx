import React from 'react';
import { Link } from 'react-router-dom';
import type { RemoteConfig } from '@bimo-dk/nexus-core';

interface Props {
  remotes: RemoteConfig[];
  online: boolean;
}

export function Dashboard({ remotes, online }: Props): React.ReactElement {
  return (
    <section style={{ padding: 8 }}>
      <h2 style={{ margin: '0 0 4px', color: 'var(--host-text)' }}>Welcome to the Nexus host shell</h2>
      <p style={{ color: 'var(--host-text-muted)', margin: '0 0 24px' }}>
        Select a remote in the sidebar to load a micro frontend.
      </p>

      {remotes.length === 0 ? (
        <div style={{
          padding: 32,
          background: 'var(--host-surface)',
          border: '1px dashed var(--host-border)',
          borderRadius: 12,
          textAlign: 'center',
          color: 'var(--host-text-muted)',
        }}>
          <h3 style={{ margin: '0 0 8px', color: 'var(--host-text)' }}>No remotes registered yet</h3>
          <p>
            Host receives updates via WebSocket. Add a remote via the portal at{' '}
            <code style={{ background: '#ecfeff', padding: '2px 6px', borderRadius: 4, color: 'var(--host-primary-dark)' }}>
              http://localhost:8669
            </code>.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Loaded remotes', value: remotes.length },
              { label: 'Registry', value: online ? 'Online' : 'Offline', color: online ? 'var(--health-healthy)' : 'var(--health-down)' },
            ].map(card => (
              <article key={card.label} style={{
                background: 'var(--host-surface)',
                border: '1px solid var(--host-border)',
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{ fontSize: 12, color: 'var(--host-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.label}
                </span>
                <strong style={{ fontSize: 24, marginTop: 4, color: card.color }}>
                  {card.value}
                </strong>
              </article>
            ))}
          </div>

          <h3 style={{ margin: '24px 0 12px', fontSize: 16, color: 'var(--host-text)' }}>Available remotes</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {remotes.map(r => (
              <li key={r.name}>
                <Link to={`/${r.routePath}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'var(--host-surface)',
                  border: '1px solid var(--host-border)',
                  borderRadius: 10,
                  color: 'var(--host-text)',
                  textDecoration: 'none',
                }}>
                  <strong>{r.name}</strong>
                  <code style={{ color: 'var(--host-text-muted)', fontSize: 13, marginLeft: 'auto' }}>
                    /{r.routePath}
                  </code>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
