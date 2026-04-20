import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function JDDecoder({ job, onClose }) {
  const [jobTitle, setJobTitle] = useState(job?.title || '')
  const [company, setCompany] = useState(job?.company || '')
  const [jobDesc, setJobDesc] = useState(job?.description || '')
  const [decoded, setDecoded] = useState(null)
  const [decoding, setDecoding] = useState(false)

  // Interview states
  const [stage, setStage] = useState('decode')
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluations, setEvaluations] = useState([])
  const [evaluating, setEvaluating] = useState(false)
  const [showIdealAnswer, setShowIdealAnswer] = useState(false)
  const [currentEval, setCurrentEval] = useState(null)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [listening, setListening] = useState(false)

  const decodeJD = async () => {
    if (!jobDesc.trim() && !jobTitle.trim()) return
    setDecoding(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/decode-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription: jobDesc })
      })
      const data = await res.json()
      setDecoded(data)
    } catch (e) { console.error('Decode failed:', e) }
    setDecoding(false)
  }

  const startJobInterview = async () => {
    setLoadingQuestions(true)
    try {
      const res = await fetch(`${API_URL}/api/interview/job-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription: jobDesc })
      })
      const data = await res.json()
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
        setStage('interview')
        setCurrentQ(0)
        setEvaluations([])
        setCurrentEval(null)
        setShowIdealAnswer(false)
        speakText(`Question 1. ${data.questions[0]}`)
      }
    } catch (e) { console.error('Failed:', e) }
    setLoadingQuestions(false)
  }

  const speakText = (text) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95; u.pitch = 0.9
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'))
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Speech not supported. Type instead.'); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'en-IN'; r.continuous = true; r.interimResults = true
    r.onstart = () => setListening(true)
    r.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setAnswer(t) }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    setTimeout(() => { r.stop(); setListening(false) }, 30000)
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setEvaluating(true); setShowIdealAnswer(false); setCurrentEval(null)
    try {
      const res = await fetch(`${API_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questions[currentQ], answer, category: jobTitle })
      })
      const data = await res.json()
      const newEval = { question: questions[currentQ], answer, score: data.score || 1, feedback: data.feedback || 'No feedback.', improvement: data.improvement || 'Provide more detail.', ideal_answer: data.ideal_answer || 'No ideal answer available.' }
      setCurrentEval(newEval)
      setEvaluations([...evaluations, newEval])
      setShowIdealAnswer(true)
      speakText(`Score: ${newEval.score} out of 10. ${newEval.feedback}`)
    } catch (e) { console.error('Eval failed:', e) }
    setEvaluating(false)
  }

  const goToNextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1); setAnswer(''); setCurrentEval(null); setShowIdealAnswer(false)
      speakText(`Question ${currentQ + 2}. ${questions[currentQ + 1]}`)
    } else { setStage('results') }
  }

  const totalScore = evaluations.reduce((s, e) => s + (e.score || 0), 0)
  const avgScore = evaluations.length > 0 ? (totalScore / evaluations.length).toFixed(1) : 0

  const getGrade = (score) => {
    if (score >= 8) return { grade: 'Excellent', color: '#2D8A4E' }
    if (score >= 6) return { grade: 'Good', color: '#D4900D' }
    if (score >= 4) return { grade: 'Average', color: '#888' }
    return { grade: 'Needs Work', color: '#D14343' }
  }

  const getDifficultyColor = (level) => {
    if (level?.toLowerCase().includes('easy')) return '#2D8A4E'
    if (level?.toLowerCase().includes('medium')) return '#D4900D'
    return '#D14343'
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
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>
              {stage === 'decode' ? 'Job Decoder 🔍' : stage === 'interview' ? '🎤 Job-Specific Interview' : '📊 Interview Results'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
              {stage === 'decode' ? `${jobTitle} at ${company}` : `Practicing for: ${jobTitle}`}
            </p>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* DECODE STAGE */}
        {stage === 'decode' && !decoded && (
          <>
            <div className="cv-field" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Job Title</label>
              <input type="text" placeholder="e.g. Senior Software Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
            </div>
            <div className="cv-field" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Company</label>
              <input type="text" placeholder="e.g. TCS" value={company} onChange={(e) => setCompany(e.target.value)}
                style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
            </div>
            <div className="cv-field" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Job Description</label>
              <textarea placeholder="Paste full job description..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={8}
                style={{ padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', width: '100%', lineHeight: '1.6' }} />
            </div>
            <button onClick={decodeJD} disabled={(!jobDesc.trim() && !jobTitle.trim()) || decoding}
              style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.92rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: decoding ? 'not-allowed' : 'pointer', opacity: decoding ? 0.6 : 1, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {decoding ? '🔍 Decoding...' : '🔍 Decode This Job'}
            </button>
          </>
        )}

        {/* DECODE RESULTS */}
        {stage === 'decode' && decoded && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.92rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '8px' }}>📋 In Simple Words</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.7' }}>{decoded.summary}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 14px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600' }}>💰 {decoded.salary_estimate}</span>
                <span style={{ padding: '6px 14px', background: getDifficultyColor(decoded.difficulty_level) + '10', border: '1px solid ' + getDifficultyColor(decoded.difficulty_level) + '30', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', color: getDifficultyColor(decoded.difficulty_level) }}>📊 {decoded.difficulty_level}</span>
              </div>
            </div>

            {decoded.actually_want?.length > 0 && (
              <div style={{ background: 'rgba(200,158,83,0.04)', border: '1px solid rgba(200,158,83,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '10px' }}>🎯 What They Actually Want</h4>
                {decoded.actually_want.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < decoded.actually_want.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '700' }}>→</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{item}</p>
                  </div>
                ))}
              </div>
            )}

            {decoded.green_flags?.length > 0 && (
              <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>🟢 Positive Highlights</h4>
                {decoded.green_flags.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}><span>✅</span><p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{f}</p></div>
                ))}
              </div>
            )}

            {decoded.questions_to_ask?.length > 0 && (
              <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: '700', marginBottom: '10px' }}>❓ Smart Questions to Ask</h4>
                {decoded.questions_to_ask.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: i < decoded.questions_to_ask.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                    <span style={{ color: '#6366f1', fontWeight: '700' }}>{i + 1}.</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{q}</p>
                  </div>
                ))}
              </div>
            )}

            {decoded.hidden_requirements?.length > 0 && (
              <div style={{ background: 'rgba(212,144,13,0.04)', border: '1px solid rgba(212,144,13,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#D4900D', fontWeight: '700', marginBottom: '10px' }}>🔒 Likely Expected</h4>
                {decoded.hidden_requirements.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}><span>👁️</span><p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{r}</p></div>
                ))}
              </div>
            )}

            {decoded.buzzword_translations?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px' }}>🗣️ Buzzword Translator</h4>
                {decoded.buzzword_translations.map((bw, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < decoded.buzzword_translations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: '600' }}>"{bw.buzzword}"</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text2)', margin: '0 6px' }}>→</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: '500' }}>{bw.meaning}</span>
                  </div>
                ))}
              </div>
            )}

            {decoded.interview_tips?.length > 0 && (
              <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '10px' }}>🎤 Interview Tips</h4>
                {decoded.interview_tips.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0' }}>
                    <span style={{ color: '#2D8A4E', fontWeight: '700' }}>{i + 1}.</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{t}</p>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '14px', fontStyle: 'italic' }}>AI analysis based on job description. Verify with company.</p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={startJobInterview} disabled={loadingQuestions}
                style={{ flex: 2, padding: '14px', background: '#2D8A4E', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.88rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {loadingQuestions ? '🎤 Preparing...' : '🎤 Practice Interview for This Job'}
              </button>
              <button onClick={onClose}
                style={{ flex: 1, padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

        {/* INTERVIEW STAGE */}
        {stage === 'interview' && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.92rem' }}>Question {currentQ + 1} of {questions.length}</h4>
              <span style={{ color: 'var(--accent)', fontSize: '0.78rem', fontWeight: '600' }}>{jobTitle}</span>
            </div>

            <div style={{ width: '100%', height: '4px', background: 'var(--surface2)', borderRadius: '2px', marginBottom: '16px' }}>
              <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ fontSize: '1rem', fontWeight: '500', lineHeight: '1.6', color: 'var(--text)' }}>{questions[currentQ]}</p>
            </div>

            {!showIdealAnswer && (
              <>
                <div className="cv-field" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    <span>Your Answer</span>
                    <button onClick={startListening}
                      style={{ padding: '4px 12px', background: listening ? '#D14343' : 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                      {listening ? '🔴 Listening...' : '🎙️ Speak'}
                    </button>
                  </label>
                  <textarea placeholder="Type or speak your answer..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5}
                    style={{ padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', width: '100%', lineHeight: '1.6' }} />
                </div>
                <button onClick={submitAnswer} disabled={!answer.trim() || evaluating}
                  style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.92rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', opacity: evaluating ? 0.6 : 1 }}>
                  {evaluating ? '🤔 Evaluating...' : 'Submit Answer'}
                </button>
              </>
            )}

            {showIdealAnswer && currentEval && (
              <div style={{ animation: 'slideUp 0.3s ease' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Your Score</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: getGrade(currentEval.score).color, fontFamily: 'Cormorant Garamond, serif' }}>{currentEval.score}/10 — {getGrade(currentEval.score).grade}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: '1.5', marginBottom: '4px' }}>📝 {currentEval.feedback}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>💡 {currentEval.improvement}</p>
                </div>

                <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.15)', borderRadius: '14px', padding: '18px', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#2D8A4E', fontWeight: '700', marginBottom: '8px' }}>✅ Ideal Answer</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.7' }}>{currentEval.ideal_answer}</p>
                </div>

                <button onClick={goToNextQuestion}
                  style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.92rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {currentQ < questions.length - 1 ? `Next Question (${currentQ + 2}/${questions.length}) →` : 'View Results ✓'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTS STAGE */}
        {stage === 'results' && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: getGrade(avgScore).color, fontFamily: 'Cormorant Garamond, serif' }}>{avgScore}/10</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: getGrade(avgScore).color, marginTop: '2px' }}>{getGrade(avgScore).grade}</div>
              <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginTop: '8px' }}>{jobTitle} at {company} • {questions.length} questions</p>
            </div>

            {evaluations.map((ev, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.82rem' }}>Q{i + 1}</span>
                  <span style={{ color: getGrade(ev.score).color, fontWeight: '700', fontSize: '0.88rem' }}>{ev.score}/10</span>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', color: 'var(--text)' }}>{ev.question}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '4px', fontStyle: 'italic' }}>You: "{ev.answer}"</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>📝 {ev.feedback}</p>
                <div style={{ background: 'rgba(45,138,78,0.04)', border: '1px solid rgba(45,138,78,0.1)', borderRadius: '8px', padding: '10px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2D8A4E' }}>✅ Ideal:</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: '1.5', marginTop: '2px' }}>{ev.ideal_answer}</p>
                </div>
              </div>
            ))}

            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '14px', fontStyle: 'italic' }}>AI-generated. Verify facts independently.</p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setStage('decode'); setEvaluations([]); setQuestions([]); setAnswer(''); setCurrentQ(0) }}
                style={{ flex: 1, padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                🔄 Back to Decoder
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