import { useState, useRef } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function JobCompare({ jobs, onClose }) {
  const [aiData, setAiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [savedList, setSavedList] = useState([])
  const [showSaved, setShowSaved] = useState(false)
  const [whatIfSkill, setWhatIfSkill] = useState('')
  const [whatIfActive, setWhatIfActive] = useState(false)
  const [userSkills, setUserSkills] = useState('')
  const [showSkillBox, setShowSkillBox] = useState(false)
  const [fitScores, setFitScores] = useState([])
  const touchX = useRef(0)

  if (!jobs || jobs.length < 2) return null

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/compare-jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobs }) })
      const data = await res.json()
      setAiData(data)
      if (userSkills.trim() && data.jobs_analysis) calcFit(data.jobs_analysis, userSkills)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const calcFit = (analysis, skills) => {
    const my = skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
    const scores = analysis.map(ja => {
      const jSkills = (ja.skills || []).map(s => s.toLowerCase().trim())
      if (jSkills.length === 0) return { match: 0, have: [], need: [] }
      const have = jSkills.filter(js => my.some(ms => js.includes(ms) || ms.includes(js)))
      const need = jSkills.filter(js => !my.some(ms => js.includes(ms) || ms.includes(js)))
      return { match: Math.round((have.length / jSkills.length) * 100), have, need }
    })
    setFitScores(scores)
  }

  const tryWhatIf = () => { if (!whatIfSkill.trim() || !aiData?.jobs_analysis) return; calcFit(aiData.jobs_analysis, userSkills ? userSkills + ',' + whatIfSkill : whatIfSkill); setWhatIfActive(true) }
  const resetWhatIf = () => { setWhatIfActive(false); setWhatIfSkill(''); if (aiData?.jobs_analysis && userSkills) calcFit(aiData.jobs_analysis, userSkills) }
  const saveComp = () => { setSavedList([...savedList, { id: Date.now(), date: new Date().toLocaleDateString(), jobs: jobs.map(j => ({ title: j.title, company: j.company })), aiData }]); alert('Comparison saved! ✅') }

  const fmtSal = (min, max) => { if (!min && !max) return 'Not listed'; const f = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`; if (min && max) return `${f(min)}-${f(max)}`; if (min) return `From ${f(min)}`; return `Up to ${f(max)}` }
  const ago = d => { if (!d) return '?'; const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000); return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 30 ? `${days}d ago` : `${Math.floor(days/30)}mo ago` }
  const scoreCol = s => s >= 85 ? '#2D8A4E' : s >= 70 ? '#D4900D' : s >= 50 ? '#888' : '#D14343'
  const fitCol = m => m >= 70 ? '#2D8A4E' : m >= 40 ? '#D4900D' : '#D14343'
  const modeCol = m => m?.toLowerCase().includes('remote') ? '#2D8A4E' : m?.toLowerCase().includes('hybrid') ? '#6366f1' : '#888'
  const srcLabel = s => ({ adzuna:'Adzuna', careerjet:'CareerJet', remotive:'Remote', arbeitnow:'Arbeitnow', himalayas:'Himalayas' }[s] || s)

  const bestOf = field => { let best = -1, idx = -1; if (field === 'salary') jobs.forEach((j,i) => { if ((j.salary_min||0) > best) { best = j.salary_min||0; idx = i } }); if (field === 'posted') jobs.forEach((j,i) => { const d = new Date(j.posted_at).getTime(); if (d > best) { best = d; idx = i } }); if (field === 'score') jobs.forEach((j,i) => { if ((j.trust_score||0) > best) { best = j.trust_score||0; idx = i } }); if (field === 'fit') fitScores.forEach((f,i) => { if (f.match > best) { best = f.match; idx = i } }); return best > 0 ? idx : -1 }

  const cellSt = (isBest) => ({ fontSize: '0.82rem', color: 'var(--text)', textAlign: 'center', padding: '8px 4px', borderRadius: '8px', background: isBest ? 'rgba(45,138,78,0.08)' : 'transparent', border: isBest ? '2px solid rgba(45,138,78,0.25)' : '1px solid transparent', fontWeight: isBest ? '700' : '400' })
  const grid = `85px repeat(${jobs.length}, 1fr)`

  const Row = ({ label, vals, bestIdx }) => (
    <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>{label}</div>
      {vals.map((v, i) => (<div key={i} style={cellSt(bestIdx === i)}>{bestIdx === i && <span style={{ fontSize: '0.58rem', color: '#2D8A4E', display: 'block' }}>⭐ BEST</span>}{v}</div>))}
    </div>
  )

  const SkillRow = () => {
    if (!aiData?.jobs_analysis) return null
    return (
      <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', paddingTop: '4px' }}>🛠️ Skills</div>
        {aiData.jobs_analysis.map((ja, i) => (
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', padding: '3px' }}>
            {ja.skills?.length > 0 ? ja.skills.map((s, si) => {
              const match = userSkills && userSkills.toLowerCase().split(',').some(us => s.toLowerCase().includes(us.trim()) || us.trim().toLowerCase().includes(s.toLowerCase()))
              return (<span key={si} style={{ padding: '2px 7px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: '500', background: match ? 'rgba(45,138,78,0.12)' : 'rgba(209,67,67,0.06)', border: '1px solid ' + (match ? 'rgba(45,138,78,0.25)' : 'rgba(209,67,67,0.15)'), color: match ? '#2D8A4E' : '#D14343' }}>{match ? '✅' : '❌'} {s}</span>)
            }) : <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>Not mentioned</span>}
          </div>
        ))}
      </div>
    )
  }

  const FitRow = () => {
    if (fitScores.length === 0) return null
    const best = bestOf('fit')
    return (
      <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>🎯 Fit {whatIfActive && <span style={{ color: '#6366f1', fontSize: '0.58rem', marginLeft: '2px' }}>+{whatIfSkill}</span>}</div>
        {fitScores.map((f, i) => (
          <div key={i} style={cellSt(best === i)}>
            {best === i && <span style={{ fontSize: '0.58rem', color: '#2D8A4E', display: 'block' }}>⭐ BEST FIT</span>}
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: fitCol(f.match), fontFamily: 'Cormorant Garamond, serif' }}>{f.match}%</div>
            <div style={{ width: '100%', height: '4px', background: 'var(--surface2)', borderRadius: '2px', marginTop: '3px' }}><div style={{ width: `${f.match}%`, height: '100%', background: fitCol(f.match), borderRadius: '2px', transition: 'width 0.5s' }}></div></div>
            {f.have?.length > 0 && <p style={{ fontSize: '0.62rem', color: '#2D8A4E', marginTop: '3px' }}>Have: {f.have.slice(0,2).join(', ')}</p>}
            {f.need?.length > 0 && <p style={{ fontSize: '0.62rem', color: '#D14343', marginTop: '2px' }}>Need: {f.need.slice(0,2).join(', ')}</p>}
          </div>
        ))}
      </div>
    )
  }

  const SwipeCard = ({ job, idx }) => {
    const ja = aiData?.jobs_analysis?.[idx]; const fit = fitScores[idx]
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>{(job.company||'?')[0].toUpperCase()}</div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '3px' }}>{job.title}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{job.company}</p>
        </div>
        {[{ icon: '📍', label: 'Location', val: job.location }, { icon: '💰', label: 'Salary', val: fmtSal(job.salary_min, job.salary_max), color: '#2D8A4E' }, { icon: '🕐', label: 'Posted', val: ago(job.posted_at) }, { icon: '📡', label: 'Source', val: srcLabel(job.source) }, { icon: '📊', label: 'Score', val: `${job.trust_score||'--'}/100`, color: scoreCol(job.trust_score) }].map((r, ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{r.icon} {r.label}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: r.color || 'var(--text)' }}>{r.val}</span>
          </div>
        ))}
        {ja && (<>
          {[{ icon: '💼', label: 'Type', val: ja.job_type }, { icon: '🏠', label: 'Mode', val: ja.work_mode, color: modeCol(ja.work_mode) }, { icon: '📈', label: 'Experience', val: ja.experience_level }].map((r, ri) => (
            <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{r.icon} {r.label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: r.color || 'var(--text)' }}>{r.val}</span>
            </div>
          ))}
          {ja.skills?.length > 0 && (
            <div style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text2)', display: 'block', marginBottom: '5px' }}>🛠️ Skills</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {ja.skills.map((s, si) => { const match = userSkills && userSkills.toLowerCase().split(',').some(us => s.toLowerCase().includes(us.trim()) || us.trim().toLowerCase().includes(s.toLowerCase())); return (<span key={si} style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '500', background: match ? 'rgba(45,138,78,0.1)' : 'rgba(209,67,67,0.06)', border: '1px solid ' + (match ? 'rgba(45,138,78,0.2)' : 'rgba(209,67,67,0.15)'), color: match ? '#2D8A4E' : '#D14343' }}>{match ? '✅' : '❌'} {s}</span>) })}
              </div>
            </div>
          )}
        </>)}
        {fit && fit.match > 0 && (
          <div style={{ padding: '12px', background: fitCol(fit.match) + '10', border: '1px solid ' + fitCol(fit.match) + '25', borderRadius: '10px', textAlign: 'center', marginTop: '5px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: fitCol(fit.match), fontFamily: 'Cormorant Garamond, serif' }}>{fit.match}% Match</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--surface2)', borderRadius: '3px', marginTop: '5px' }}><div style={{ width: `${fit.match}%`, height: '100%', background: fitCol(fit.match), borderRadius: '3px' }}></div></div>
            {fit.have?.length > 0 && <p style={{ fontSize: '0.72rem', color: '#2D8A4E', marginTop: '4px' }}>✅ Have: {fit.have.join(', ')}</p>}
            {fit.need?.length > 0 && <p style={{ fontSize: '0.72rem', color: '#D14343', marginTop: '2px' }}>❌ Need: {fit.need.join(', ')}</p>}
          </div>
        )}
        <button onClick={() => window.open(job.url, '_blank')} style={{ width: '100%', marginTop: '10px', padding: '11px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Apply Now →</button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', animation: 'slideUp 0.3s ease' }}>
      <div style={{ background: 'var(--bg)', borderRadius: '20px', padding: '22px', maxWidth: '720px', width: '100%', maxHeight: '92vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><h3 style={{ fontSize: '1.15rem', fontFamily: 'Cormorant Garamond, serif' }}>Job Comparison ⚡</h3><p style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>Comparing {jobs.length} jobs</p></div>
          <button onClick={onClose} style={{ width: '34px', height: '34px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {['table', 'swipe'].map(m => (<button key={m} onClick={() => setViewMode(m)} style={{ flex: 1, padding: '7px', background: viewMode === m ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (viewMode === m ? 'var(--accent)' : 'var(--border)'), borderRadius: '8px', color: viewMode === m ? 'white' : 'var(--text2)', fontSize: '0.78rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>{m === 'table' ? '📊 Table' : '👆 Swipe'}</button>))}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => setShowSkillBox(!showSkillBox)} style={{ width: '100%', padding: '9px', background: showSkillBox ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (showSkillBox ? 'var(--accent)' : 'var(--border)'), borderRadius: '10px', color: showSkillBox ? 'white' : 'var(--text)', fontSize: '0.82rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>🎯 {userSkills ? 'Edit' : 'Add'} Your Skills for Match Score</button>
          {showSkillBox && (<div style={{ marginTop: '6px' }}><input type="text" placeholder="e.g. JavaScript, React, Python, SQL" value={userSkills} onChange={e => setUserSkills(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} /><p style={{ fontSize: '0.7rem', color: 'var(--text2)', marginTop: '3px' }}>Comma separated. Green ✅ = you have. Red ❌ = need to learn.</p></div>)}
        </div>

        {!aiData && (<button onClick={analyze} disabled={loading} style={{ width: '100%', padding: '13px', background: '#2D8A4E', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.9rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>{loading ? '🤔 AI Analyzing...' : '🤖 Analyze & Compare Jobs'}</button>)}

        {viewMode === 'table' && (<>
          <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', marginBottom: '3px' }}>
            <div></div>
            {jobs.map((j, i) => (<div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}><div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px', color: 'white', fontWeight: '700', fontSize: '0.82rem' }}>{(j.company||'?')[0].toUpperCase()}</div><p style={{ fontSize: '0.75rem', fontWeight: '600', lineHeight: '1.2', marginBottom: '2px' }}>{j.title}</p><p style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{j.company}</p></div>))}
          </div>

          <Row label="📍 Location" vals={jobs.map(j => j.location || '?')} bestIdx={-1} />
          <Row label="💰 Salary" vals={jobs.map(j => fmtSal(j.salary_min, j.salary_max))} bestIdx={bestOf('salary')} />
          <Row label="🕐 Posted" vals={jobs.map(j => ago(j.posted_at))} bestIdx={bestOf('posted')} />
          <Row label="📡 Source" vals={jobs.map(j => srcLabel(j.source))} bestIdx={-1} />

          <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>📊 Score</div>
            {jobs.map((j, i) => (<div key={i} style={cellSt(bestOf('score') === i)}>{bestOf('score') === i && <span style={{ fontSize: '0.58rem', color: '#2D8A4E', display: 'block' }}>⭐ BEST</span>}<span style={{ color: scoreCol(j.trust_score), fontWeight: '700' }}>{j.trust_score || '--'}/100</span></div>))}
          </div>

          {aiData?.jobs_analysis && (<>
            <Row label="💼 Type" vals={aiData.jobs_analysis.map(ja => ja.job_type)} bestIdx={-1} />
            <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>🏠 Mode</div>
              {aiData.jobs_analysis.map((ja, i) => (<div key={i} style={{ fontSize: '0.82rem', textAlign: 'center', padding: '8px 4px', color: modeCol(ja.work_mode), fontWeight: '600' }}>{ja.work_mode?.toLowerCase().includes('remote') ? '🟢 ' : ja.work_mode?.toLowerCase().includes('hybrid') ? '🟣 ' : '🏢 '}{ja.work_mode}</div>))}
            </div>
            <Row label="📈 Experience" vals={aiData.jobs_analysis.map(ja => ja.experience_level)} bestIdx={-1} />
            <SkillRow />
            <FitRow />
          </>)}

          <div style={{ display: 'grid', gridTemplateColumns: grid, gap: '5px', padding: '8px 0' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>🔗 Apply</div>
            {jobs.map((j, i) => (<div key={i} style={{ textAlign: 'center' }}><button onClick={() => window.open(j.url, '_blank')} style={{ padding: '5px 10px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Apply →</button></div>))}
          </div>
        </>)}

        {viewMode === 'swipe' && (
          <div onTouchStart={e => touchX.current = e.touches[0].clientX} onTouchEnd={e => { const d = touchX.current - e.changedTouches[0].clientX; if (d > 50 && swipeIndex < jobs.length - 1) setSwipeIndex(swipeIndex + 1); if (d < -50 && swipeIndex > 0) setSwipeIndex(swipeIndex - 1) }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>{jobs.map((_, i) => (<div key={i} onClick={() => setSwipeIndex(i)} style={{ width: '10px', height: '10px', borderRadius: '50%', background: swipeIndex === i ? 'var(--accent)' : 'var(--surface2)', cursor: 'pointer' }}></div>))}</div>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text2)', marginBottom: '8px' }}>← Swipe or tap dots →</p>
            <div style={{ overflow: 'hidden' }}><div style={{ display: 'flex', transition: 'transform 0.3s ease', transform: `translateX(-${swipeIndex * 100}%)` }}>{jobs.map((j, i) => (<div key={i} style={{ minWidth: '100%', padding: '0 3px' }}><SwipeCard job={j} idx={i} /></div>))}</div></div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              <button onClick={() => swipeIndex > 0 && setSwipeIndex(swipeIndex - 1)} disabled={swipeIndex === 0} style={{ flex: 1, padding: '9px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', opacity: swipeIndex === 0 ? 0.3 : 1 }}>← Prev</button>
              <button onClick={() => swipeIndex < jobs.length - 1 && setSwipeIndex(swipeIndex + 1)} disabled={swipeIndex === jobs.length - 1} style={{ flex: 1, padding: '9px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', opacity: swipeIndex === jobs.length - 1 ? 0.3 : 1 }}>Next →</button>
            </div>
          </div>
        )}

        {aiData && fitScores.length > 0 && (
          <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '700', marginBottom: '6px' }}>🔮 What If I Learn...</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text2)', marginBottom: '8px' }}>See how your match score changes if you learn a new skill</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="e.g. React" value={whatIfSkill} onChange={e => setWhatIfSkill(e.target.value)} style={{ flex: 1, padding: '9px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              <button onClick={tryWhatIf} style={{ padding: '9px 14px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.78rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Try</button>
              {whatIfActive && <button onClick={resetWhatIf} style={{ padding: '9px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Reset</button>}
            </div>
            {whatIfActive && <p style={{ fontSize: '0.72rem', color: '#6366f1', marginTop: '5px' }}>✨ Scores updated with "{whatIfSkill}" added!</p>}
          </div>
        )}

        {aiData?.highlights?.length > 0 && (
          <div style={{ background: 'rgba(200,158,83,0.04)', border: '1px solid rgba(200,158,83,0.15)', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '8px' }}>🤖 AI Insights</h4>
            {aiData.highlights.map((h, i) => (<div key={i} style={{ display: 'flex', gap: '6px', padding: '3px 0' }}><span style={{ color: 'var(--accent)' }}>→</span><p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: '1.4' }}>{h}</p></div>))}
          </div>
        )}

        {aiData && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px', justifyContent: 'center' }}>
            {aiData.best_salary && aiData.best_salary !== 'Not comparable' && <span style={{ padding: '4px 10px', background: 'rgba(45,138,78,0.06)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', fontSize: '0.7rem', color: '#2D8A4E', fontWeight: '600' }}>💰 {aiData.best_salary}</span>}
            {aiData.best_recency && aiData.best_recency !== 'Not comparable' && <span style={{ padding: '4px 10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', fontSize: '0.7rem', color: '#6366f1', fontWeight: '600' }}>🕐 {aiData.best_recency}</span>}
            {fitScores.length > 0 && bestOf('fit') >= 0 && <span style={{ padding: '4px 10px', background: 'rgba(45,138,78,0.06)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', fontSize: '0.7rem', color: '#2D8A4E', fontWeight: '600' }}>🎯 Best Match: Job {bestOf('fit') + 1}</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
          {aiData && <button onClick={saveComp} style={{ flex: 1, minWidth: '100px', padding: '9px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>💾 Save</button>}
          {savedList.length > 0 && <button onClick={() => setShowSaved(!showSaved)} style={{ flex: 1, minWidth: '100px', padding: '9px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>📂 Saved ({savedList.length})</button>}
          {aiData && <button onClick={() => { setAiData(null); setFitScores([]); setWhatIfActive(false); setWhatIfSkill('') }} style={{ flex: 1, minWidth: '100px', padding: '9px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>🔄 Re-analyze</button>}
          <button onClick={onClose} style={{ flex: 1, minWidth: '100px', padding: '9px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Close</button>
        </div>

        {showSaved && savedList.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '6px' }}>📂 Saved Comparisons</h4>
            {savedList.map((c, i) => (<div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.75rem', fontWeight: '600' }}>#{i + 1}</span><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.date}</span></div>{c.jobs.map((j, ji) => <p key={ji} style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{j.title} at {j.company}</p>)}</div>))}
          </div>
        )}

        <p style={{ fontSize: '0.62rem', color: 'var(--text2)', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>Based on job listing data. Skills extracted by AI. Verify on company websites.</p>
      </div>
    </div>
  )
}