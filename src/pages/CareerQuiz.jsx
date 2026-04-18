import { useState } from 'react'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

const questions = [
  {
    id: 'education',
    question: 'What is your highest education?',
    options: ['10th / 12th', 'Diploma', 'Bachelor Degree (B.Tech/BCA/B.Com/BA)', 'Master Degree (M.Tech/MBA/MCA)', 'PhD']
  },
  {
    id: 'interests',
    question: 'What interests you the most?',
    options: ['Technology & Coding', 'Business & Management', 'Creative & Design', 'Numbers & Data', 'People & Communication', 'Science & Research']
  },
  {
    id: 'strengths',
    question: 'What is your biggest strength?',
    options: ['Problem Solving', 'Communication', 'Creativity', 'Leadership', 'Analytical Thinking', 'Teamwork']
  },
  {
    id: 'workStyle',
    question: 'How do you prefer to work?',
    options: ['Alone (focused deep work)', 'In a team', 'Leading a team', 'Mix of alone and team']
  },
  {
    id: 'industry',
    question: 'Which industry excites you?',
    options: ['IT / Software', 'Finance / Banking', 'Healthcare', 'Education', 'Marketing / Advertising', 'Manufacturing', 'Government / Public Sector', 'Not sure']
  },
  {
    id: 'experience',
    question: 'How much work experience do you have?',
    options: ['Fresher (0 years)', '1-2 years', '3-5 years', '5-10 years', '10+ years']
  },
  {
    id: 'location',
    question: 'Where do you want to work?',
    options: ['My city only', 'Anywhere in India', 'Remote / Work from home', 'Open to international']
  },
  {
    id: 'salary',
    question: 'What salary range are you targeting?',
    options: ['₹2-4 LPA', '₹4-8 LPA', '₹8-15 LPA', '₹15-25 LPA', '₹25+ LPA']
  },
  {
    id: 'workMode',
    question: 'What work mode do you prefer?',
    options: ['Office only', 'Work from home only', 'Hybrid (office + home)', 'No preference']
  },
  {
    id: 'goal',
    question: 'What is your long-term career goal?',
    options: ['Become an expert/specialist', 'Start my own business', 'Reach leadership/management', 'Work-life balance is priority', 'Make maximum money', 'Make a social impact']
  }
]

export default function CareerQuiz() {
  const [stage, setStage] = useState('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const selectAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer })
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300)
    }
  }

  const submitQuiz = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/career-assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const data = await res.json()
      if (data.careers && data.careers.length > 0) {
        setResults(data.careers)
        setStage('results')
      }
    } catch (e) {
      console.error('Assessment failed:', e)
    }
    setLoading(false)
  }

  const getMatchColor = (pct) => {
    if (pct >= 85) return '#2D8A4E'
    if (pct >= 70) return '#D4900D'
    return '#888'
  }

  const getGrowthColor = (growth) => {
    if (growth === 'high') return '#2D8A4E'
    if (growth === 'medium') return '#D4900D'
    return '#888'
  }

  const resetQuiz = () => {
    setStage('intro')
    setCurrentQ(0)
    setAnswers({})
    setResults(null)
  }

  return (
    <div className="cv-builder">
      {/* Intro */}
      {stage === 'intro' && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>Career Assessment 🧭</h2>
            <p>Discover the best career path for you</p>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎯</div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px' }}>Find Your Perfect Career</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '6px' }}>
              Answer 10 simple questions about your interests, strengths, and goals.
            </p>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '6px' }}>
              Our AI will analyze your answers and suggest the 5 best career paths for you.
            </p>
            <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginTop: '12px' }}>⏱️ Takes only 2 minutes</p>
          </div>

          <button className="cv-next-btn" onClick={() => setStage('quiz')}>
            Start Assessment →
          </button>
        </div>
      )}

      {/* Quiz */}
      {stage === 'quiz' && (
        <div className="cv-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Question {currentQ + 1} of {questions.length}</h3>
            <span style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: '600' }}>{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '4px', background: 'var(--surface2)', borderRadius: '2px', marginBottom: '24px' }}>
            <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
          </div>

          {/* Question */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', lineHeight: '1.5', color: 'var(--text)' }}>
              {questions[currentQ].question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {questions[currentQ].options.map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(questions[currentQ].id, opt)}
                style={{
                  padding: '14px 18px',
                  background: answers[questions[currentQ].id] === opt ? 'var(--accent)' : 'var(--surface)',
                  border: '1px solid ' + (answers[questions[currentQ].id] === opt ? 'var(--accent)' : 'var(--border)'),
                  borderRadius: '12px',
                  color: answers[questions[currentQ].id] === opt ? 'white' : 'var(--text)',
                  fontSize: '0.92rem',
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.3s',
                  animation: 'slideUp 0.3s ease',
                  animationDelay: `${i * 0.05}s`,
                  animationFillMode: 'backwards'
                }}>
                {opt}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ(currentQ - 1)}
                style={{
                  flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text2)', fontSize: '0.88rem', fontWeight: '600',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                }}>
                ← Back
              </button>
            )}

            {currentQ === questions.length - 1 && Object.keys(answers).length >= questions.length - 1 && (
              <button className="cv-next-btn" onClick={submitQuiz} disabled={loading}
                style={{ flex: 2, margin: 0 }}>
                {loading ? '🔍 AI Analyzing...' : '🎯 Get Career Suggestions'}
              </button>
            )}
          </div>

          {/* Answer Summary */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {questions.map((q, i) => (
              <div key={i} onClick={() => setCurrentQ(i)}
                style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: answers[q.id] ? 'var(--accent)' : i === currentQ ? 'var(--surface2)' : 'var(--surface)',
                  border: '1px solid ' + (i === currentQ ? 'var(--accent)' : 'var(--border)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: answers[q.id] ? 'white' : 'var(--text2)',
                  cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {stage === 'results' && results && (
        <div className="cv-section">
          <div className="cv-header">
            <h2>Your Career Matches 🎯</h2>
            <p>Based on your assessment, here are your top career paths</p>
          </div>

          {results.map((career, i) => (
            <div key={i} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '14px',
              animation: 'slideUp 0.5s ease',
              animationDelay: `${i * 0.1}s`,
              animationFillMode: 'backwards'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text2)', fontWeight: '600', letterSpacing: '1px' }}>#{i + 1} MATCH</span>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Cormorant Garamond, serif', marginTop: '2px' }}>{career.title}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: getMatchColor(career.match), fontFamily: 'Cormorant Garamond, serif' }}>{career.match}%</div>
                  <div style={{ fontSize: '0.65rem', color: getMatchColor(career.match), fontWeight: '600' }}>MATCH</div>
                </div>
              </div>

              {/* Match Bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--surface2)', borderRadius: '3px', marginBottom: '14px' }}>
                <div style={{ width: `${career.match}%`, height: '100%', background: getMatchColor(career.match), borderRadius: '3px', transition: 'width 1s ease' }}></div>
              </div>

              {/* Why */}
              <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.5', marginBottom: '12px' }}>
                💡 {career.why}
              </p>

              {/* Info Grid */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ padding: '8px 14px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '0.82rem' }}>
                  💰 {career.avg_salary}
                </div>
                <div style={{
                  padding: '8px 14px',
                  background: getGrowthColor(career.growth) === '#2D8A4E' ? 'rgba(45,138,78,0.06)' : 'rgba(212,144,13,0.06)',
                  borderRadius: '8px', fontSize: '0.82rem',
                  color: getGrowthColor(career.growth), fontWeight: '600'
                }}>
                  📈 {career.growth?.charAt(0).toUpperCase() + career.growth?.slice(1)} Growth
                </div>
              </div>

              {/* Skills Needed */}
              {career.skills_needed && career.skills_needed.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: '600', letterSpacing: '1px' }}>SKILLS TO LEARN:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {career.skills_needed.map((skill, j) => (
                      <span key={j} style={{
                        padding: '4px 12px',
                        background: 'rgba(200, 158, 83, 0.06)',
                        border: '1px solid rgba(200, 158, 83, 0.15)',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        color: 'var(--accent)',
                        fontWeight: '500'
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <p style={{ fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }}>
            Note: AI-generated suggestions based on your answers. Explore multiple paths before deciding.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cv-next-btn" onClick={resetQuiz} style={{ flex: 1 }}>
              🔄 Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}