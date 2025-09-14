// pages/api/embedding.js
export default async function handler(req, res) {
  const API_URL = 'https://www.a4f.co/api/get-display-models?plan=free';
  
  try {
    const upstream = await fetch(API_URL);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream API error' });
    }
    
    const data = await upstream.json();
    const allModels = data.models || [];
    
    // Process embedding models
    const processedModels = allModels
      .filter(m => m.type === 'embeddings') // Filter embedding models
      .map(m => {
        const providers = m.proxy_providers || [];
        
        // Find provider with best performance (highest uptime, then lowest latency)
        let bestProvider = null;
        let bestUptime = 0;
        let bestLatency = Infinity;
        
        for (const provider of providers) {
          const uptime = parseFloat(provider.performance_metrics?.uptime_percentage || '0');
          const latencyStr = provider.performance_metrics?.latency || '';
          const latency = parseFloat(String(latencyStr).match(/[\d.]+/)?.[0] || '999');
          
          // Skip providers with no uptime data or N/A
          if (!uptime || uptime === 0 || provider.performance_metrics?.uptime_percentage === 'N/A') continue;
          
          if (uptime > bestUptime || (uptime === bestUptime && latency < bestLatency)) {
            bestProvider = provider;
            bestUptime = uptime;
            bestLatency = latency;
          }
        }
        
        // Skip models with no valid provider
        if (!bestProvider || bestUptime === 0) return null;
        
        // Merge features from model and provider
        const modelFeatures = new Set(m.features || []);
        const providerFeatures = new Set(bestProvider.features || []);
        const allFeatures = new Set([...modelFeatures, ...providerFeatures]);
        
        return {
          name: m.name,
          description: m.display_name || m.name,
          provider: `${bestProvider.prefix}/${m.name}`,
          context_tokens: m.context_window || null,
          uptime: parseFloat(bestUptime.toFixed(1)),
          latency_seconds: bestLatency !== Infinity ? parseFloat(bestLatency.toFixed(2)) : null,
          capabilities: {
            function_calling: allFeatures.has('function_calling'),
            vision: allFeatures.has('vision'), 
            audio: allFeatures.has('audio'),
            reasoning: allFeatures.has('reasoning') || allFeatures.has('hybrid-reasoning')
          }
        };
      })
      .filter(model => model !== null) // Remove null entries
      .sort((a, b) => {
        // Primary sort: uptime (descending - highest first)
        if (a.uptime !== b.uptime) {
          return b.uptime - a.uptime;
        }
        // Secondary sort: latency (ascending - lowest first) 
        const latencyA = a.latency_seconds || 999;
        const latencyB = b.latency_seconds || 999;
        return latencyA - latencyB;
      });

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(processedModels);
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
}
