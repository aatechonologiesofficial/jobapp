import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import CVBuilder from './CVBuilder'
import MockInterview from './MockInterview'
import CoverLetter from './CoverLetter'
import SkillGap from './SkillGap'
import CareerQuiz from './CareerQuiz'
import ATSScanner from './ATSScanner'
import LinkedInOptimizer from './LinkedInOptimizer'
import JDDecoder from './JDDecoder'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function Dashboard({ user }) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('search')
  const [savedJobs, setSavedJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('relevance')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [source, setSource] = useState('all')
  const [avatarPhase, setAvatarPhase] = useState('idle')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [showSkillGap, setShowSkillGap] = useState(false)
  const [showJDDecoder, setShowJDDecoder] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const searchJobs = async (pageNum = 1) => {
    setLoading(true)
    setSearched(true)
    setPage(pageNum)
    setAvatarPhase('checking')
    setAvatarMessage('')
    try {
      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      if (location) params.append('location', location)
      if (salaryMin) params.append('salary_min', salaryMin)
      if (salaryMax) params.append('salary_max', salaryMax)
      if (sortBy) params.append('sort', sortBy)
      if (source) params.append('source', source)
      params.append('page', pageNum)
      const res = await fetch(`${API_URL}/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setTimeout(() => {
        if (data.jobs && data.jobs.length > 0) {
          setAvatarPhase('answering')
          setAvatarMessage(`Commander, I found ${(data.total || 0).toLocaleString()} jobs for you!`)
        } else {
          setAvatarPhase('answering')
          setAvatarMessage('No jobs found, Commander. Try different keywords.')
        }
      }, 2500)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Search failed:', err)
      setJobs([])
      setAvatarPhase('answering')
      setAvatarMessage('Something went wrong, Commander. Please try again.')
    }
    setLoading(false)
  }

  const saveJob = (job) => {
    if (!savedJobs.find(j => j.id === job.id)) setSavedJobs([...savedJobs, job])
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return null
    const fmt = (n) => { if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}` }
    if (min && max) return `${fmt(min)} - ${fmt(max)}`
    if (min) return `From ${fmt(min)}`
    if (max) return `Up to ${fmt(max)}`
  }

  const timeAgo = (date) => {
    if (!date) return ''
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  const logout = async () => { await supabase.auth.signOut() }

  const salaryPresets = [
    { label: 'Any', min: '', max: '' }, { label: '3L+', min: '300000', max: '' }, { label: '5L+', min: '500000', max: '' },
    { label: '10L+', min: '1000000', max: '' }, { label: '20L+', min: '2000000', max: '' }, { label: '50L+', min: '5000000', max: '' },
  ]

  const sourceOptions = [
    { value: 'all', label: '🌐 All' }, { value: 'adzuna', label: '🇮🇳 Adzuna' },
    { value: 'careerjet', label: '🇮🇳 CareerJet' }, { value: 'remotive', label: '🌍 Remote' },
  ]

  const getSourceLabel = (src) => ({ adzuna: 'Adzuna', careerjet: 'CareerJet', remotive: 'Remote', arbeitnow: 'Arbeitnow', himalayas: 'Himalayas' }[src] || src)
  const getSourceColor = (src) => ({ adzuna: '#D4900D', careerjet: '#2D8A4E', remotive: '#6366f1', arbeitnow: '#0891b2', himalayas: '#9333ea' }[src] || '#888')

  return (
    <div className="dashboard">
      <div className="dash-bg"><div className="orb orb-1"></div><div className="orb orb-2"></div></div>

      <header className="dash-header">
        <div className="header-left"><span className="brand-mini">⚡ JobApp</span></div>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="dash-nav">
        <button className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>🔍 Search</button>
        <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>💾 Saved</button>
        <button className={`nav-tab ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>📝 CV</button>
        <button className={`nav-tab ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>🎤 Interview</button>
        <button className={`nav-tab ${activeTab === 'career' ? 'active' : ''}`} onClick={() => setActiveTab('career')}>🧭 Career</button>
        <button className={`nav-tab ${activeTab === 'ats' ? 'active' : ''}`} onClick={() => setActiveTab('ats')}>📊 ATS</button>
        <button className={`nav-tab ${activeTab === 'linkedin' ? 'active' : ''}`} onClick={() => setActiveTab('linkedin')}>💼 LinkedIn</button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
      </nav>

      {activeTab === 'search' && (
        <main className="dash-main">
          <Avatar message={avatarMessage} phase={avatarPhase} keyword={keyword} location={location} />
          <div className="search-hero"><h2>Find Your Next Mission 🚀</h2><p>Search real jobs across India</p></div>

          <div className="search-bar">
            <div className="search-input-wrap"><span>🔍</span>
              <input type="text" placeholder="Job title, skill, or keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchJobs(1)} />
            </div>
            <div className="search-input-wrap"><span>📍</span>
              <input type="text" placeholder="City name" value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchJobs(1)} />
            </div>
            <button className="btn-search" onClick={() => searchJobs(1)} disabled={loading}>{loading ? '...' : 'Search'}</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {sourceOptions.map(opt => (
              <button key={opt.value} onClick={() => { setSource(opt.value); if (searched) searchJobs(1); }}
                style={{ padding: '8px 16px', background: source === opt.value ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (source === opt.value ? 'var(--accent)' : 'var(--border)'), borderRadius: '20px', color: source === opt.value ? 'white' : 'var(--text2)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '8px 20px', background: showFilters ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', color: showFilters ? 'white' : 'var(--text2)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ⚙️ Filters {showFilters ? '▲' : '▼'}
            </button>
          </div>

          {showFilters && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px', animation: 'slideUp 0.3s ease' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Sort By</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[{ value: 'relevance', label: 'Relevance' }, { value: 'date', label: 'Newest' }, { value: 'salary', label: 'Salary' }].map(opt => (
                    <button key={opt.value} onClick={() => setSortBy(opt.value)}
                      style={{ padding: '8px 14px', background: sortBy === opt.value ? 'var(--accent)' : 'var(--surface2)', border: '1px solid ' + (sortBy === opt.value ? 'var(--accent)' : 'var(--border)'), borderRadius: '8px', color: sortBy === opt.value ? 'white' : 'var(--text2)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '500' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Salary</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {salaryPresets.map(p => (
                    <button key={p.label} onClick={() => { setSalaryMin(p.min); setSalaryMax(p.max); }}
                      style={{ padding: '8px 14px', background: salaryMin === p.min ? 'var(--accent)' : 'var(--surface2)', border: '1px solid ' + (salaryMin === p.min ? 'var(--accent)' : 'var(--border)'), borderRadius: '8px', color: salaryMin === p.min ? 'white' : 'var(--text2)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '500' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => searchJobs(1)} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.88rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>Apply Filters</button>
            </div>
          )}

          {!searched && <div className="no-results"><p>🔍 Search for jobs to get started!</p><p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.6 }}>Try "developer" in "hyderabad"</p></div>}
          {searched && !loading && <div className="results-count">Found <strong>{total.toLocaleString()}</strong> jobs — Page {page} of {Math.ceil(total / 20)}</div>}
          {loading && <div className="no-results"><div className="spinner" style={{ margin: '0 auto 16px', width: '30px', height: '30px' }}></div><p>Searching jobs...</p></div>}

          <div className="job-grid">
            {jobs.map((job, i) => (
              <div key={job.id} className="job-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="job-card-top">
                  <div className="company-info">
                    <div className="company-avatar">{(job.company || '?')[0].toUpperCase()}</div>
                    <div><h3 className="job-title">{job.title}</h3><p className="company-name">{job.company}</p></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: job.trust_color || '#888', fontFamily: 'Cormorant Garamond, serif' }}>{job.trust_score || '--'}</div>
                    <div style={{ fontSize: '0.65rem', color: job.trust_color || '#888', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>{job.trust_label || 'N/A'}</div>
                  </div>
                </div>
                <div className="job-tags">
                  <span className="tag">📍 {job.location}</span>
                  <span className="tag" style={{ color: getSourceColor(job.source), fontWeight: '600' }}>📡 {getSourceLabel(job.source)}</span>
                  {job.category && <span className="tag">💼 {job.category}</span>}
                  <span className="tag">🕐 {timeAgo(job.posted_at)}</span>
                  {formatSalary(job.salary_min, job.salary_max) && <span className="tag salary-tag">{formatSalary(job.salary_min, job.salary_max)}</span>}
                </div>
                {job.description && <p className="job-desc">{job.description}</p>}
                <div className="job-card-actions">
                  <button className="btn-apply" onClick={() => window.open(job.url, '_blank')}>Apply →</button>
                  <button className="btn-save" onClick={() => saveJob(job)}>{savedJobs.find(j => j.id === job.id) ? '✅' : '💾'}</button>
                  <button className="btn-save" onClick={() => { setSelectedJob(job); setShowCoverLetter(true) }} style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>✉️</button>
                  <button className="btn-save" onClick={() => { setSelectedJob(job); setShowSkillGap(true) }} style={{ color: '#6366f1', borderColor: '#6366f1' }}>🎯</button>
                  <button className="btn-save" onClick={() => { setSelectedJob(job); setShowJDDecoder(true) }} style={{ color: '#D4900D', borderColor: '#D4900D' }}>🔍</button>
                </div>
              </div>
            ))}
          </div>

          {searched && !loading && jobs.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', marginBottom: '20px' }}>
              <button className="btn-search" style={{ padding: '10px 20px', opacity: page <= 1 ? 0.4 : 1 }} disabled={page <= 1} onClick={() => searchJobs(page - 1)}>← Prev</button>
              <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: '500' }}>Page {page}/{Math.ceil(total / 20)}</span>
              <button className="btn-search" style={{ padding: '10px 20px', opacity: page >= Math.ceil(total / 20) ? 0.4 : 1 }} disabled={page >= Math.ceil(total / 20)} onClick={() => searchJobs(page + 1)}>Next →</button>
            </div>
          )}
          {searched && !loading && jobs.length === 0 && <div className="no-results"><p>No jobs found. Try different keywords.</p></div>}
        </main>
      )}

      {activeTab === 'saved' && (
        <main className="dash-main">
          <h2 className="section-title">Saved Jobs 💾</h2>
          {savedJobs.length === 0 ? <div className="no-results"><p>No saved jobs yet.</p></div> : (
            <div className="job-grid">
              {savedJobs.map((job, i) => (
                <div key={job.id} className="job-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="job-card-top">
                    <div className="company-info">
                      <div className="company-avatar">{(job.company || '?')[0].toUpperCase()}</div>
                      <div><h3 className="job-title">{job.title}</h3><p className="company-name">{job.company}</p></div>
                    </div>
                  </div>
                  <div className="job-tags">
                    <span className="tag">📍 {job.location}</span>
                    {formatSalary(job.salary_min, job.salary_max) && <span className="tag salary-tag">{formatSalary(job.salary_min, job.salary_max)}</span>}
                  </div>
                  <div className="job-card-actions">
                    <button className="btn-apply" onClick={() => window.open(job.url, '_blank')}>Apply →</button>
                    <button className="btn-save" onClick={() => { setSelectedJob(job); setShowCoverLetter(true) }} style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>✉️</button>
                    <button className="btn-save" onClick={() => { setSelectedJob(job); setShowSkillGap(true) }} style={{ color: '#6366f1', borderColor: '#6366f1' }}>🎯</button>
                    <button className="btn-save" onClick={() => { setSelectedJob(job); setShowJDDecoder(true) }} style={{ color: '#D4900D', borderColor: '#D4900D' }}>🔍</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {activeTab === 'cv' && <main className="dash-main"><CVBuilder /></main>}
      {activeTab === 'interview' && <main className="dash-main"><MockInterview /></main>}
      {activeTab === 'career' && <main className="dash-main"><CareerQuiz /></main>}
      {activeTab === 'ats' && <main className="dash-main"><ATSScanner /></main>}
      {activeTab === 'linkedin' && <main className="dash-main"><LinkedInOptimizer /></main>}

      {activeTab === 'profile' && (
        <main className="dash-main">
          <h2 className="section-title">Your Profile 👤</h2>
          <div className="profile-card">
            <div className="profile-avatar">⚡</div>
            <h3>{user.email}</h3>
            <p className="profile-status">Commander Status: Active</p>
            <div className="profile-stats">
              <div className="stat"><strong>{savedJobs.length}</strong><span>Saved</span></div>
              <div className="stat"><strong>0</strong><span>Applied</span></div>
              <div className="stat"><strong>0</strong><span>Interviews</span></div>
            </div>
          </div>
        </main>
      )}

      {showCoverLetter && selectedJob && <CoverLetter job={selectedJob} onClose={() => setShowCoverLetter(false)} />}
      {showSkillGap && selectedJob && <SkillGap job={selectedJob} onClose={() => setShowSkillGap(false)} />}
      {showJDDecoder && selectedJob && <JDDecoder job={selectedJob} onClose={() => setShowJDDecoder(false)} />}
    </div>
  )
}