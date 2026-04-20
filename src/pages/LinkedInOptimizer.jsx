import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function LinkedInOptimizer() {
  const [stage, setStage] = useState('input')
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  const analyzeProfile = async () => {
    if (!headline.trim() && !summary.trim()) return
    setAnalyzing(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/linkedin-optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, summary, experience, skills, targetRole })
      })
      const data = await res.json()
      setAnalysis(data)
      setStage('results')
    } catch (e) {
      console.error('Analysis failed:', e)
    }
    setAnalyzing(false)
  }

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#2D8A4E'
    if (score >= 60) return '#D4900D'
    if (score >= 40) return '#888'
    return '#D14343'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Strong'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Weak'
  }

  const resetAnalysis = () => {
    setStage('input')
    setAnalysis(null)
  }

  return (
    <div className="cv-builder">
      {/* Input Stage */}
      {stage === 'input' && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>LinkedIn Optimizer 💼</h2>
            <p>Get AI suggestions to improve your LinkedIn profile</p>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>💡</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: '1.5' }}>
                Copy your LinkedIn profile sections and paste them below. AI will analyze and give you an optimized version.
              </p>
            </div>
          </div>

          {/* Target Role */}
          <div className="cv-field" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Target Role (What job are you looking for?)</label>
            <input type="text" placeholder="e.g. Senior Software Developer, Marketing Manager"
              value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
              style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
          </div>

          {/* Headline */}
          <div className="cv-field" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Your Current Headline</label>
            <input type="text" placeholder="e.g. Software Developer at TCS | B.Tech CSE"
              value={headline} onChange={(e) => setHeadline(e.target.value)}
              style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', marginTop: '4px' }}>This appears below your name on LinkedIn</p>
          </div>

          {/* Summary */}
          <div className="cv-field" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>About / Summary Section</label>
            <textarea placeholder="Paste your LinkedIn About section here..."
              value={summary} onChange={(e) => setSummary(e.target.value)} rows={5}
              style={{ padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', width: '100%', lineHeight: '1.6' }} />
          </div>

          {/* Experience */}
          <div className="cv-field" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Experience (Brief)</label>
            <textarea placeholder="e.g. Software Developer at TCS (2022-Present) - Built web apps using React and Node.js"
              value={experience} onChange={(e) => setExperience(e.target.value)} rows={4}
              style={{ padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', width: '100%', lineHeight: '1.6' }} />
          </div>

          {/* Skills */}
          <div className="cv-field" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Skills (comma separated)</label>
            <input type="text" placeholder="e.g. JavaScript, React, Python, SQL, Leadership"
              value={skills} onChange={(e) => setSkills(e.target.value)}
              style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
          </div>

          <button className="cv-next-btn" onClick={analyzeProfile}
            disabled={(!headline.trim() && !summary.trim()) || analyzing}
            style={{ opacity: (!headline.trim() && !summary.trim()) ? 0.4 : 1 }}>
            {analyzing ? '🔍 AI Analyzing Profile...' : '💼 Optimize My Profile'}
          </button>
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && analysis && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>Profile Analysis 💼</h2>
            <p>Here's how to improve your LinkedIn profile</p>
          </div>

          {/* Overall Score */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: getScoreColor(analysis.profile_score), fontFamily: 'Cormorant Garamond, serif' }}>
              {analysis.profile_score}/100
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: getScoreColor(analysis.profile_score), marginTop: '2px' }}>
              {getScoreLabel(analysis.profile_score)} Profile
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface2)', borderRadius: '4px', marginTop: '14px' }}>
              <div style={{ width: `${analysis.profile_score}%`, height: '100%', background: getScoreColor(analysis.profile_score), borderRadius: '4px', transition: 'width 1s ease' }}></div>
            </div>
          </div>

          {/* Section Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Headline', score: analysis.headline_score, icon: '📝' },
              { label: 'Summary', score: analysis.summary_score, icon: '📄' },
              { label: 'Experience', score: analysis.experience_score, icon: '💼' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: getScoreColor(item.score), fontFamily: 'Cormorant Garamond, serif' }}>{item.score}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Improved Headline */}
          {analysis.improved_headline && (
            <div style={{
              background: 'rgba(45, 138, 78, 0.04)',
              border: '1px solid rgba(45, 138, 78, 0.15)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700' }}>✅ Improved Headline</h4>
                <button onClick={() => copyText(analysis.improved_headline, 'headline')}
                  style={{ padding: '4px 12px', background: copiedField === 'headline' ? '#2D8A4E' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: copiedField === 'headline' ? 'white' : 'var(--text2)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                  {copiedField === 'headline' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600' }}>YOUR CURRENT:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '2px', textDecoration: 'line-through' }}>{headline || 'No headline'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#2D8A4E', fontWeight: '600' }}>SUGGESTED:</span>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text)', marginTop: '2px', fontWeight: '500' }}>{analysis.improved_headline}</p>
                </div>
              </div>
            </div>
          )}

          {/* Improved Summary */}
          {analysis.improved_summary && (
            <div style={{
              background: 'rgba(45, 138, 78, 0.04)',
              border: '1px solid rgba(45, 138, 78, 0.15)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700' }}>✅ Improved About Section</h4>
                <button onClick={() => copyText(analysis.improved_summary, 'summary')}
                  style={{ padding: '4px 12px', background: copiedField === 'summary' ? '#2D8A4E' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: copiedField === 'summary' ? 'white' : 'var(--text2)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                  {copiedField === 'summary' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.7' }}>{analysis.improved_summary}</p>
            </div>
          )}

          {/* Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.92rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '12px' }}>🔍 Issues to Fix</h4>
              {analysis.issues.map((issue, i) => (
                <div key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < analysis.issues.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#D4900D', textTransform: 'uppercase', letterSpacing: '1px' }}>{issue.section}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#D14343', marginBottom: '4px' }}>❌ {issue.issue}</p>
                  <p style={{ fontSize: '0.85rem', color: '#2D8A4E' }}>✅ {issue.fix}</p>
                </div>
              ))}
            </div>
          )}

          {/* Keywords to Add */}
          {analysis.keywords_to_add && analysis.keywords_to_add.length > 0 && (
            <div style={{
              background: 'rgba(200, 158, 83, 0.04)',
              border: '1px solid rgba(200, 158, 83, 0.15)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '10px' }}>🔑 Keywords to Add to Profile</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.keywords_to_add.map((kw, i) => (
                  <span key={i} style={{
                    padding: '5px 14px',
                    background: 'rgba(200, 158, 83, 0.08)',
                    border: '1px solid rgba(200, 158, 83, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--accent)',
                    fontWeight: '500'
                  }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {analysis.tips && analysis.tips.length > 0 && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.92rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '12px' }}>💡 Pro Tips</h4>
              {analysis.tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: i < analysis.tips.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem' }}>{i + 1}.</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{tip}</p>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }}>
            Note: AI-generated suggestions. Review before updating your LinkedIn profile.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cv-next-btn" onClick={resetAnalysis} style={{ flex: 1 }}>
              🔄 Analyze Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}