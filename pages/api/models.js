// pages/api/models.js
export default async function handler(req, res) {
  const API_URL = 'https://www.a4f.co/api/get-display-models?plan=free';
  try {
    const upstream = await fetch(API_URL);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream API error' });
    }
    const data = await upstream.json();
    const arr = (data.models || []);

    const parseLatency = (p) => {
      try {
        const v = p?.performance_metrics?.latency;
        if (!v) return null; // no latency data
        const m = String(v).match(/([\d.]+)/);
        return m ? parseFloat(m[1]) : null;
      } catch (e) { return null; }
    };

    const processed = arr.map((m) => {
      const providers = m.proxy_providers || [];
      // choose fastest provider by lowest latency (if provided)
      let fastest = providers[0] || null;
      let fastestLatency = fastest ? parseLatency(fastest) : null;
      for (const p of providers) {
        const l = parseLatency(p);
        if (l != null && (fastestLatency == null || l < fastestLatency)) {
          fastest = p; fastestLatency = l;
        }
      }

      const mergedFeatures = new Set([...(m.features || []), ...(fastest?.features || [])]);
      const capabilities = {
        function_calling: mergedFeatures.has('function_calling'),
        vision: mergedFeatures.has('vision'),
        audio: mergedFeatures.has('audio'),
        reasoning: mergedFeatures.has('reasoning') || mergedFeatures.has('hybrid-reasoning'),
      };

      const providerId = fastest ? `${fastest.prefix}/${m.name}` :
                            (providers[0] ? `${providers[0].prefix}/${m.name}` : `unknown/${m.name}`);

      // hide uptime if "N/A" or missing - we'll send it but frontend won't show "N/A"
      const uptime = fastest?.performance_metrics?.uptime_percentage ?? null;

      return {
        name: m.name,
        providerId,
        type: m.type,
        capabilities,
        context_window: m.context_window ?? null,
        latency: fastest?.performance_metrics?.latency ?? null,
        uptime: (uptime && uptime !== 'N/A') ? uptime : null
      };
    });

    // small cache on server side (so we don't hammer upstream) but always up-to-date-ish.
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ models: processed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

