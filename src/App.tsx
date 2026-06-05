import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { RegistryClient, RegistryWebSocket } from '@bimo-dk/nexus-client';
import type { RemoteConfig } from '@bimo-dk/nexus-core';
import { RemoteView } from './RemoteView';
import { Dashboard } from './Dashboard';

declare global {
  interface Window {
    __NEXUS_GATEWAY_CONFIG__?: { registryUrl?: string };
  }
}

const registryUrl =
  window.__NEXUS_GATEWAY_CONFIG__?.registryUrl ??
  import.meta.env.VITE_REGISTRY_URL ??
  '/api';

const token = import.meta.env.VITE_NEXUS_TOKEN ?? '';

export function App(): React.ReactElement {
  const [remotes, setRemotes] = useState<RemoteConfig[]>([]);
  const [failed, setFailed] = useState<Map<string, string>>(new Map());
  const [online, setOnline] = useState(false);

  const loadedNames = useRef(new Set<string>());

  function mergeRemotes(incoming: RemoteConfig[]): void {
    setOnline(true);
    setRemotes(prev => {
      const known = new Set(prev.map(r => r.name));
      const next = [...prev];
      for (const r of incoming) {
        if (r.enabled && !known.has(r.name)) {
          next.push(r);
          loadedNames.current.add(r.name);
        }
      }
      return next;
    });
  }

  useEffect(() => {
    const client = new RegistryClient({ registryUrl, token });
    const ws = new RegistryWebSocket({ registryUrl, token });

    const unsub = ws.onMessage(msg => {
      if (msg.type === 'connected' || msg.type === 'registry_updated') {
        mergeRemotes(msg.remotes);
      }
    });

    client.getRemotes()
      .then(mergeRemotes)
      .catch(() => setOnline(false));

    ws.connect();
    return () => {
      unsub();
      ws.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="layout">
        {!online && (
          <div className="offline-banner">
            <strong>Registry offline</strong> — remotes unavailable until reconnected.
          </div>
        )}

        <header className="topbar">
          <div className="brand">
            <span className="dot" />
            <strong>Nexus Host (React)</strong>
          </div>
          <nav className="topnav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            {remotes.map(r => (
              <NavLink key={r.name} to={`/${r.routePath}`}>{r.name}</NavLink>
            ))}
          </nav>
          <div className="meta">
            <span className={`pill ${online ? 'online' : 'offline'}`}>
              Registry {online ? 'online' : 'offline'}
            </span>
          </div>
        </header>

        <div className="body">
          <aside className="sidebar">
            <h3>Remotes</h3>
            {remotes.length === 0 && <p className="empty">No active remotes.</p>}
            <ul>
              {remotes.map(r => (
                <li key={r.name}>
                  <NavLink to={`/${r.routePath}`}>
                    <span className="dot-status" />
                    {r.name}
                  </NavLink>
                </li>
              ))}
            </ul>
            {failed.size > 0 && (
              <>
                <h4>Failed</h4>
                <ul className="failed">
                  {Array.from(failed.entries()).map(([name, err]) => (
                    <li key={name} title={err}>
                      <span className="dot-status down" />
                      {name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard remotes={remotes} online={online} />} />
              {remotes.map(r => (
                <Route
                  key={r.name}
                  path={`/${r.routePath}/*`}
                  element={<RemoteView remoteEntry={r.url} exposedModule={r.exposedModule} />}
                />
              ))}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>

        <footer className="bottombar">
          <small>Nexus host (React) — {remotes.length} remotes loaded</small>
        </footer>
      </div>

      <style>{`
        .layout { display: flex; flex-direction: column; height: 100vh; }
        .offline-banner {
          flex: 0 0 auto;
          background: #fef3c7;
          color: #78350f;
          padding: 10px 20px;
          border-bottom: 1px solid #fbbf24;
          font-size: 13px;
        }
        .topbar {
          flex: 0 0 56px;
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 0 24px;
          background: var(--host-surface);
          border-bottom: 1px solid var(--host-border);
        }
        .brand { display: flex; align-items: center; gap: 10px; font-size: 16px; color: var(--host-text); }
        .brand .dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--host-primary);
        }
        .topnav { display: flex; gap: 16px; flex: 1; }
        .topnav a {
          color: var(--host-text-muted);
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 14px;
        }
        .topnav a.active { color: var(--host-primary-dark); background: #ecfeff; }
        .meta .pill {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 600;
          background: #f1f5f9;
          color: var(--host-text-muted);
        }
        .meta .pill.online { background: #dcfce7; color: #166534; }
        .meta .pill.offline { background: #fee2e2; color: #991b1b; }
        .body { display: grid; grid-template-columns: 240px 1fr; flex: 1 1 auto; min-height: 0; }
        .sidebar {
          background: var(--host-surface);
          border-right: 1px solid var(--host-border);
          padding: 16px;
          overflow-y: auto;
        }
        .sidebar h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--host-text-muted);
          margin: 0 0 8px;
        }
        .sidebar h4 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--health-down);
          margin: 16px 0 8px;
        }
        .empty { color: var(--host-text-muted); font-size: 13px; }
        .sidebar ul { list-style: none; padding: 0; margin: 0; }
        .sidebar li { margin-bottom: 4px; }
        .sidebar a {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--host-text);
          text-decoration: none;
          font-size: 14px;
        }
        .sidebar a:hover { background: #f1f5f9; }
        .sidebar a.active { background: #ecfeff; color: var(--host-primary-dark); }
        .failed li { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 13px; color: var(--health-down); }
        .dot-status {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--health-unknown);
          flex-shrink: 0;
        }
        .dot-status.down { background: var(--health-down); }
        .content { padding: 24px; overflow-y: auto; }
        .bottombar {
          flex: 0 0 32px;
          background: var(--host-surface);
          border-top: 1px solid var(--host-border);
          padding: 0 24px;
          display: flex;
          align-items: center;
          color: var(--host-text-muted);
          font-size: 12px;
        }
      `}</style>
    </BrowserRouter>
  );
}
