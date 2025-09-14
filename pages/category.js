// pages/[type].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const TYPE_MAPPINGS = {
  'chat': 'chat/completion',
  'audio': 'audio/transcriptions', 
  'embedding': 'embeddings',
  'image': 'images/generations'
};

const TYPE_LABELS = {
  'chat': 'Chat & Completion Models',
  'audio': 'Audio & Transcription Models',
  'embedding': 'Embedding Models', 
  'image': 'Image Generation Models'
};

const TYPE_ICONS = {
  'chat': '💬',
  'audio': '🎵', 
  'embedding': '🔗',
  'image': '🎨'
};

export default function ModelsTypePage() {
  const router = useRouter();
  const { type } = router.query;
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function loadModels() {
      if (!type || !TYPE_MAPPINGS[type]) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        // Filter by type and exclude models with no uptime data
        const filteredModels = (data.models || [])
          .filter(model => model.type === TYPE_MAPPINGS[type])
          .filter(model => model.uptime && model.uptime !== 'N/A' && model.uptime !== null)
          .sort((a, b) => {
            // Sort by uptime descending (highest first)
            const uptimeA = parseFloat(a.uptime) || 0;
            const uptimeB = parseFloat(b.uptime) || 0;
            return uptimeB - uptimeA;
          });

        setModels(filteredModels);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
    
    // Refresh every minute
    const interval = setInterval(loadModels, 60000);
    return () => clearInterval(interval);
  }, [type]);

  // Redirect to home if invalid type
  useEffect(() => {
    if (type && !TYPE_MAPPINGS[type]) {
      router.push('/');
    }
  }, [type, router]);

  if (!type || !TYPE_MAPPINGS[type]) {
    return null; // Will redirect
  }

  const formatUptime = (uptime) => {
    const num = parseFloat(uptime);
    if (num >= 99) return { value: `${num}%`, color: '#059669' };
    if (num >= 95) return { value: `${num}%`, color: '#d97706' };
    return { value: `${num}%`, color: '#dc2626' };
  };

  const formatLatency = (latency) => {
    if (!latency) return { value: '-', color: '#6b7280' };
    const num = parseFloat(String(latency).match(/[\d.]+/)?.[0] || 0);
    if (num === 0) return { value: '-', color: '#6b7280' };
    if (num < 1) return { value: `${num.toFixed(2)}s`, color: '#059669' };
    if (num < 3) return { value: `${num.toFixed(1)}s`, color: '#d97706' };
    return { value: `${num.toFixed(1)}s`, color: '#dc2626' };
  };

  const formatContextWindow = (contextWindow) => {
    if (!contextWindow) return '-';
    return contextWindow.toLocaleString();
  };

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px' }}>{TYPE_ICONS[type]}</span>
                  <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                    {TYPE_LABELS[type]}
                  </h1>
                </div>
                <p style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0 }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                  Live data • Sorted by uptime • {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={() => router.push('/')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ← Back to Dashboard
                </button>
                <a
                  href="https://www.a4f.co/models"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  🔗 View Source
                </a>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{models.length}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Available Models</div>
            </div>
            
            {models.length > 0 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
                border: '1px solid #e5e7eb' 
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  {formatUptime(models[0].uptime).value}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Best Uptime</div>
              </div>
            )}
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
                {models.filter(m => m.capabilities?.function_calling).length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>With Functions</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {models.filter(m => m.capabilities?.vision).length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>With Vision</div>
            </div>
          </div>

          {/* Models Grid */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  border: '4px solid #f3f4f6', 
                  borderTop: '4px solid #2563eb', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Loading {type} models...</span>
              </div>
            </div>
          ) : models.length === 0 ? (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '64px 32px', 
              borderRadius: '12px', 
              textAlign: 'center', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ color: '#374151', marginBottom: '8px' }}>No {type} models available</h3>
              <p style={{ color: '#6b7280' }}>All models may be down or have no uptime data</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
              gap: '20px' 
            }}>
              {models.map((model, index) => {
                const uptime = formatUptime(model.uptime);
                const latency = formatLatency(model.latency);
                const contextTokens = formatContextWindow(model.context_window);
                const contextWords = model.context_window ? Math.round(model.context_window / 4).toLocaleString() : '-';

                return (
                  <div 
                    key={model.providerId + model.name}
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px', 
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
                      border: '1px solid #e5e7eb',
                      padding: '20px',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Rank Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '16px',
                      backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#2563eb',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </div>

                    {/* Model Header */}
                    <div style={{ marginBottom: '16px', paddingTop: '8px' }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#111827' 
                      }}>
                        {model.name}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        fontFamily: 'monospace', 
                        color: '#6b7280',
                        backgroundColor: '#f9fafb',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {model.providerId}
                      </p>
                    </div>

                    {/* Capabilities */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Capabilities
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px',
                            width: '20px',
                            textAlign: 'center'
                          }}>
                            {model.capabilities?.function_calling ? '⚡' : '❌'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Functions</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px',
                            width: '20px',
                            textAlign: 'center'
                          }}>
                            {model.capabilities?.vision ? '👁️' : '❌'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Vision</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px',
                            width: '20px',
                            textAlign: 'center'
                          }}>
                            {model.capabilities?.audio ? '🎤' : '❌'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Audio</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px',
                            width: '20px',
                            textAlign: 'center'
                          }}>
                            {model.capabilities?.reasoning ? '🧠' : '❌'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Reasoning</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Performance
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: '#f9fafb', 
                          padding: '8px 12px', 
                          borderRadius: '8px' 
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Uptime</div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: uptime.color 
                          }}>
                            {uptime.value}
                          </div>
                        </div>
                        <div style={{ 
                          backgroundColor: '#f9fafb', 
                          padding: '8px 12px', 
                          borderRadius: '8px' 
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Latency</div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: latency.color 
                          }}>
                            {latency.value}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Context Window */}
                    {contextTokens !== '-' && (
                      <div style={{ 
                        backgroundColor: '#f0f9ff', 
                        padding: '12px', 
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                      }}>
                        <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>Context Window</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0c4a6e' }}>
                          {contextTokens} tokens
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1' }}>≈{contextWords} words</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '32px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            <p>Models sorted by uptime (highest first) • Data refreshes every minute</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
