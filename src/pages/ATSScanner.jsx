import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function ATSScanner() {
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [showJobDesc, setShowJobDesc] = useState(false)

  const scanResume = async () => {
    if (!resumeText.trim()) return
    setScanning(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/ats-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc })
      })
      const data = await res.json()
      setAnalysis(data)
    } catch (e) {
      console.error('Scan failed:', e)
    }
    setScanning(false)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#2D8A4E'
    if (score >= 60) return '#D4900D'
    if (score >= 40) return '#888'
    return '#D14343'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Poor'
  }

  const getIssueColor = (type) => {
    if (type === 'critical') return '#D14343'
    if (type === 'warning') return '#D4900D'
    return '#2D8A4E'
  }

  const getIssueIcon = (type) => {
    if (type === 'critical') return '🔴'
    if (type === 'warning') return '🟡'
    return '💡'
  }

  const resetScan = () => {
    setAnalysis(null)
    setResumeText('')
    setJobDesc('')
    setShowJobDesc(false)
  }

  return (
    <div className="cv-builder">
      {/* Input Stage */}
      {!analysis && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>ATS Resume Scanner 📊</h2>
            <p>Check if your resume will pass Applicant Tracking Systems</p>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>📄</span>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'Cormorant Garamond, serif' }}>Paste Your Resume</h3>
            </div>
            <textarea
              placeholder="Copy and paste your entire resume text here...

Example:
John Doe
Software Developer
john@email.com | +91 9876543210

Summary: 3 years of experience in web development...

Skills: JavaScript, React, Node.js, Python...

Experience:
Software Developer at XYZ Company (2022-Present)
- Built web applications using React...

Education:
B.Tech Computer Science - ABC University (2018-2022)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '0.88rem',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.6'
              }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: '6px' }}>
              Characters: {resumeText.length} {resumeText.length < 100 && resumeText.length > 0 ? '(too short for accurate scan)' : ''}
            </p>
          </div>

          {/* Optional Job Description */}
          <div style={{ marginBottom: '16px' }}>
            <button onClick={() => setShowJobDesc(!showJobDesc)}
              style={{
                width: '100%',
                padding: '12px',
                background: showJobDesc ? 'var(--accent)' : 'var(--surface)',
                border: '1px solid ' + (showJobDesc ? 'var(--accent)' : 'var(--border)'),
                borderRadius: '12px',
                color: showJobDesc ? 'white' : 'var(--text)',
                fontSize: '0.88rem',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}>
              📋 Add Job Description for Better Match (Optional) {showJobDesc ? '▲' : '▼'}
            </button>
          </div>

          {showJobDesc && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '16px',
              animation: 'slideUp 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span>
                <h3 style={{ fontSize: '0.95rem', fontFamily: 'Cormorant Garamond, serif' }}>Paste Job Description</h3>
              </div>
              <textarea
                placeholder="Paste the job description you want to match against..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontSize: '0.88rem',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: '1.6'
                }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: '6px' }}>
                Adding a job description gives more accurate keyword matching
              </p>
            </div>
          )}

          {/* What ATS Checks */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px' }}>What does ATS check?</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>📐 <strong>Format</strong> — Is your resume structured properly?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>🔑 <strong>Keywords</strong> — Does it contain relevant job keywords?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>💥 <strong>Impact</strong> — Are achievements quantified with numbers?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>📊 <strong>Overall</strong> — Will it pass automated screening?</p>
            </div>
          </div>

          <button className="cv-next-btn" onClick={scanResume} disabled={!resumeText.trim() || scanning}
            style={{ opacity: !resumeText.trim() ? 0.4 : 1 }}>
            {scanning ? '🔍 Scanning Resume...' : '📊 Scan My Resume'}
          </button>
        </div>
      )}

      {/* Results Stage */}
      {analysis && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>ATS Scan Results 📊</h2>
            <p>{analysis.summary}</p>
          </div>

          {/* Overall Score */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: getScoreColor(analysis.ats_score), fontFamily: 'Cormorant Garamond, serif' }}>
              {analysis.ats_score}/100
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: getScoreColor(analysis.ats_score), marginTop: '2px' }}>
              {getScoreLabel(analysis.ats_score)} ATS Score
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface2)', borderRadius: '4px', marginTop: '14px' }}>
              <div style={{ width: `${analysis.ats_score}%`, height: '100%', background: getScoreColor(analysis.ats_score), borderRadius: '4px', transition: 'width 1s ease' }}></div>
            </div>
          </div>

          {/* Sub Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Format', score: analysis.format_score, icon: '📐' },
              { label: 'Keywords', score: analysis.keyword_score, icon: '🔑' },
              { label: 'Impact', score: analysis.impact_score, icon: '💥' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: getScoreColor(item.score), fontFamily: 'Cormorant Garamond, serif' }}>{item.score}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.92rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '12px' }}>🔍 Issues Found</h4>
              {analysis.issues.map((issue, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '10px 0',
                  borderBottom: i < analysis.issues.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span>{getIssueIcon(issue.type)}</span>
                  <div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: getIssueColor(issue.type),
                      display: 'block',
                      marginBottom: '2px'
                    }}>{issue.type}</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Keyword Matches */}
          {analysis.keyword_matches && analysis.keyword_matches.length > 0 && (
            <div style={{
              background: 'rgba(45, 138, 78, 0.04)',
              border: '1px solid rgba(45, 138, 78, 0.15)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>✅ Keywords Found ({analysis.keyword_matches.length})</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.keyword_matches.map((kw, i) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    background: 'rgba(45, 138, 78, 0.1)',
                    border: '1px solid rgba(45, 138, 78, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    color: '#2D8A4E',
                    fontWeight: '500'
                  }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <div style={{
              background: 'rgba(209, 67, 67, 0.04)',
              border: '1px solid rgba(209, 67, 67, 0.15)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.88rem', color: '#D14343', fontWeight: '700', marginBottom: '10px' }}>❌ Missing Keywords ({analysis.missing_keywords.length})</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.missing_keywords.map((kw, i) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    background: 'rgba(209, 67, 67, 0.08)',
                    border: '1px solid rgba(209, 67, 67, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    color: '#D14343',
                    fontWeight: '500'
                  }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Sections */}
          {analysis.missing_sections && analysis.missing_sections.length > 0 && (
            <div style={{
              background: 'rgba(212, 144, 13, 0.04)',
              border: '1px solid rgba(212, 144, 13, 0.15)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '0.88rem', color: '#D4900D', fontWeight: '700', marginBottom: '10px' }}>⚠️ Missing Sections</h4>
              {analysis.missing_sections.map((section, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                  <span style={{ color: '#D4900D' }}>📌</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{section}</span>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }}>
            Note: AI-generated analysis. Different ATS systems may evaluate differently.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cv-next-btn" onClick={resetScan} style={{ flex: 1 }}>
              🔄 Scan Again
            </button>
            <button className="cv-next-btn" onClick={() => setAnalysis(null)} style={{ flex: 1, background: '#2D8A4E' }}>
              ✏️ Edit Resume & Rescan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}