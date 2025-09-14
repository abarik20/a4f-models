export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Safe simulated admin actions. We do NOT perform destructive operations.
  switch (action) {
    case 'restart':
      // In a real deployment you might trigger a process restart. Here we simulate.
      return res.status(200).json({ ok: true, action: 'restart', message: 'Simulated restart accepted (no-op in this environment).' });
    case 'reload-cache':
      // Simulate cache reload
      return res.status(200).json({ ok: true, action: 'reload-cache', message: 'Simulated cache reload completed.' });
    case 'clear-logs':
      // Simulate clearing logs
      return res.status(200).json({ ok: true, action: 'clear-logs', message: 'Simulated log clearance completed.' });
    default:
      return res.status(400).json({ error: 'Unknown admin action' });
  }
}
