import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import CVBuilder from './CVBuilder'

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

  const searchJobs = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      if (location) params.append('location', location)
      const res = await fetch(`${API_URL}/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Search failed:', err)
      setJobs([])
    }
    setLoading(false)
  }

  const saveJob = (job) => {
    if (!savedJobs.find(j => j.id === job.id)) {
      setSavedJobs([...savedJobs, job])
    }
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return null
    const fmt = (n) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
      if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
      return `₹${n}`
    }
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

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="dashboard">
      <div className="dash-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <header className="dash-header">
        <div className="header-left">
          <span className="brand-mini">⚡ JobApp</span>
        </div>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="dash-nav">
        <button className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          🔍 Search
        </button>
        <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          💾 Saved ({savedJobs.length})
        </button>
        <button className={`nav-tab ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>
          📝 CV
        </button>
        <button className={`nav-tab ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => setActiveTab('applied')}>
          📨 Applied
        </button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
      </nav>

      {activeTab === 'search' && (
        <main className="dash-main">
          <Avatar message={jobs.length > 0 ? `Commander, I found ${total.toLocaleString()} jobs for you!` : searched && !loading ? 'No jobs found, Commander. Try different keywords.' : ''} />

          <div className="search-hero">
            <h2>Find Your Next Mission 🚀</h2>
            <p>Search real jobs across India</p>
          </div>

          <div className="search-bar">
            <div className="search-input-wrap">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Job title, skill, or keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
              />
            </div>
            <div className="search-input-wrap">
              <span>📍</span>
              <input
                type="text"
                placeholder="City name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
              />
            </div>
            <button className="btn-search" onClick={searchJobs} disabled={loading}>
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {!searched && (
            <div className="no-results">
              <p>🔍 Search for jobs to get started!</p>
              <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.6 }}>Try "developer" in "hyderabad"</p>
            </div>
          )}

          {searched && !loading && (
            <div className="results-count">
              Found <strong>{total.toLocaleString()}</strong> jobs
            </div>
          )}

          {loading && (
            <div className="no-results">
              <div className="spinner" style={{ margin: '0 auto 16px', width: '30px', height: '30px' }}></div>
              <p>Searching jobs...</p>
            </div>
          )}

          <div className="job-grid">
            {jobs.map((job, i) => (
              <div key={job.id} className="job-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="job-card-top">
                  <div className="company-info">
                    <div className="company-avatar">{(job.company || '?')[0].toUpperCase()}</div>
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <p className="company-name">{job.company}</p>
                    </div>
                  </div>
                  <span className="time-ago">{timeAgo(job.posted_at)}</span>
                </div>
                <div className="job-tags">
                  <span className="tag">📍 {job.location}</span>
                  {job.category && <span className="tag">💼 {job.category}</span>}
                  {formatSalary(job.salary_min, job.salary_max) && (
                    <span className="tag salary-tag">{formatSalary(job.salary_min, job.salary_max)}</span>
                  )}
                </div>
                {job.description && (
                  <p className="job-desc">{job.description}</p>
                )}
                <div className="job-card-actions">
                  <button className="btn-apply" onClick={() => window.open(job.url, '_blank')}>
                    Apply Now →
                  </button>
                  <button className="btn-save" onClick={() => saveJob(job)}>
                    {savedJobs.find(j => j.id === job.id) ? '✅ Saved' : '💾 Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {searched && !loading && jobs.length === 0 && (
            <div className="no-results">
              <p>No jobs found. Try different keywords.</p>
            </div>
          )}
        </main>
      )}

      {activeTab === 'saved' && (
        <main className="dash-main">
          <h2 className="section-title">Saved Jobs 💾</h2>
          {savedJobs.length === 0 ? (
            <div className="no-results"><p>No saved jobs yet. Search and save jobs you like!</p></div>
          ) : (
            <div className="job-grid">
              {savedJobs.map((job, i) => (
                <div key={job.id} className="job-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="job-card-top">
                    <div className="company-info">
                      <div className="company-avatar">{(job.company || '?')[0].toUpperCase()}</div>
                      <div>
                        <h3 className="job-title">{job.title}</h3>
                        <p className="company-name">{job.company}</p>
                      </div>
                    </div>
                  </div>
                  <div className="job-tags">
                    <span className="tag">📍 {job.location}</span>
                    {formatSalary(job.salary_min, job.salary_max) && (
                      <span className="tag salary-tag">{formatSalary(job.salary_min, job.salary_max)}</span>
                    )}
                  </div>
                  <div className="job-card-actions">
                    <button className="btn-apply" onClick={() => window.open(job.url, '_blank')}>Apply Now →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {activeTab === 'cv' && (
        <main className="dash-main">
          <CVBuilder />
        </main>
      )}

      {activeTab === 'applied' && (
        <main className="dash-main">
          <h2 className="section-title">Applied Jobs 📨</h2>
          <div className="no-results"><p>No applications yet. Start applying to jobs!</p></div>
        </main>
      )}

      {activeTab === 'profile' && (
        <main className="dash-main">
          <h2 className="section-title">Your Profile 👤</h2>
          <div className="profile-card">
            <div className="profile-avatar">⚡</div>
            <h3>{user.email}</h3>
            <p className="profile-status">Commander Status: Active</p>
            <div className="profile-stats">
              <div className="stat">
                <strong>{savedJobs.length}</strong>
                <span>Saved</span>
              </div>
              <div className="stat">
                <strong>0</strong>
                <span>Applied</span>
              </div>
              <div className="stat">
                <strong>0</strong>
                <span>Interviews</span>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}