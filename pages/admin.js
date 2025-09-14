import { useState } from 'react';

export default function AdminPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function runAction(action) {
    setBusy(true);
    setMsg('');
    try {
      // Attempt to call a matching API endpoint if present. If not present,
      // this will return 404 and we show a friendly message.
      const res = await fetch(`/api/admin/${action}`, { method: 'POST' });
      if (!res.ok) {
        const text = await res.text().catch(() => 'no details');
        setMsg(`Action ${action} failed: ${res.status} ${text}`);
      } else {
        const data = await res.json().catch(() => null);
        setMsg(`Action ${action} completed${data ? ': ' + JSON.stringify(data) : ''}`);
      }
    } catch (e) {
      setMsg(`Action ${action} error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: 'linear-gradient(135deg,#f8fafc 0%, #e0f2fe 100%)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p style={{ color: '#6b7280' }}>Administrative tools moved from the dashboard. Use these to run site-level actions.</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
          <button
            disabled={busy}
            onClick={() => runAction('restart')}
            style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Restart (if available)
          </button>

          <button
            disabled={busy}
            onClick={() => runAction('reload-cache')}
            style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Reload Cache
          </button>

          <button
            disabled={busy}
            onClick={() => runAction('clear-logs')}
            style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Clear Logs
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Status</div>
          <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            {busy ? <div>Running...</div> : <div>{msg || 'Idle'}</div>}
          </div>
        </div>

        <div style={{ marginTop: 22, color: '#6b7280', fontSize: 13 }}>
          <p>Notes:</p>
          <ul>
            <li>If the buttons return 404 it means no matching `/api/admin/*` endpoints exist yet.</li>
            <li>I can wire server-side admin endpoints if you want real behavior (be cautious with restart actions).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
