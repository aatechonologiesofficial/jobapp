import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function SkillGap({ job, onClose }) {
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [userSkills, setUserSkills] = useState('')

  const analyze = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/skillgap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job?.title || '',
          jobDescription: job?.description || '',
          userSkills: userSkills
        })
      })
      const data = await res.json()
      setAnalysis(data)
    } catch (e) {
      console.error('Analysis failed:', e)
    }
    setAnalyzing(false)
  }

  const getMatchColor = (pct) => {
    if (pct >= 80) return '#2D8A4E'
    if (pct >= 60) return '#D4900D'
    if (pct >= 40) return '#888'
    return '#D14343'
  }

  const getMatchLabel = (pct) => {
    if (pct >= 80) return 'Strong Match'
    if (pct >= 60) return 'Good Match'
    if (pct >= 40) return 'Moderate Match'
    return 'Needs Improvement'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'slideUp 0.3s ease'
    }}>
      <div style={{
        background: 'var(--bg)',
        borderRadius: '20px',
        padding: '28px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>Skill Gap Analysis 🎯</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>See how your skills match this job</p>
          </div>
          <button onClick={onClose}
            style={{ width: '36px', height: '36px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', fontSize: '1rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Job Info */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>{job?.title}</p>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{job?.company} • {job?.location}</p>
        </div>

        {/* Skills Input */}
        {!analysis && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Your Skills (comma separated)</label>
              <textarea
                placeholder="e.g. JavaScript, React, Node.js, Python, SQL, Git, HTML, CSS"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: '4px' }}>Leave empty to analyze as a fresher</p>
            </div>

            <button onClick={analyze} disabled={analyzing}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.92rem',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                opacity: analyzing ? 0.6 : 1,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
              {analyzing ? '🔍 Analyzing Skills...' : '🎯 Analyze Skill Gap'}
            </button>
          </>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            {/* Match Percentage */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: getMatchColor(analysis.match_percentage), fontFamily: 'Cormorant Garamond, serif' }}>
                {analysis.match_percentage}%
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: getMatchColor(analysis.match_percentage), marginTop: '2px' }}>
                {getMatchLabel(analysis.match_percentage)}
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--surface2)', borderRadius: '4px', marginTop: '14px', overflow: 'hidden' }}>
                <div style={{
                  width: `${analysis.match_percentage}%`,
                  height: '100%',
                  background: getMatchColor(analysis.match_percentage),
                  borderRadius: '4px',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>

            {/* Matching Skills */}
            {analysis.matching_skills && analysis.matching_skills.length > 0 && (
              <div style={{
                background: 'rgba(45, 138, 78, 0.04)',
                border: '1px solid rgba(45, 138, 78, 0.15)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '12px'
              }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>✅ Skills You Have ({analysis.matching_skills.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {analysis.matching_skills.map((skill, i) => (
                    <span key={i} style={{
                      padding: '5px 12px',
                      background: 'rgba(45, 138, 78, 0.1)',
                      border: '1px solid rgba(45, 138, 78, 0.2)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      color: '#2D8A4E',
                      fontWeight: '500'
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {analysis.missing_skills && analysis.missing_skills.length > 0 && (
              <div style={{
                background: 'rgba(209, 67, 67, 0.04)',
                border: '1px solid rgba(209, 67, 67, 0.15)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '12px'
              }}>
                <h4 style={{ fontSize: '0.88rem', color: '#D14343', fontWeight: '700', marginBottom: '10px' }}>❌ Skills to Learn ({analysis.missing_skills.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {analysis.missing_skills.map((skill, i) => (
                    <span key={i} style={{
                      padding: '5px 12px',
                      background: 'rgba(209, 67, 67, 0.08)',
                      border: '1px solid rgba(209, 67, 67, 0.2)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      color: '#D14343',
                      fontWeight: '500'
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Missing */}
            {analysis.critical_missing && analysis.critical_missing.length > 0 && (
              <div style={{
                background: 'rgba(212, 144, 13, 0.04)',
                border: '1px solid rgba(212, 144, 13, 0.15)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '12px'
              }}>
                <h4 style={{ fontSize: '0.88rem', color: '#D4900D', fontWeight: '700', marginBottom: '10px' }}>⚠️ Learn These First</h4>
                {analysis.critical_missing.map((skill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>🔥 {skill}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '10px' }}>💡 Recommendations</h4>
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < analysis.recommendations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{i + 1}.</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{rec}</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '14px', fontStyle: 'italic' }}>
              Note: AI-generated analysis. Actual job requirements may vary.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setAnalysis(null); setUserSkills('') }}
                style={{
                  flex: 1, padding: '12px', background: 'var(--accent)', border: 'none',
                  borderRadius: '10px', color: 'white', fontSize: '0.85rem',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                }}>
                🔄 Re-analyze
              </button>
              <button onClick={onClose}
                style={{
                  flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text)', fontSize: '0.85rem',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}