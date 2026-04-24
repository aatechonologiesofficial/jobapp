import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function OfferAnalyzer() {
  const [offerText, setOfferText] = useState('')
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeOffer = async () => {
    if (!offerText.trim()) return
    setAnalyzing(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/analyze-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerText, role, experience })
      })
      const data = await res.json()
      setAnalysis(data)
    } catch (e) { console.error('Analysis failed:', e) }
    setAnalyzing(false)
  }

  const getRatingColor = (r) => {
    if (r >= 8) return '#2D8A4E'
    if (r >= 6) return '#D4900D'
    if (r >= 4) return '#888'
    return '#D14343'
  }

  const getRatingLabel = (r) => {
    if (r >= 8) return 'Excellent Offer'
    if (r >= 6) return 'Good Offer'
    if (r >= 4) return 'Average Offer'
    return 'Below Average'
  }

  const getVerdictColor = (v) => {
    if (v?.toLowerCase().includes('accept')) return '#2D8A4E'
    if (v?.toLowerCase().includes('negotiate')) return '#D4900D'
    return '#D14343'
  }

  const getSalaryVerdictColor = (v) => {
    if (v?.toLowerCase().includes('above') || v?.toLowerCase().includes('competitive')) return '#2D8A4E'
    if (v?.toLowerCase().includes('fair')) return '#D4900D'
    return '#D14343'
  }

  const resetAnalysis = () => {
    setAnalysis(null)
    setOfferText('')
    setRole('')
    setExperience('')
  }

  return (
    <div className="cv-builder">
      {/* Input Stage */}
      {!analysis && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>Offer Letter Analyzer 📋</h2>
            <p>Understand your job offer before you accept</p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>💡</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: '1.5' }}>
                Paste your offer letter text below. AI will analyze salary, benefits, and give you negotiation tips.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '4px' }}>Role / Job Title</label>
              <input type="text" placeholder="e.g. Software Developer" value={role} onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '4px' }}>Your Experience</label>
              <input type="text" placeholder="e.g. 3 years" value={experience} onChange={(e) => setExperience(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '4px' }}>Paste Offer Letter</label>
            <textarea
              placeholder="Paste your complete offer letter here...

Example:
Dear Candidate,
We are pleased to offer you the position of Software Developer at ABC Company.

CTC: ₹8,00,000 per annum
Base Salary: ₹50,000/month
HRA: ₹20,000/month
Bonus: Performance based
Joining Date: 1st May 2026
Probation: 6 months
Notice Period: 3 months..."
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              rows={12}
              style={{ width: '100%', padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', lineHeight: '1.6' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: '6px' }}>
              Characters: {offerText.length} {offerText.length < 50 && offerText.length > 0 ? '(too short for accurate analysis)' : ''}
            </p>
          </div>

          <button className="cv-next-btn" onClick={analyzeOffer} disabled={!offerText.trim() || analyzing}
            style={{ opacity: !offerText.trim() ? 0.4 : 1 }}>
            {analyzing ? '🔍 Analyzing Offer...' : '📋 Analyze My Offer'}
          </button>
        </div>
      )}

      {/* Results Stage */}
      {analysis && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>Offer Analysis 📋</h2>
            <p>{analysis.summary}</p>
          </div>

          {/* Overall Rating */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: getRatingColor(analysis.overall_rating), fontFamily: 'Cormorant Garamond, serif' }}>
              {analysis.overall_rating}/10
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: getRatingColor(analysis.overall_rating), marginTop: '2px' }}>
              {getRatingLabel(analysis.overall_rating)}
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface2)', borderRadius: '4px', marginTop: '14px' }}>
              <div style={{ width: `${analysis.overall_rating * 10}%`, height: '100%', background: getRatingColor(analysis.overall_rating), borderRadius: '4px', transition: 'width 1s ease' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 16px', background: getSalaryVerdictColor(analysis.salary_verdict) + '15', border: '1px solid ' + getSalaryVerdictColor(analysis.salary_verdict) + '30', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: getSalaryVerdictColor(analysis.salary_verdict) }}>
                💰 {analysis.salary_verdict}
              </span>
              <span style={{ padding: '6px 16px', background: getVerdictColor(analysis.verdict) + '15', border: '1px solid ' + getVerdictColor(analysis.verdict) + '30', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: getVerdictColor(analysis.verdict) }}>
                📌 {analysis.verdict}
              </span>
            </div>
          </div>

          {/* Salary Breakdown */}
          {analysis.salary_breakdown && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.92rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '12px' }}>💰 Salary Breakdown</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Base', value: analysis.salary_breakdown.base, icon: '💵' },
                  { label: 'Bonus', value: analysis.salary_breakdown.bonus, icon: '🎁' },
                  { label: 'Stock/ESOP', value: analysis.salary_breakdown.stock, icon: '📈' },
                  { label: 'Other', value: analysis.salary_breakdown.other, icon: '📦' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', marginBottom: '2px' }}>{item.icon}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', marginTop: '4px' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Comparison */}
          {analysis.market_comparison && (
            <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Market Comparison</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.6', marginTop: '6px' }}>📊 {analysis.market_comparison}</p>
            </div>
          )}

          {/* Good Points */}
          {analysis.good_points?.length > 0 && (
            <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>👍 Good Points</h4>
              {analysis.good_points.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                  <span>✅</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Benefits Found */}
          {analysis.benefits_found?.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px' }}>🎁 Benefits Included</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.benefits_found.map((b, i) => (
                  <span key={i} style={{ padding: '5px 14px', background: 'rgba(45,138,78,0.08)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '20px', fontSize: '0.8rem', color: '#2D8A4E', fontWeight: '500' }}>✅ {b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Missing */}
          {analysis.benefits_missing?.length > 0 && (
            <div style={{ background: 'rgba(212,144,13,0.04)', border: '1px solid rgba(212,144,13,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#D4900D', fontWeight: '700', marginBottom: '10px' }}>⚠️ Not Mentioned (Ask HR)</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.benefits_missing.map((b, i) => (
                  <span key={i} style={{ padding: '5px 14px', background: 'rgba(212,144,13,0.08)', border: '1px solid rgba(212,144,13,0.15)', borderRadius: '20px', fontSize: '0.8rem', color: '#D4900D', fontWeight: '500' }}>❓ {b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {analysis.concerns?.length > 0 && (
            <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: '700', marginBottom: '10px' }}>🔍 Things to Clarify with HR</h4>
              {analysis.concerns.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < analysis.concerns.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                  <span>💬</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{c}</p>
                </div>
              ))}
            </div>
          )}

          {/* Questions to Ask HR */}
          {analysis.questions_to_ask_hr?.length > 0 && (
            <div style={{ background: 'rgba(200,158,83,0.04)', border: '1px solid rgba(200,158,83,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '10px' }}>❓ Questions to Ask HR</h4>
              {analysis.questions_to_ask_hr.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < analysis.questions_to_ask_hr.length - 1 ? '1px solid rgba(200,158,83,0.1)' : 'none' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{i + 1}.</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{q}</p>
                </div>
              ))}
            </div>
          )}

          {/* Negotiation Tips */}
          {analysis.negotiation_tips?.length > 0 && (
            <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>💪 Negotiation Tips</h4>
              {analysis.negotiation_tips.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < analysis.negotiation_tips.length - 1 ? '1px solid rgba(45,138,78,0.1)' : 'none' }}>
                  <span style={{ color: '#2D8A4E', fontWeight: '700' }}>{i + 1}.</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{t}</p>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '14px', fontStyle: 'italic' }}>
            AI-generated analysis. Consult with a trusted mentor or HR professional before making decisions.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cv-next-btn" onClick={resetAnalysis} style={{ flex: 1 }}>
              🔄 Analyze Another Offer
            </button>
            <button className="cv-next-btn" onClick={() => setAnalysis(null)} style={{ flex: 1, background: '#2D8A4E' }}>
              ✏️ Edit & Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  )
}