import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function CompanyDive({ job, onClose }) {
  const [company, setCompany] = useState(job?.company || '')
  const [jobTitle, setJobTitle] = useState(job?.title || '')
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const research = async () => {
    if (!company.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/company-dive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, jobTitle })
      })
      const data = await res.json()
      setInfo(data)
    } catch (e) { console.error('Research failed:', e) }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', animation: 'slideUp 0.3s ease'
    }}>
      <div style={{
        background: 'var(--bg)', borderRadius: '20px', padding: '28px',
        maxWidth: '620px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
        border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>Company Deep Dive 🏢</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>Know everything before your interview</p>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Input */}
        {!info && (
          <>
            <div className="cv-field" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Company Name</label>
              <input type="text" placeholder="e.g. TCS, Infosys, Google" value={company} onChange={(e) => setCompany(e.target.value)}
                style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
            </div>
            <div className="cv-field" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Role You're Applying For (Optional)</label>
              <input type="text" placeholder="e.g. Software Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
            </div>
            <button onClick={research} disabled={!company.trim() || loading}
              style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.92rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {loading ? '🔍 Researching Company...' : '🏢 Research This Company'}
            </button>
          </>
        )}

        {/* Results */}
        {info && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            {/* Company Overview */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px' }}>🏢 {company}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.7', marginBottom: '14px' }}>{info.overview}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 14px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600' }}>🏭 {info.industry}</span>
                {info.founded !== 'Not available' && <span style={{ padding: '6px 14px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600' }}>📅 Founded: {info.founded}</span>}
                {info.headquarters !== 'Not available' && <span style={{ padding: '6px 14px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600' }}>📍 {info.headquarters}</span>}
                {info.company_size !== 'Not available' && <span style={{ padding: '6px 14px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600' }}>👥 {info.company_size}</span>}
              </div>
            </div>

            {/* Known For */}
            {info.known_for?.length > 0 && (
              <div style={{ background: 'rgba(200,158,83,0.04)', border: '1px solid rgba(200,158,83,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '10px' }}>⭐ Known For</h4>
                {info.known_for.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                    <span>✨</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Salary Range */}
            {info.salary_range !== 'Not available' && (
              <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#2D8A4E', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Expected Salary for {jobTitle || 'this role'}</span>
                <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2D8A4E', fontFamily: 'Cormorant Garamond, serif', marginTop: '6px' }}>💰 {info.salary_range}</p>
              </div>
            )}

            {/* Pros */}
            {info.pros?.length > 0 && (
              <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>👍 Why People Like Working Here</h4>
                {info.pros.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                    <span>✅</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{p}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Work Culture */}
            {info.work_culture?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px' }}>🏠 Work Culture</h4>
                {info.work_culture.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                    <span>💡</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{c}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Growth */}
            {info.growth_opportunities !== 'Not available' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '8px' }}>📈 Growth Opportunities</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.6' }}>{info.growth_opportunities}</p>
              </div>
            )}

            {/* Interview Process */}
            {info.interview_process?.length > 0 && (
              <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: '700', marginBottom: '10px' }}>📋 Typical Interview Process</h4>
                {info.interview_process.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < info.interview_process.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                    <div style={{ width: '28px', height: '28px', background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.72rem', fontWeight: '700', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5', paddingTop: '4px' }}>{step}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Common Questions */}
            {info.common_questions?.length > 0 && (
              <div style={{ background: 'rgba(212,144,13,0.04)', border: '1px solid rgba(212,144,13,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#D4900D', fontWeight: '700', marginBottom: '10px' }}>❓ Questions They Usually Ask</h4>
                {info.common_questions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < info.common_questions.length - 1 ? '1px solid rgba(212,144,13,0.1)' : 'none' }}>
                    <span style={{ color: '#D4900D', fontWeight: '700' }}>{i + 1}.</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{q}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            {info.tips_for_interview?.length > 0 && (
              <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>🎯 Tips to Crack This Interview</h4>
                {info.tips_for_interview.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < info.tips_for_interview.length - 1 ? '1px solid rgba(45,138,78,0.1)' : 'none' }}>
                    <span style={{ color: '#2D8A4E', fontWeight: '700' }}>{i + 1}.</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{t}</p>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '14px', fontStyle: 'italic' }}>
              AI-generated research based on publicly available information. Verify details on the company's official website.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setInfo(null)}
                style={{ flex: 1, padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                🔄 Research Another
              </button>
              <button onClick={onClose}
                style={{ flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}