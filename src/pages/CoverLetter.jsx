import { useState } from 'react'
import jsPDF from 'jspdf'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function CoverLetter({ job, userCV, onClose }) {
  const [letter, setLetter] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateLetter = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/coverletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job?.title || '',
          company: job?.company || '',
          jobDescription: job?.description || '',
          userName: userCV?.name || 'Candidate',
          userSkills: userCV?.skills?.join(', ') || '',
          userExperience: userCV?.experience?.map(e => `${e.title} at ${e.company} (${e.duration})`).join(', ') || '',
          userEducation: userCV?.education?.map(e => `${e.degree} from ${e.institution}`).join(', ') || ''
        })
      })
      const data = await res.json()
      if (data.letter) {
        setLetter(data.letter)
        setGenerated(true)
      }
    } catch (e) {
      console.error('Failed:', e)
      setLetter('Failed to generate. Please try again.')
    }
    setGenerating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPDF = () => {
    const pdf = new jsPDF()
    pdf.setFontSize(11)
    pdf.setTextColor(26, 26, 26)

    const lines = pdf.splitTextToSize(letter, 170)
    let y = 20

    lines.forEach(line => {
      if (y > 280) { pdf.addPage(); y = 20 }
      pdf.text(line, 20, y)
      y += 6
    })

    pdf.save(`Cover_Letter_${job?.company || 'Job'}.pdf`)
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
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>AI Cover Letter ✉️</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>Personalized for this job</p>
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

        {/* Generate Button */}
        {!generated && (
          <button onClick={generateLetter} disabled={generating}
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
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.6 : 1,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
            {generating ? '✨ AI Writing Your Cover Letter...' : '✨ Generate Cover Letter'}
          </button>
        )}

        {/* Generated Letter */}
        {generated && (
          <>
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              rows={14}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.7',
                marginBottom: '16px'
              }}
            />

            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '12px', fontStyle: 'italic' }}>
              You can edit the letter above before copying or downloading.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyToClipboard}
                style={{
                  flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: copied ? '#2D8A4E' : 'var(--text)', fontSize: '0.85rem',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                }}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button onClick={downloadPDF}
                style={{
                  flex: 1, padding: '12px', background: '#2D8A4E', border: 'none',
                  borderRadius: '10px', color: 'white', fontSize: '0.85rem',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                }}>
                📥 Download PDF
              </button>
              <button onClick={() => { setGenerated(false); setLetter('') }}
                style={{
                  flex: 1, padding: '12px', background: 'var(--accent)', border: 'none',
                  borderRadius: '10px', color: 'white', fontSize: '0.85rem',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                }}>
                🔄 Regenerate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}