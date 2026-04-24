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
import CompanyDive from './CompanyDive'
import OfferAnalyzer from './OfferAnalyzer'
import JobCompare from './JobCompare'
import TopHirers from './TopHirers'
import SpeedLearn from './SpeedLearn'

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
  const [showCompanyDive, setShowCompanyDive] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [compareJobs, setCompareJobs] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [shortlistedJobs, setShortlistedJobs] = useState([])

  const searchJobs = async (pageNum = 1, overrideKeyword, overrideLocation) => {
    setLoading(true); setSearched(true); setPage(pageNum); setAvatarPhase('checking'); setAvatarMessage('')
    try {
      const params = new URLSearchParams()
      const kw = overrideKeyword || keyword
      const loc = overrideLocation || location
      if (kw) params.append('keyword', kw)
      if (loc) params.append('location', loc)
      if (salaryMin) params.append('salary_min', salaryMin)
      if (salaryMax) params.append('salary_max', salaryMax)
      if (sortBy) params.append('sort', sortBy)
      if (source) params.append('source', source)
      params.append('page', pageNum)
      const res = await fetch(`${API_URL}/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || []); setTotal(data.total || 0)
      setTimeout(() => { if (data.jobs?.length > 0) { setAvatarPhase('answering'); setAvatarMessage(`Commander, I found ${(data.total || 0).toLocaleString()} jobs for you!`) } else { setAvatarPhase('answering'); setAvatarMessage('No jobs found, Commander. Try different keywords.') } }, 2500)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) { setJobs([]); setAvatarPhase('answering'); setAvatarMessage('Something went wrong, Commander.') }
    setLoading(false)
  }

  const handleCompanySearch = async (name, city) => {
    setKeyword(name); const loc = city && city !== 'All India' ? city : ''; if (loc) setLocation(loc); else setLocation(''); setActiveTab('search'); setLoading(true); setSearched(true); setAvatarPhase('checking')
    try {
      const params = new URLSearchParams(); params.append('keyword', name); if (loc) params.append('location', loc); params.append('page', 1)
      const res = await fetch(`${API_URL}/api/jobs?${params}`); const data = await res.json()
      const allJobs = data.jobs || []; const companyJobs = allJobs.filter(j => j.company && j.company.toLowerCase().includes(name.toLowerCase()))
      const finalJobs = companyJobs.length > 0 ? companyJobs : allJobs; setJobs(finalJobs); setTotal(finalJobs.length); setPage(1)
      setTimeout(() => { setAvatarPhase('answering'); if (companyJobs.length > 0) { setAvatarMessage(`Commander, found ${companyJobs.length} jobs at ${name}${loc ? ' in ' + loc : ''}!`) } else { setAvatarMessage(`No exact ${name} jobs found. Showing related results.`) } }, 1500)
    } catch (e) { setJobs([]); setAvatarPhase('answering'); setAvatarMessage('Something went wrong, Commander.') }
    setLoading(false)
  }

  const saveJob = (job) => { if (!savedJobs.find(j => j.id === job.id)) setSavedJobs([...savedJobs, job]) }

  const toggleCompare = (job) => {
    const exists = compareJobs.find(j => j.id === job.id)
    if (exists) { setCompareJobs(compareJobs.filter(j => j.id !== job.id)) }
    else if (compareJobs.length < 3) { setCompareJobs([...compareJobs, job]) }
    else { if (!shortlistedJobs.find(j => j.id === job.id)) { setShortlistedJobs([...shortlistedJobs, job]) }; alert('Compare limit is 3 jobs. This job has been moved to your Shortlist!') }
  }

  const formatSalary = (min, max) => { if (!min && !max) return null; const fmt = (n) => { if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}` }; if (min && max) return `${fmt(min)} - ${fmt(max)}`; if (min) return `From ${fmt(min)}`; if (max) return `Up to ${fmt(max)}` }
  const timeAgo = (date) => { if (!date) return ''; const diff = Date.now() - new Date(date).getTime(); const days = Math.floor(diff / 86400000); if (days === 0) return 'Today'; if (days === 1) return 'Yesterday'; if (days < 30) return `${days}d ago`; return `${Math.floor(days / 30)}mo ago` }
  const logout = async () => { await supabase.auth.signOut() }
  const salaryPresets = [{ label: 'Any', min: '', max: '' }, { label: '3L+', min: '300000', max: '' }, { label: '5L+', min: '500000', max: '' }, { label: '10L+', min: '1000000', max: '' }, { label: '20L+', min: '2000000', max: '' }, { label: '50L+', min: '5000000', max: '' }]
  const sourceOptions = [{ value: 'all', label: 'All' }, { value: 'adzuna', label: 'Adzuna' }, { value: 'careerjet', label: 'CareerJet' }, { value: 'remotive', label: 'Remote' }]
  const getSourceLabel = (s) => ({ adzuna: 'Adzuna', careerjet: 'CareerJet', remotive: 'Remote', arbeitnow: 'Arbeitnow', himalayas: 'Himalayas' }[s] || s)
  const getSourceColor = (s) => ({ adzuna: '#D4900D', careerjet: '#2D8A4E', remotive: '#6366f1', arbeitnow: '#0891b2', himalayas: '#9333ea' }[s] || '#888')

  const renderJobCard = (job, i, showCheck = true) => (
    <div key={job.id} className="job-card" style={{ animationDelay: `${i * 0.05}s`, border: compareJobs.find(j => j.id === job.id) ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
      <div className="job-card-top">
        <div className="company-info">
          {showCheck && (<div onClick={() => toggleCompare(job)} style={{ width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0, cursor: 'pointer', transition: 'all 0.3s', border: '2px solid ' + (compareJobs.find(j => j.id === job.id) ? 'var(--accent)' : 'var(--border)'), background: compareJobs.find(j => j.id === job.id) ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{compareJobs.find(j => j.id === job.id) && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>✓</span>}</div>)}
          <div className="company-avatar">{(job.company || '?')[0].toUpperCase()}</div>
          <div><h3 className="job-title">{job.title}</h3><p className="company-name">{job.company}</p></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: job.trust_color || '#888', fontFamily: 'Cormorant Garamond, serif' }}>{job.trust_score || '--'}</div>
          <div style={{ fontSize: '0.65rem', color: job.trust_color || '#888', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>{job.trust_label || 'N/A'}</div>
        </div>
      </div>
      <div className="job-tags">
        <span className="tag">{job.location}</span>
        <span className="tag" style={{ color: getSourceColor(job.source), fontWeight: '600' }}>{getSourceLabel(job.source)}</span>
        {job.category && <span className="tag">{job.category}</span>}
        <span className="tag">{timeAgo(job.posted_at)}</span>
        {formatSalary(job.salary_min, job.salary_max) && <span className="tag salary-tag">{formatSalary(job.salary_min, job.salary_max)}</span>}
      </div>
      {job.description && <p className="job-desc">{job.description}</p>}
      <div className="job-card-actions">
        <button className="btn-apply" onClick={() => window.open(job.url, '_blank')}>Apply →</button>
        <button className="btn-save" onClick={() => saveJob(job)}>{savedJobs.find(j => j.id === job.id) ? '✅' : '💾'}</button>
        <button className="btn-save" onClick={() => { setSelectedJob(job); setShowCoverLetter(true) }} style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>✉️</button>
        <button className="btn-save" onClick={() => { setSelectedJob(job); setShowSkillGap(true) }} style={{ color: '#6366f1', borderColor: '#6366f1' }}>🎯</button>
        <button className="btn-save" onClick={() => { setSelectedJob(job); setShowJDDecoder(true) }} style={{ color: '#D4900D', borderColor: '#D4900D' }}>🔍</button>
        <button className="btn-save" onClick={() => { setSelectedJob(job); setShowCompanyDive(true) }} style={{ color: '#2D8A4E', borderColor: '#2D8A4E' }}>🏢</button>
      </div>
    </div>
  )

  return (
    <div className="dashboard">
      <div className="dash-bg"><div className="orb orb-1"></div><div className="orb orb-2"></div></div>
      <header className="dash-header">
        <div className="header-left"><span className="brand-mini">⚡ JobApp</span></div>
        <div className="header-right"><span className="user-email">{user.email}</span><button className="btn-logout" onClick={logout}>Logout</button></div>
      </header>

      <nav className="dash-nav">
        <button className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>🔍 Search</button>
        <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>💾 Saved</button>
        <button className={`nav-tab ${activeTab === 'shortlist' ? 'active' : ''}`} onClick={() => setActiveTab('shortlist')}>📋 Shortlist</button>
        <button className={`nav-tab ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>📝 CV</button>
        <button className={`nav-tab ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>🎤 Interview</button>
        <button className={`nav-tab ${activeTab === 'career' ? 'active' : ''}`} onClick={() => setActiveTab('career')}>🧭 Career</button>
        <button className={`nav-tab ${activeTab === 'ats' ? 'active' : ''}`} onClick={() => setActiveTab('ats')}>📊 ATS</button>
        <button className={`nav-tab ${activeTab === 'linkedin' ? 'active' : ''}`} onClick={() => setActiveTab('linkedin')}>💼 LinkedIn</button>
        <button className={`nav-tab ${activeTab === 'offer' ? 'active' : ''}`} onClick={() => setActiveTab('offer')}>📋 Offer</button>
        <button className={`nav-tab ${activeTab === 'hirers' ? 'active' : ''}`} onClick={() => setActiveTab('hirers')}>🏆 Hirers</button>
        <button className={`nav-tab ${activeTab === 'learn' ? 'active' : ''}`} onClick={() => setActiveTab('learn')}>📚 Learn</button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
      </nav>

      {activeTab === 'search' && (
        <main className="dash-main">
          <Avatar message={avatarMessage} phase={avatarPhase} keyword={keyword} location={location} />
          <div className="search-hero"><h2>Find Your Next Mission 🚀</h2><p>Search real jobs across India</p></div>
          <div className="search-bar">
            <div className="search-input-wrap"><span>🔍</span><input type="text" placeholder="Job title, skill, or keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchJobs(1)} /></div>
            <div className="search-input-wrap"><span>📍</span><input type="text" placeholder="City name" value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchJobs(1)} /></div>
            <button className="btn-search" onClick={() => searchJobs(1)} disabled={loading}>{loading ? '...' : 'Search'}</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {sourceOptions.map(opt => (<button key={opt.value} onClick={() => { setSource(opt.value); if (searched) searchJobs(1) }} style={{ padding: '8px 16px', background: source === opt.value ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (source === opt.value ? 'var(--accent)' : 'var(--border)'), borderRadius: '20px', color: source === opt.value ? 'white' : 'var(--text2)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600' }}>{opt.label}</button>))}
          </div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '8px 20px', background: showFilters ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', color: showFilters ? 'white' : 'var(--text2)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600' }}>Filters {showFilters ? '▲' : '▼'}</button>
          </div>
          {showFilters && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Sort By</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[{ value: 'relevance', label: 'Relevance' }, { value: 'date', label: 'Newest' }, { value: 'salary', label: 'Salary' }].map(opt => (<button key={opt.value} onClick={() => setSortBy(opt.value)} style={{ padding: '8px 14px', background: sortBy === opt.value ? 'var(--accent)' : 'var(--surface2)', border: '1px solid ' + (sortBy === opt.value ? 'var(--accent)' : 'var(--border)'), borderRadius: '8px', color: sortBy === opt.value ? 'white' : 'var(--text2)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>{opt.label}</button>))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Salary</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {salaryPresets.map(p => (<button key={p.label} onClick={() => { setSalaryMin(p.min); setSalaryMax(p.max) }} style={{ padding: '8px 14px', background: salaryMin === p.min ? 'var(--accent)' : 'var(--surface2)', border: '1px solid ' + (salaryMin === p.min ? 'var(--accent)' : 'var(--border)'), borderRadius: '8px', color: salaryMin === p.min ? 'white' : 'var(--text2)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>{p.label}</button>))}
                </div>
              </div>
              <button onClick={() => searchJobs(1)} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.88rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Apply Filters</button>
            </div>
          )}
          {!searched && <div className="no-results"><p>🔍 Search for jobs to get started!</p></div>}
          {searched && !loading && <div className="results-count">Found <strong>{total.toLocaleString()}</strong> jobs — Page {page}/{Math.ceil(total / 20) || 1}</div>}
          {loading && <div className="no-results"><div className="spinner" style={{ margin: '0 auto 16px', width: '30px', height: '30px' }}></div><p>Searching...</p></div>}
          {searched && !loading && jobs.length > 0 && <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '12px' }}>Tap checkbox to compare (max 3) {compareJobs.length > 0 && <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{compareJobs.length} selected</span>}</p>}
          <div className="job-grid">{jobs.map((job, i) => renderJobCard(job, i, true))}</div>
          {searched && !loading && jobs.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', marginBottom: '20px' }}>
              <button className="btn-search" style={{ padding: '10px 20px', opacity: page <= 1 ? 0.4 : 1 }} disabled={page <= 1} onClick={() => searchJobs(page - 1)}>← Prev</button>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>Page {page}/{Math.ceil(total / 20) || 1}</span>
              <button className="btn-search" style={{ padding: '10px 20px', opacity: page >= Math.ceil(total / 20) ? 0.4 : 1 }} disabled={page >= Math.ceil(total / 20)} onClick={() => searchJobs(page + 1)}>Next →</button>
            </div>
          )}
          {searched && !loading && jobs.length === 0 && <div className="no-results"><p>No jobs found. Try different keywords.</p></div>}
        </main>
      )}

      {activeTab === 'saved' && (<main className="dash-main"><h2 className="section-title">Saved Jobs 💾</h2>{savedJobs.length === 0 ? <div className="no-results"><p>No saved jobs yet.</p></div> : <div className="job-grid">{savedJobs.map((job, i) => renderJobCard(job, i, true))}</div>}</main>)}

      {activeTab === 'shortlist' && (<main className="dash-main"><h2 className="section-title">Shortlisted Jobs 📋</h2>{shortlistedJobs.length === 0 ? <div className="no-results"><p>No shortlisted jobs yet.</p></div> : <><div className="job-grid">{shortlistedJobs.map((job, i) => renderJobCard(job, i, true))}</div><button onClick={() => { setShortlistedJobs([]); setCompareJobs([]) }} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Clear Shortlist</button></>}</main>)}

      {activeTab === 'cv' && <main className="dash-main"><CVBuilder /></main>}
      {activeTab === 'interview' && <main className="dash-main"><MockInterview /></main>}
      {activeTab === 'career' && <main className="dash-main"><CareerQuiz /></main>}
      {activeTab === 'ats' && <main className="dash-main"><ATSScanner /></main>}
      {activeTab === 'linkedin' && <main className="dash-main"><LinkedInOptimizer /></main>}
      {activeTab === 'offer' && <main className="dash-main"><OfferAnalyzer /></main>}
      {activeTab === 'hirers' && <main className="dash-main"><TopHirers onSearchCompany={handleCompanySearch} /></main>}
      {activeTab === 'learn' && <main className="dash-main"><SpeedLearn /></main>}

      {activeTab === 'profile' && (<main className="dash-main"><h2 className="section-title">Your Profile 👤</h2><div className="profile-card"><div className="profile-avatar">⚡</div><h3>{user.email}</h3><p className="profile-status">Commander Status: Active</p><div className="profile-stats"><div className="stat"><strong>{savedJobs.length}</strong><span>Saved</span></div><div className="stat"><strong>{shortlistedJobs.length}</strong><span>Shortlisted</span></div><div className="stat"><strong>0</strong><span>Applied</span></div></div></div></main>)}

      {compareJobs.length >= 2 && !showCompare && (<div style={{ position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', borderRadius: '16px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 50, boxShadow: '0 8px 30px rgba(200,158,83,0.4)', maxWidth: '90%' }}><span style={{ color: 'white', fontSize: '0.88rem', fontWeight: '600' }}>{compareJobs.length} jobs selected</span><button onClick={() => setShowCompare(true)} style={{ padding: '8px 20px', background: 'white', border: 'none', borderRadius: '10px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Compare Now</button><button onClick={() => setCompareJobs([])} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕</button></div>)}

      {showCoverLetter && selectedJob && <CoverLetter job={selectedJob} onClose={() => setShowCoverLetter(false)} />}
      {showSkillGap && selectedJob && <SkillGap job={selectedJob} onClose={() => setShowSkillGap(false)} />}
      {showJDDecoder && selectedJob && <JDDecoder job={selectedJob} onClose={() => setShowJDDecoder(false)} />}
      {showCompanyDive && selectedJob && <CompanyDive job={selectedJob} onClose={() => setShowCompanyDive(false)} />}
      {showCompare && compareJobs.length >= 2 && <JobCompare jobs={compareJobs} onClose={() => setShowCompare(false)} />}
    </div>
  )
}