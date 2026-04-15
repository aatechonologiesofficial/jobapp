import { useState } from 'react'
import jsPDF from 'jspdf'
import OfficeScene from '../components/OfficeScene'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

const checklistItems = [
  { id: 'resume', label: '📄 Print 3 copies of your resume', category: 'documents' },
  { id: 'id', label: '🪪 Government ID (Aadhaar/PAN/Passport)', category: 'documents' },
  { id: 'certificates', label: '📜 Original certificates & mark sheets', category: 'documents' },
  { id: 'offer', label: '📋 Offer letter / Interview call letter', category: 'documents' },
  { id: 'portfolio', label: '💼 Portfolio or work samples (if applicable)', category: 'documents' },
  { id: 'photos', label: '📸 Passport size photographs (2-3)', category: 'documents' },
  { id: 'pen', label: '🖊️ Pen and notepad', category: 'essentials' },
  { id: 'water', label: '💧 Water bottle', category: 'essentials' },
  { id: 'charger', label: '🔋 Phone fully charged', category: 'essentials' },
  { id: 'route', label: '🗺️ Check route and traffic before leaving', category: 'planning' },
  { id: 'eta', label: '⏰ Reach 15 minutes before interview time', category: 'planning' },
  { id: 'company', label: '🏢 Research the company (about, products, news)', category: 'planning' },
  { id: 'role', label: '📌 Re-read the job description', category: 'planning' },
  { id: 'questions', label: '❓ Prepare 2-3 questions to ask interviewer', category: 'planning' },
  { id: 'dress', label: '👔 Formal or smart casual attire (clean & ironed)', category: 'wear' },
]

const categories = [
  { id: 'software-development', label: '💻 Software Dev', icon: '💻' },
  { id: 'data-science', label: '📊 Data Science', icon: '📊' },
  { id: 'marketing', label: '📢 Marketing', icon: '📢' },
  { id: 'finance', label: '💰 Finance', icon: '💰' },
  { id: 'human-resources', label: '👥 HR', icon: '👥' },
  { id: 'sales', label: '🤝 Sales', icon: '🤝' },
  { id: 'design', label: '🎨 Design', icon: '🎨' },
  { id: 'management', label: '📋 Management', icon: '📋' },
]

const levels = [
  { id: 'fresher', label: 'Fresher (0-1 yr)' },
  { id: 'junior', label: 'Junior (1-3 yrs)' },
  { id: 'mid', label: 'Mid (3-5 yrs)' },
  { id: 'senior', label: 'Senior (5+ yrs)' },
]

export default function MockInterview() {
  const [stage, setStage] = useState('setup')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('fresher')
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaluations, setEvaluations] = useState([])
  const [evaluating, setEvaluating] = useState(false)
  const [listening, setListening] = useState(false)
  const [showIdealAnswer, setShowIdealAnswer] = useState(false)
  const [currentEval, setCurrentEval] = useState(null)
  const [showChecklist, setShowChecklist] = useState(false)
  const [checkedItems, setCheckedItems] = useState({})
  const [interviewTime, setInterviewTime] = useState('')
  const [travelMinutes, setTravelMinutes] = useState('')

  const startInterview = async () => {
    if (!category) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/interview/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, level })
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
    } catch (e) {
      console.error('Failed to start:', e)
    }
    setLoading(false)
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
        body: JSON.stringify({ question: questions[currentQ], answer, category })
      })
      const data = await res.json()
      const newEval = {
        question: questions[currentQ], answer,
        score: data.score || 1,
        feedback: data.feedback || 'No feedback.',
        improvement: data.improvement || 'Provide more detail.',
        ideal_answer: data.ideal_answer || 'No ideal answer available.'
      }
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

  const downloadReport = () => {
    const pdf = new jsPDF()
    const catName = category.replace(/-/g, ' ').toUpperCase()

    pdf.setFontSize(20)
    pdf.setTextColor(200, 158, 83)
    pdf.text('AI MOCK INTERVIEW REPORT', 105, 20, { align: 'center' })

    pdf.setFontSize(11)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Category: ${catName}  |  Level: ${level.toUpperCase()}  |  Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' })

    pdf.setFontSize(28)
    pdf.setTextColor(...(avgScore >= 8 ? [45, 138, 78] : avgScore >= 6 ? [212, 144, 13] : avgScore >= 4 ? [136, 136, 136] : [209, 67, 67]))
    pdf.text(`${avgScore}/10 — ${getGrade(avgScore).grade}`, 105, 48, { align: 'center' })

    pdf.setDrawColor(200, 158, 83)
    pdf.line(20, 55, 190, 55)

    let y = 65

    evaluations.forEach((ev, i) => {
      if (y > 250) { pdf.addPage(); y = 20 }

      pdf.setFontSize(11)
      pdf.setTextColor(26, 26, 26)
      pdf.text(`Q${i + 1}: ${ev.question}`, 20, y, { maxWidth: 170 })
      y += pdf.getTextDimensions(ev.question, { maxWidth: 170 }).h + 6

      pdf.setFontSize(10)
      const sc = ev.score
      pdf.setTextColor(...(sc >= 8 ? [45, 138, 78] : sc >= 6 ? [212, 144, 13] : sc >= 4 ? [136, 136, 136] : [209, 67, 67]))
      pdf.text(`Score: ${ev.score}/10 — ${getGrade(ev.score).grade}`, 20, y)
      y += 6

      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Your Answer: "${ev.answer}"`, 20, y, { maxWidth: 170 })
      y += pdf.getTextDimensions(`Your Answer: "${ev.answer}"`, { maxWidth: 170 }).h + 4

      pdf.setTextColor(80, 80, 80)
      pdf.text(`Feedback: ${ev.feedback}`, 20, y, { maxWidth: 170 })
      y += pdf.getTextDimensions(ev.feedback, { maxWidth: 170 }).h + 4

      pdf.setTextColor(200, 158, 83)
      pdf.text(`Tip: ${ev.improvement}`, 20, y, { maxWidth: 170 })
      y += pdf.getTextDimensions(ev.improvement, { maxWidth: 170 }).h + 4

      pdf.setTextColor(45, 138, 78)
      pdf.text(`Ideal Answer: ${ev.ideal_answer}`, 20, y, { maxWidth: 170 })
      y += pdf.getTextDimensions(ev.ideal_answer, { maxWidth: 170 }).h + 6

      pdf.setDrawColor(220, 220, 220)
      pdf.line(20, y, 190, y)
      y += 8
    })

    if (y > 270) { pdf.addPage(); y = 20 }
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Note: AI-generated report. Verify important facts independently.', 105, y, { align: 'center' })

    pdf.save(`Interview_Report_${catName}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="cv-builder">
      {/* Setup Stage */}
      {stage === 'setup' && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>AI Mock Interview 🎤</h2>
            <p>Practice with AI and improve your skills</p>
          </div>

          <OfficeScene active={false} />

          <h3 style={{ marginBottom: '12px' }}>Choose Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                style={{ padding: '16px 12px', background: category === cat.id ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (category === cat.id ? 'var(--accent)' : 'var(--border)'), borderRadius: '12px', color: category === cat.id ? 'white' : 'var(--text)', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{cat.icon}</div>
                {cat.label.replace(cat.icon + ' ', '')}
              </button>
            ))}
          </div>

          <h3 style={{ marginBottom: '12px' }}>Experience Level</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {levels.map(lv => (
              <button key={lv.id} onClick={() => setLevel(lv.id)}
                style={{ padding: '10px 16px', background: level === lv.id ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (level === lv.id ? 'var(--accent)' : 'var(--border)'), borderRadius: '10px', color: level === lv.id ? 'white' : 'var(--text2)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '500' }}>
                {lv.label}
              </button>
            ))}
          </div>

          {/* Interview Day Checklist */}
          <div style={{ marginBottom: '16px' }}>
            <button onClick={() => setShowChecklist(!showChecklist)}
              style={{ width: '100%', padding: '14px', background: showChecklist ? 'var(--accent)' : 'var(--surface)', border: '1px solid ' + (showChecklist ? 'var(--accent)' : 'var(--border)'), borderRadius: '12px', color: showChecklist ? 'white' : 'var(--text)', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}>
              📋 Interview Day Checklist {showChecklist ? '▲' : '▼'}
            </button>
          </div>

          {showChecklist && (
            <div style={{ animation: 'slideUp 0.3s ease', marginBottom: '20px' }}>
              {/* ETA Calculator */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '12px', fontFamily: 'Cormorant Garamond, serif' }}>⏰ When should I leave?</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Interview Time</label>
                    <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Travel Time (mins)</label>
                    <input type="number" placeholder="e.g. 45" value={travelMinutes} onChange={(e) => setTravelMinutes(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                  </div>
                </div>
                {interviewTime && travelMinutes && (
                  <div style={{ background: 'rgba(45, 138, 78, 0.06)', border: '1px solid rgba(45, 138, 78, 0.15)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '4px' }}>You should leave by</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2D8A4E', fontFamily: 'Cormorant Garamond, serif' }}>
                      {(() => {
                        const [h, m] = interviewTime.split(':').map(Number)
                        const total = h * 60 + m - parseInt(travelMinutes) - 15
                        const lh = Math.floor(((total % 1440) + 1440) % 1440 / 60)
                        const lm = ((total % 60) + 60) % 60
                        return `${lh > 12 ? lh - 12 : lh === 0 ? 12 : lh}:${lm.toString().padStart(2, '0')} ${lh >= 12 ? 'PM' : 'AM'}`
                      })()}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>Including 15 min buffer to reach early</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '12px', fontFamily: 'Cormorant Garamond, serif' }}>📄 Documents to Carry</h4>
                {checklistItems.filter(c => c.category === 'documents').map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkedItems[item.id] || false} onChange={() => setCheckedItems({ ...checkedItems, [item.id]: !checkedItems[item.id] })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.88rem', color: checkedItems[item.id] ? 'var(--text2)' : 'var(--text)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none', transition: 'all 0.3s' }}>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Essentials */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '12px', fontFamily: 'Cormorant Garamond, serif' }}>🎒 Essentials</h4>
                {checklistItems.filter(c => c.category === 'essentials').map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkedItems[item.id] || false} onChange={() => setCheckedItems({ ...checkedItems, [item.id]: !checkedItems[item.id] })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.88rem', color: checkedItems[item.id] ? 'var(--text2)' : 'var(--text)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Planning */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '12px', fontFamily: 'Cormorant Garamond, serif' }}>📝 Preparation</h4>
                {checklistItems.filter(c => c.category === 'planning').map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkedItems[item.id] || false} onChange={() => setCheckedItems({ ...checkedItems, [item.id]: !checkedItems[item.id] })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.88rem', color: checkedItems[item.id] ? 'var(--text2)' : 'var(--text)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Wear */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '12px', fontFamily: 'Cormorant Garamond, serif' }}>👔 Attire</h4>
                {checklistItems.filter(c => c.category === 'wear').map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkedItems[item.id] || false} onChange={() => setCheckedItems({ ...checkedItems, [item.id]: !checkedItems[item.id] })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.88rem', color: checkedItems[item.id] ? 'var(--text2)' : 'var(--text)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>{item.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text2)', fontSize: '0.85rem' }}>
                ✅ {Object.values(checkedItems).filter(Boolean).length} / {checklistItems.length} completed
              </div>
            </div>
          )}

          <button className="cv-next-btn" onClick={startInterview} disabled={!category || loading} style={{ opacity: !category ? 0.4 : 1 }}>
            {loading ? 'Preparing Interview...' : '🎤 Start Interview'}
          </button>
        </div>
      )}

      {/* Interview Stage */}
      {stage === 'interview' && (
        <div className="cv-section">
          <OfficeScene active={true} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Question {currentQ + 1} of {questions.length}</h3>
            <span style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: '600' }}>{category.replace('-', ' ').toUpperCase()}</span>
          </div>

          <div style={{ width: '100%', height: '4px', background: 'var(--surface2)', borderRadius: '2px', marginBottom: '20px' }}>
            <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: '500', lineHeight: '1.6', color: 'var(--text)' }}>{questions[currentQ]}</p>
          </div>

          {!showIdealAnswer && (
            <>
              <div className="cv-field" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Your Answer</span>
                  <button onClick={startListening}
                    style={{ padding: '4px 12px', background: listening ? '#D14343' : 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                    {listening ? '🔴 Listening...' : '🎙️ Speak'}
                  </button>
                </label>
                <textarea placeholder="Type or speak your answer..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6}
                  style={{ padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', width: '100%' }} />
              </div>
              <button className="cv-next-btn" onClick={submitAnswer} disabled={!answer.trim() || evaluating}>
                {evaluating ? '🤔 AI Evaluating...' : 'Submit Answer'}
              </button>
            </>
          )}

          {showIdealAnswer && currentEval && (
            <div style={{ animation: 'slideUp 0.4s ease' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Your Score</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: getGrade(currentEval.score).color, fontFamily: 'Cormorant Garamond, serif' }}>
                    {currentEval.score}/10 — {getGrade(currentEval.score).grade}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: '1.5', marginBottom: '6px' }}><strong>Your answer:</strong> "{currentEval.answer}"</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: '1.5' }}>📝 {currentEval.feedback}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--accent)', marginTop: '6px' }}>💡 {currentEval.improvement}</p>
              </div>

              <div style={{ background: 'rgba(45, 138, 78, 0.04)', border: '1px solid rgba(45, 138, 78, 0.15)', borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#2D8A4E' }}>Ideal Answer</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.7' }}>{currentEval.ideal_answer}</p>
              </div>

              <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }}>Note: AI-generated answer. Verify important facts independently.</p>

              <button className="cv-next-btn" onClick={goToNextQuestion}>
                {currentQ < questions.length - 1 ? `Next Question (${currentQ + 2}/${questions.length}) →` : 'View Results ✓'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>Interview Complete! 🎉</h2>
            <p>Here's your performance report</p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: getGrade(avgScore).color, fontFamily: 'Cormorant Garamond, serif' }}>{avgScore}/10</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: getGrade(avgScore).color, marginTop: '4px' }}>{getGrade(avgScore).grade}</div>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '8px' }}>{category.replace('-', ' ')} • {level} level • {questions.length} questions</p>
          </div>

          {evaluations.map((ev, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Q{i + 1}</span>
                <span style={{ color: getGrade(ev.score).color, fontWeight: '700', fontSize: '0.92rem' }}>{ev.score}/10</span>
              </div>
              <p style={{ fontSize: '0.88rem', fontWeight: '500', marginBottom: '6px', color: 'var(--text)' }}>{ev.question}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '6px', fontStyle: 'italic' }}>Your answer: "{ev.answer}"</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>📝 {ev.feedback}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: '4px' }}>💡 {ev.improvement}</p>
              <div style={{ background: 'rgba(45, 138, 78, 0.04)', border: '1px solid rgba(45, 138, 78, 0.1)', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2D8A4E' }}>✅ Ideal Answer:</span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6', marginTop: '4px' }}>{ev.ideal_answer}</p>
              </div>
            </div>
          ))}

          <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }}>Note: AI-generated report. Verify important facts independently.</p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="cv-next-btn" onClick={() => { setStage('setup'); setEvaluations([]); setQuestions([]); setAnswer(''); setCurrentQ(0); setCurrentEval(null); setShowIdealAnswer(false) }} style={{ flex: 1 }}>
              🔄 Try Again
            </button>
            <button className="cv-next-btn" onClick={downloadReport} style={{ flex: 1, background: '#2D8A4E' }}>
              📥 Download PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}