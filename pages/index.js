import { useEffect, useState, useMemo } from 'react';

const TABS = [
  { key: 'chat', label: 'Chat & Completion', type: 'chat/completion', icon: '💬' },
  { key: 'audio', label: 'Audio & Transcriptions', type: 'audio/transcriptions', icon: '🎵' },
  { key: 'embed', label: 'Embeddings', type: 'embeddings', icon: '🔗' },
  { key: 'images', label: 'Image Generation', type: 'images/generations', icon: '🎨' },
];

const CAPABILITY_FILTERS = [
  { key: 'function_calling', label: 'Function Calling', icon: '⚡' },
  { key: 'vision', label: 'Vision', icon: '👁️' },
  { key: 'audio', label: 'Audio', icon: '🎤' },
  { key: 'reasoning', label: 'Reasoning', icon: '🧠' },
];

export default function Home() {
  const [models, setModels] = useState([]);
  const [tab, setTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const r = await fetch('/api/models');
        const j = await r.json();
        setModels(j.models || []);
        setLastUpdated(new Date());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const currentType = TABS.find(ti => ti.key === tab)?.type;

  const filtered = useMemo(() => {
    return models
      .filter(m => m.type === currentType)
      .filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.providerId.toLowerCase().includes(search.toLowerCase())
      )
      .filter(m => {
        if (selectedCapabilities.length === 0) return true;
        return selectedCapabilities.every(cap => m.capabilities[cap]);
      })
      .sort((a, b) => {
        const A = a[sortField] ?? '';
        const B = b[sortField] ?? '';
        if (typeof A === 'number' && typeof B === 'number') {
          return sortAsc ? A - B : B - A;
        }
        return sortAsc
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A));
      });
  }, [models, currentType, search, selectedCapabilities, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleCapability = (cap) => {
    setSelectedCapabilities(prev => 
      prev.includes(cap) 
        ? prev.filter(c => c !== cap)
        : [...prev, cap]
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortAsc ? '⬆️' : '⬇️';
  };

  const formatUptime = (uptime) => {
    if (!uptime) return '-';
    const num = parseFloat(uptime);
    if (num >= 99) return <span style={{color: '#059669', fontWeight: '500'}}>{num}%</span>;
    if (num >= 95) return <span style={{color: '#d97706', fontWeight: '500'}}>{num}%</span>;
    return <span style={{color: '#dc2626', fontWeight: '500'}}>{num}%</span>;
  };

  const formatLatency = (latency) => {
    if (!latency) return '-';
    const num = parseFloat(String(latency).match(/[\d.]+/)?.[0] || 0);
    if (num === 0) return '-';
    if (num < 1) return <span style={{color: '#059669', fontWeight: '500'}}>{num.toFixed(2)}s</span>;
    if (num < 3) return <span style={{color: '#d97706', fontWeight: '500'}}>{num.toFixed(1)}s</span>;
    return <span style={{color: '#dc2626', fontWeight: '500'}}>{num.toFixed(1)}s</span>;
  };

  const tableHeaderStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    userSelect: 'none'
  };

  const tableCellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px'
  };

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div className="header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', lineHeight: '1.2' }}>
                  A4F Free Models
                </h1>
                <p style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                  Live dashboard • {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                </p>
              </div>
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s'
                }}
              >
                🔗 View Source
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: '24px' }}>
            <div className="tabs-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TABS.map(ti => (
                <button
                  key={ti.key}
                  onClick={() => setTab(ti.key)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: tab === ti.key ? 'none' : '1px solid #d1d5db',
                    backgroundColor: tab === ti.key ? '#2563eb' : 'white',
                    color: tab === ti.key ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{ti.icon}</span>
                  {ti.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '24px' }}>
            <div className="search-filters-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Search */}
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>
                  🔍
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search models or providers..."
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: `1px solid ${showFilters || selectedCapabilities.length > 0 ? '#2563eb' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: showFilters || selectedCapabilities.length > 0 ? '#eff6ff' : 'white',
                  color: showFilters || selectedCapabilities.length > 0 ? '#2563eb' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  flexShrink: 0
                }}
              >
                🔽 Filters {selectedCapabilities.length > 0 && `(${selectedCapabilities.length})`}
              </button>
            </div>

            {/* Capability Filters */}
            {showFilters && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                  Filter by Capabilities:
                </p>
                <div className="capability-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CAPABILITY_FILTERS.map(cap => {
                    const isSelected = selectedCapabilities.includes(cap.key);
                    return (
                      <button
                        key={cap.key}
                        onClick={() => toggleCapability(cap.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #d1d5db',
                          backgroundColor: isSelected ? '#dbeafe' : '#f9fafb',
                          color: isSelected ? '#1e40af' : '#6b7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{cap.icon}</span>
                        {cap.label}
                      </button>
                    );
                  })}
                </div>
                {selectedCapabilities.length > 0 && (
                  <button
                    onClick={() => setSelectedCapabilities([])}
                    style={{
                      marginTop: '12px',
                      fontSize: '13px',
                      color: '#2563eb',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing <span style={{ fontWeight: '600', color: '#111827' }}>{filtered.length}</span> models
              {selectedCapabilities.length > 0 && (
                <span> with {selectedCapabilities.join(', ')} capabilities</span>
              )}
            </p>
          </div>

          {/* Table */}
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
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Loading models...</span>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort('name')} style={{...tableHeaderStyle, textAlign: 'left'}}>
                        Model {getSortIcon('name')}
                      </th>
                      <th onClick={() => toggleSort('providerId')} style={{...tableHeaderStyle, textAlign: 'left'}}>
                        Provider {getSortIcon('providerId')}
                      </th>
                      <th onClick={() => toggleSort('function')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Function {getSortIcon('function')}
                      </th>
                      <th onClick={() => toggleSort('vision')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Vision {getSortIcon('vision')}
                      </th>
                      <th onClick={() => toggleSort('audio')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Audio {getSortIcon('audio')}
                      </th>
                      <th onClick={() => toggleSort('reasoning')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Reasoning {getSortIcon('reasoning')}
                      </th>
                      <th onClick={() => toggleSort('context_window')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Context Window {getSortIcon('context_window')}
                      </th>
                      <th onClick={() => toggleSort('latency')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Latency {getSortIcon('latency')}
                      </th>
                      <th onClick={() => toggleSort('uptime')} style={{...tableHeaderStyle, textAlign: 'center'}}>
                        Uptime {getSortIcon('uptime')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => {
                      const ctxTokens = m.context_window ? m.context_window.toLocaleString() : '-';
                      const ctxWords = m.context_window ? Math.round(m.context_window / 4).toLocaleString() : '-';

                      return (
                        <tr
                          key={m.providerId + m.name}
                          style={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}
                        >
                          <td style={{...tableCellStyle, fontWeight: '500', color: '#111827'}}>
                            {m.name}
                          </td>
                          <td style={{...tableCellStyle, fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', backgroundColor: '#f9fafb'}}>
                            {m.providerId}
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center'}}>
                            {m.capabilities.function_calling ? (
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: '#dcfce7', 
                                color: '#16a34a', 
                                borderRadius: '50%', 
                                fontSize: '16px' 
                              }}>
                                ⚡
                              </div>
                            ) : (
                              <span style={{ color: '#d1d5db', fontSize: '18px' }}>-</span>
                            )}
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center'}}>
                            {m.capabilities.vision ? (
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: '#dbeafe', 
                                color: '#2563eb', 
                                borderRadius: '50%', 
                                fontSize: '16px' 
                              }}>
                                👁️
                              </div>
                            ) : (
                              <span style={{ color: '#d1d5db', fontSize: '18px' }}>-</span>
                            )}
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center'}}>
                            {m.capabilities.audio ? (
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: '#f3e8ff', 
                                color: '#9333ea', 
                                borderRadius: '50%', 
                                fontSize: '16px' 
                              }}>
                                🎤
                              </div>
                            ) : (
                              <span style={{ color: '#d1d5db', fontSize: '18px' }}>-</span>
                            )}
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center'}}>
                            {m.capabilities.reasoning ? (
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: '#fed7aa', 
                                color: '#ea580c', 
                                borderRadius: '50%', 
                                fontSize: '16px' 
                              }}>
                                🧠
                              </div>
                            ) : (
                              <span style={{ color: '#d1d5db', fontSize: '18px' }}>-</span>
                            )}
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center', fontSize: '13px'}}>
                            {ctxTokens !== '-' ? (
                              <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>
                                <div style={{ fontWeight: '500', color: '#111827' }}>{ctxTokens}</div>
                                <div style={{ color: '#6b7280', fontSize: '11px' }}>≈{ctxWords} words</div>
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center'}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              ⏱️ {formatLatency(m.latency)}
                            </div>
                          </td>
                          <td style={{...tableCellStyle, textAlign: 'center'}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              📊 {formatUptime(m.uptime)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="9" style={{...tableCellStyle, padding: '64px 16px', textAlign: 'center'}}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '48px', color: '#d1d5db' }}>🔍</div>
                            <div>
                              <p style={{ color: '#6b7280', fontWeight: '500', fontSize: '16px', margin: '0 0 4px 0' }}>No models found</p>
                              <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0' }}>Try adjusting your search or filters</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '32px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', width: '4px', height: '4px', backgroundColor: '#9ca3af', borderRadius: '50%' }}></span>
              Data refreshes automatically every minute
              <span style={{ display: 'inline-block', width: '4px', height: '4px', backgroundColor: '#9ca3af', borderRadius: '50%' }}></span>
              Powered by A4F API
            </p>
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
        @media (min-width: 768px) {
          .search-filters-container {
            flex-direction: row !important;
          }
          .header-container {
            flex-wrap: nowrap !important;
          }
        }
        @media (max-width: 767px) {
          .tabs-container {
            justify-content: center;
          }
          .capability-filters {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
