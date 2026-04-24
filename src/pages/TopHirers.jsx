import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

const SEGMENTS = [
  { label: '💻 IT', tag: 'it-jobs', keyword: 'IT' },
  { label: '💰 Finance', tag: 'accounting-finance-jobs', keyword: 'finance' },
  { label: '📈 Sales', tag: 'sales-jobs', keyword: 'sales' },
  { label: '🏥 Healthcare', tag: 'healthcare-nursing-jobs', keyword: 'healthcare' },
  { label: '⚙️ Engineering', tag: 'engineering-jobs', keyword: 'engineering' },
  { label: '👥 HR', tag: 'hr-jobs', keyword: 'HR' },
  { label: '📣 Marketing', tag: 'pr-advertising-marketing-jobs', keyword: 'marketing' },
  { label: '📞 Customer Service', tag: 'customer-services-jobs', keyword: 'customer service' },
  { label: '🎨 Design', tag: 'creative-design-jobs', keyword: 'design' },
  { label: '📦 Logistics', tag: 'logistics-warehouse-jobs', keyword: 'logistics' },
  { label: '🏗️ Construction', tag: 'trade-construction-jobs', keyword: 'construction' },
  { label: '📋 Admin', tag: 'admin-jobs', keyword: 'admin' },
  { label: '🎓 Teaching', tag: 'teaching-jobs', keyword: 'teaching' },
  { label: '⚖️ Legal', tag: 'legal-jobs', keyword: 'legal' },
  { label: '🛒 Retail', tag: 'retail-jobs', keyword: 'retail' },
  { label: '🏭 Manufacturing', tag: 'manufacturing-jobs', keyword: 'manufacturing' },
  { label: '🔬 Scientific', tag: 'scientific-qa-jobs', keyword: 'scientific' },
  { label: '🧳 Travel', tag: 'travel-jobs', keyword: 'travel' },
  { label: '🏠 Property', tag: 'property-jobs', keyword: 'property' },
  { label: '⛽ Energy', tag: 'energy-oil-gas-jobs', keyword: 'energy' },
]

const CITIES = ['All India', 'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Indore', 'Noida', 'Gurgaon']

export default function TopHirers({ onSearchCompany }) {
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [city, setCity] = useState('All India')
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [customKeyword, setCustomKeyword] = useState('')
  const [showAllSegments, setShowAllSegments] = useState(false)

  const fetchTopCompanies = async (keyword, cityName) => {
    setLoading(true)
    setSearched(true)
    try {
      let url = `${API_URL}/api/jobs/top-companies?keyword=${encodeURIComponent(keyword)}`
      if (cityName && cityName !== 'All India') url += `&location=${encodeURIComponent(cityName)}`
      const res = await fetch(url)
      const data = await res.json()
      setCompanies(data.companies || [])
    } catch (e) { console.error(e); setCompanies([]) }
    setLoading(false)
  }

  const handleSegmentClick = (seg) => {
    setSelectedSegment(seg)
    setCustomKeyword('')
    fetchTopCompanies(seg.keyword, city)
  }

  const handleCityChange = (c) => {
    setCity(c)
    if (selectedSegment) fetchTopCompanies(selectedSegment.keyword, c)
    else if (customKeyword) fetchTopCompanies(customKeyword, c)
  }

  const handleCustomSearch = () => {
    if (!customKeyword.trim()) return
    setSelectedSegment(null)
    fetchTopCompanies(customKeyword.trim(), city)
  }

  const getMedal = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  const getBarWidth = (count, maxCount) => {
    return Math.max((count / maxCount) * 100, 8)
  }

  const handleViewJobs = (companyName) => {
    if (onSearchCompany) {
      onSearchCompany(companyName, city)
    }
  }

  const displaySegments = showAllSegments ? SEGMENTS : SEGMENTS.slice(0, 8)

  return (
    <div>
      <h2 className="section-title">🏆 Top Hirers</h2>
      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '16px' }}>
        Discover which companies are hiring the most right now. Real-time data.
      </p>

      {/* Custom Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px' }}>
          <span>🔍</span>
          <input type="text" placeholder="Or type any role: React, Data Science..." value={customKeyword}
            onChange={e => setCustomKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSearch()}
            style={{ flex: 1, padding: '10px 8px', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
        </div>
        <button onClick={handleCustomSearch}
          style={{ padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
          Go
        </button>
      </div>

      {/* Segment Chips */}
      <div style={{ marginBottom: '14px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Pick a segment</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {displaySegments.map(seg => (
            <button key={seg.tag} onClick={() => handleSegmentClick(seg)}
              style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer', transition: 'all 0.3s',
                background: selectedSegment?.tag === seg.tag ? 'var(--accent)' : 'var(--surface)',
                border: '1px solid ' + (selectedSegment?.tag === seg.tag ? 'var(--accent)' : 'var(--border)'),
                color: selectedSegment?.tag === seg.tag ? 'white' : 'var(--text2)'
              }}>
              {seg.label}
            </button>
          ))}
          <button onClick={() => setShowAllSegments(!showAllSegments)}
            style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
            {showAllSegments ? 'Show Less ▲' : `+${SEGMENTS.length - 8} More ▼`}
          </button>
        </div>
      </div>

      {/* City Filter */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Filter by city</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {CITIES.map(c => (
            <button key={c} onClick={() => handleCityChange(c)}
              style={{
                padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '500',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer', transition: 'all 0.3s',
                background: city === c ? '#2D8A4E' : 'var(--surface)',
                border: '1px solid ' + (city === c ? '#2D8A4E' : 'var(--border)'),
                color: city === c ? 'white' : 'var(--text2)'
              }}>
              {c === 'All India' ? '🇮🇳 ' : '📍 '}{c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {!searched && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</p>
          <p style={{ fontSize: '0.88rem' }}>Select a segment or type a role to see top hiring companies</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '30px', height: '30px' }}></div>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Finding top hirers...</p>
        </div>
      )}

      {searched && !loading && companies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🤷</p>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>No companies found for this combination. Try a different segment or city.</p>
        </div>
      )}

      {searched && !loading && companies.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
              Top {companies.length} companies hiring <strong style={{ color: 'var(--accent)' }}>{selectedSegment?.label || customKeyword}</strong> in <strong style={{ color: '#2D8A4E' }}>{city}</strong>
            </p>
          </div>

          {companies.map((comp, i) => {
            const maxCount = companies[0]?.count || 1
            const name = comp.canonical_name || 'Unknown'
            return (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
                padding: '16px', marginBottom: '10px', animation: 'slideUp 0.3s ease',
                animationDelay: `${i * 0.05}s`, animationFillMode: 'both'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getMedal(i)}</span>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? 'var(--accent)' : i === 1 ? '#6366f1' : i === 2 ? '#2D8A4E' : 'var(--surface2)',
                      color: i < 3 ? 'white' : 'var(--text2)', fontWeight: '700', fontSize: '0.9rem'
                    }}>
                      {name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text)' }}>{name}</h3>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{selectedSegment?.label || customKeyword} roles</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.3rem', fontWeight: '800', fontFamily: 'Cormorant Garamond, serif',
                      color: i === 0 ? 'var(--accent)' : i === 1 ? '#6366f1' : i === 2 ? '#2D8A4E' : 'var(--text)'
                    }}>
                      {comp.count.toLocaleString()}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>openings</p>
                  </div>
                </div>

                {/* Bar */}
                <div style={{ width: '100%', height: '6px', background: 'var(--surface2)', borderRadius: '3px', marginBottom: '10px' }}>
                  <div style={{
                    width: `${getBarWidth(comp.count, maxCount)}%`, height: '100%', borderRadius: '3px',
                    background: i === 0 ? 'var(--accent)' : i === 1 ? '#6366f1' : i === 2 ? '#2D8A4E' : 'var(--text2)',
                    transition: 'width 0.6s ease'
                  }}></div>
                </div>

                <button onClick={() => handleViewJobs(name)}
                  style={{
                    width: '100%', padding: '9px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text)', fontSize: '0.8rem', fontWeight: '600',
                    fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}>
                  🔍 View {name} Jobs →
                </button>
              </div>
            )
          })}

          <p style={{ fontSize: '0.62rem', color: 'var(--text2)', textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>
            Data from Adzuna. Shows current openings at time of search.
          </p>
        </div>
      )}
    </div>
  )
}