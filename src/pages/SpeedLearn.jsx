import { useState } from 'react'

const SKILLS = [
  { id: 'python', name: 'Python', icon: '🐍', file: '/data/python.json', available: true },
  { id: 'javascript', name: 'JavaScript', icon: '⚡', file: '/data/javascript.json', available: true },
  { id: 'sql', name: 'SQL', icon: '🗃️', file: '/data/sql.json', available: false },
  { id: 'react', name: 'React', icon: '⚛️', file: '/data/react.json', available: false },
  { id: 'java', name: 'Java', icon: '☕', file: '/data/java.json', available: false },
]

export default function SpeedLearn() {
  const [view, setView] = useState('skills')
  const [skillData, setSkillData] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState([])
  const [quizFilter, setQuizFilter] = useState('all')
  const [quizType, setQuizType] = useState('general')
  const [quizQuestions, setQuizQuestions] = useState([])

  const loadSkill = async (skill) => {
    if (!skill.available) return
    setLoading(true)
    try {
      const res = await fetch(skill.file)
      const data = await res.json()
      setSkillData(data)
      setView('modules')
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const openModule = (mod) => {
    if (!mod.is_free) {
      if (!confirm('Watch ad to unlock. For now, free preview!')) return
    }
    setSelectedModule(mod)
    setView('content')
  }

  const startQuiz = (questions, type = 'general') => {
    setQuizQuestions(questions)
    setQuizType(type)
    setQuizIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setQuizComplete(false)
    setAnsweredQuestions([])
    setView('quiz')
  }

  const startGeneralQuiz = (filter = 'all') => {
    setQuizFilter(filter)
    let qs = skillData.quiz
    if (filter !== 'all') qs = qs.filter(q => q.difficulty === filter)
    startQuiz(qs, 'general')
  }

  const startModuleQuiz = (mod) => {
    if (mod.module_quiz && mod.module_quiz.length > 0) {
      startQuiz(mod.module_quiz, 'module')
    }
  }

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    setShowExplanation(true)
    const isCorrect = idx === quizQuestions[quizIndex].correct
    if (isCorrect) setScore(s => s + 1)
    setAnsweredQuestions([
      ...answeredQuestions,
      { ...quizQuestions[quizIndex], userAnswer: idx, isCorrect }
    ])
  }

  const nextQuestion = () => {
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizComplete(true)
    } else {
      setQuizIndex(quizIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const goBack = () => {
    if (view === 'quiz') {
      setView(quizType === 'module' ? 'content' : 'modules')
      return
    }
    if (view === 'content') { setView('modules'); setSelectedModule(null); return }
    if (view === 'modules') { setView('skills'); setSkillData(null); return }
  }

  const btnStyle = {
    padding: '8px 16px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif'
  }

  const accentBtn = {
    padding: '14px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    fontFamily: 'Inter, sans-serif'
  }

  // ===== SKILLS VIEW =====
  if (view === 'skills') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: '700',
          fontFamily: 'Cormorant Garamond, serif', marginBottom: '6px'
        }}>⚡ Speed Learn</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Master job-ready skills with bite-sized modules and quizzes
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {SKILLS.map(s => (
            <div key={s.id} onClick={() => loadSkill(s)} style={{
              padding: '20px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '16px',
              cursor: s.available ? 'pointer' : 'default',
              opacity: s.available ? 1 : 0.5, textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>{s.name}</div>
              <div style={{
                fontSize: '0.72rem', fontWeight: '500',
                color: s.available ? 'var(--success)' : 'var(--accent)'
              }}>
                {s.available ? 'Available' : 'Coming Soon'}
              </div>
            </div>
          ))}
        </div>
        {loading && (
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text2)' }}>Loading...</p>
        )}
      </div>
    )
  }

  // ===== MODULES VIEW =====
  if (view === 'modules' && skillData) {
    const core = skillData.modules.filter(m => m.level === 'core')
    const adv = skillData.modules.filter(m => m.level === 'advanced')
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={goBack} style={btnStyle}>← Back</button>
          <h2 style={{
            fontSize: '1.5rem', fontWeight: '700',
            fontFamily: 'Cormorant Garamond, serif'
          }}>{skillData.icon} {skillData.skill}</h2>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '24px' }}>
          {skillData.modules.length} modules • {skillData.quiz.length} quiz questions • 5 quiz per module
        </p>

        {core.map(m => (
          <div key={m.id} onClick={() => openModule(m)} style={{
            padding: '18px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '14px', marginBottom: '10px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: m.is_free ? 'var(--accent)' : 'var(--surface2)',
              color: m.is_free ? 'white' : 'var(--text2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', flexShrink: 0
            }}>{m.is_free ? m.id : '🔒'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                Module {m.id}: {m.title}
              </div>
              <div style={{
                fontSize: '0.72rem', fontWeight: '600', marginTop: '2px',
                color: m.is_free ? 'var(--success)' : 'var(--text2)'
              }}>
                {m.is_free ? '✅ FREE' : '🔒 Watch ad'}
              </div>
            </div>
            <span style={{ color: 'var(--text2)' }}>→</span>
          </div>
        ))}

        {adv.length > 0 && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              margin: '24px 0 12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ff6b35' }}>
                🔥 ADVANCED
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>
            {adv.map(m => (
              <div key={m.id} onClick={() => openModule(m)} style={{
                padding: '18px', background: 'var(--surface)',
                border: '1px solid rgba(255,107,53,0.2)', borderRadius: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '14px', marginBottom: '10px'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg,#ff6b35,#ff8f65)',
                  color: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: '700', flexShrink: 0
                }}>{m.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                    Module {m.id}: {m.title}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: '600',
                    color: '#ff6b35', marginTop: '2px'
                  }}>🔥 ADVANCED • Watch ad</div>
                </div>
                <span style={{ color: 'var(--text2)' }}>→</span>
              </div>
            ))}
          </>
        )}

        <button onClick={() => startGeneralQuiz('all')}
          style={{ ...accentBtn, marginTop: '16px' }}>
          🧠 Full Quiz ({skillData.quiz.length} Questions)
        </button>
      </div>
    )
  }

  // ===== CONTENT VIEW =====
  if (view === 'content' && selectedModule) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '24px', flexWrap: 'wrap'
        }}>
          <button onClick={goBack} style={btnStyle}>← Back</button>
          <h2 style={{
            fontSize: '1.3rem', fontWeight: '700',
            fontFamily: 'Cormorant Garamond, serif'
          }}>Module {selectedModule.id}: {selectedModule.title}</h2>
          {selectedModule.level === 'advanced' && (
            <span style={{
              padding: '3px 10px', background: 'rgba(255,107,53,0.1)',
              borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700',
              color: '#ff6b35'
            }}>🔥 ADVANCED</span>
          )}
        </div>

        {selectedModule.sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent)',
              marginBottom: '10px', fontFamily: 'Cormorant Garamond, serif'
            }}>{section.heading}</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '12px' }}>
              {section.content}
            </p>
            {section.code && (
              <div style={{
                background: '#1a1a2e', color: '#e0e0e0', padding: '16px',
                borderRadius: '12px', fontSize: '0.82rem',
                fontFamily: "monospace",
                overflowX: 'auto', marginBottom: '12px', lineHeight: '1.6',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }}>
                <code>{section.code}</code>
              </div>
            )}
            {section.tip && (
              <div style={{
                background: 'rgba(200,158,83,0.08)',
                border: '1px solid rgba(200,158,83,0.2)',
                borderRadius: '12px', padding: '14px', marginBottom: '12px'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent)', lineHeight: '1.5' }}>
                  💡 <strong>Tip:</strong> {section.tip}
                </p>
              </div>
            )}
          </div>
        ))}

        {selectedModule.key_points && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{
              fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent)',
              marginBottom: '10px', fontFamily: 'Cormorant Garamond, serif'
            }}>🔑 Key Points</h3>
            {selectedModule.key_points.map((p, i) => (
              <div key={i} style={{
                padding: '10px 14px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: '10px',
                fontSize: '0.85rem', marginBottom: '8px',
                display: 'flex', gap: '10px'
              }}>
                <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{i + 1}.</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          {selectedModule.module_quiz && selectedModule.module_quiz.length > 0 && (
            <button onClick={() => startModuleQuiz(selectedModule)}
              style={{ ...accentBtn, flex: 1, background: '#6366f1' }}>
              📝 Module Quiz ({selectedModule.module_quiz.length} Q)
            </button>
          )}
          {selectedModule.id < skillData.modules.length ? (
            <button style={{ ...accentBtn, flex: 1 }} onClick={() => {
              const next = skillData.modules.find(m => m.id === selectedModule.id + 1)
              if (next) openModule(next)
            }}>Next Module →</button>
          ) : (
            <button style={{ ...accentBtn, flex: 1 }}
              onClick={() => startGeneralQuiz('all')}>🧠 Full Quiz</button>
          )}
        </div>

        <p style={{
          fontSize: '0.7rem', color: 'var(--text2)', textAlign: 'center',
          marginTop: '16px', fontStyle: 'italic'
        }}>AI-generated content verified across multiple sources.</p>
      </div>
    )
  }

  // ===== QUIZ VIEW =====
  if (view === 'quiz') {
    if (quizComplete) {
      const pct = Math.round((score / quizQuestions.length) * 100)
      const grade = pct >= 80 ? 'Excellent! 🏆' : pct >= 60 ? 'Good! 👍'
        : pct >= 40 ? 'Keep Practicing 📚' : 'Need More Study 💪'
      return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={goBack} style={{ ...btnStyle, marginBottom: '24px' }}>← Back</button>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '30px', textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.3rem', fontWeight: '700',
              fontFamily: 'Cormorant Garamond, serif', marginBottom: '8px'
            }}>
              {quizType === 'module' ? 'Module ' + (selectedModule?.id || '') + ' Quiz' : 'Quiz'} Complete!
            </h2>
            <div style={{
              fontSize: '3rem', fontWeight: '800',
              fontFamily: 'Cormorant Garamond, serif',
              color: pct >= 80 ? '#2D8A4E' : pct >= 50 ? '#D4900D' : '#D14343'
            }}>{pct}%</div>
            <p style={{
              fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px',
              color: pct >= 80 ? '#2D8A4E' : pct >= 50 ? '#D4900D' : '#D14343'
            }}>{grade}</p>
            <p style={{ color: 'var(--text2)' }}>{score}/{quizQuestions.length} correct</p>
          </div>

          <h3 style={{
            fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent)',
            marginTop: '24px', marginBottom: '12px',
            fontFamily: 'Cormorant Garamond, serif'
          }}>Review</h3>

          {answeredQuestions.map((q, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '20px', marginBottom: '12px',
              borderLeft: '4px solid ' + (q.isCorrect ? '#2D8A4E' : '#D14343')
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--text2)' }}>Q{i + 1}</span>
                <span style={{
                  fontSize: '0.82rem', fontWeight: '600',
                  color: q.isCorrect ? '#2D8A4E' : '#D14343'
                }}>{q.isCorrect ? '✅' : '❌'}</span>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>{q.question}</p>
              {!q.isCorrect && (
                <p style={{ fontSize: '0.82rem', color: '#2D8A4E' }}>
                  Correct: {q.options[q.correct]}
                </p>
              )}
              <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: '6px' }}>
                {q.explanation}
              </p>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={goBack} style={{ ...btnStyle, flex: 1 }}>Back</button>
            <button onClick={() => startQuiz(quizQuestions, quizType)}
              style={{ ...accentBtn, flex: 1 }}>🔄 Retry</button>
          </div>
        </div>
      )
    }

    const q = quizQuestions[quizIndex]
    if (!q) return null
    const progressColor = quizType === 'module' ? '#6366f1' : 'var(--accent)'

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={goBack} style={btnStyle}>← Exit</button>
          <h2 style={{
            fontSize: '1.2rem', fontWeight: '700',
            fontFamily: 'Cormorant Garamond, serif'
          }}>
            {quizType === 'module'
              ? '📝 Module ' + (selectedModule?.id || '') + ' Quiz'
              : (skillData?.icon || '') + ' Quiz'}
          </h2>
        </div>

        {quizType === 'general' && quizIndex === 0 && !selectedAnswer && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['all', 'easy', 'medium', 'hard'].map(f => (
              <button key={f} onClick={() => startGeneralQuiz(f)} style={{
                padding: '8px 16px',
                background: quizFilter === f ? 'var(--accent)' : 'var(--surface2)',
                border: '1px solid ' + (quizFilter === f ? 'var(--accent)' : 'var(--border)'),
                borderRadius: '10px',
                color: quizFilter === f ? 'white' : 'var(--text2)',
                fontSize: '0.82rem', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}>
                {f === 'all'
                  ? 'All (' + skillData.quiz.length + ')'
                  : f[0].toUpperCase() + f.slice(1) + ' (' + skillData.quiz.filter(x => x.difficulty === f).length + ')'}
              </button>
            ))}
          </div>
        )}

        <div style={{
          height: '6px', background: 'var(--surface2)',
          borderRadius: '3px', marginBottom: '16px'
        }}>
          <div style={{
            height: '100%',
            width: ((quizIndex + 1) / quizQuestions.length * 100) + '%',
            background: progressColor,
            borderRadius: '3px', transition: 'width 0.5s'
          }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
            Q{quizIndex + 1}/{quizQuestions.length}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: '600' }}>
            Score: {score}
          </span>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '24px'
        }}>
          {q.difficulty && (
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
              fontSize: '0.72rem', fontWeight: '600', marginBottom: '10px',
              background: q.difficulty === 'easy' ? 'rgba(45,138,78,0.1)'
                : q.difficulty === 'medium' ? 'rgba(212,144,13,0.1)'
                : 'rgba(209,67,67,0.1)',
              color: q.difficulty === 'easy' ? '#2D8A4E'
                : q.difficulty === 'medium' ? '#D4900D' : '#D14343'
            }}>{q.difficulty.toUpperCase()}</span>
          )}

          <p style={{
            fontSize: '1rem', fontWeight: '600',
            lineHeight: '1.6', marginBottom: '16px'
          }}>{q.question}</p>

          {q.options.map((opt, idx) => {
            let bg = 'var(--surface2)'
            let bd = 'var(--border)'
            let cl = 'var(--text)'
            if (showExplanation) {
              if (idx === q.correct) {
                bg = 'rgba(45,138,78,0.1)'
                bd = 'rgba(45,138,78,0.4)'
                cl = '#2D8A4E'
              } else if (idx === selectedAnswer) {
                bg = 'rgba(209,67,67,0.1)'
                bd = 'rgba(209,67,67,0.4)'
                cl = '#D14343'
              }
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} style={{
                padding: '14px 16px',
                background: bg,
                border: '1px solid ' + bd,
                borderRadius: '12px',
                cursor: showExplanation ? 'default' : 'pointer',
                marginBottom: '8px',
                fontSize: '0.9rem',
                color: cl,
                fontFamily: 'Inter, sans-serif',
                width: '100%',
                textAlign: 'left',
                display: 'block'
              }}>
                <span style={{ fontWeight: '600', marginRight: '10px' }}>
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            )
          })}

          {showExplanation && (
            <>
              <div style={{
                background: 'rgba(200,158,83,0.08)',
                border: '1px solid rgba(200,158,83,0.2)',
                borderRadius: '12px', padding: '14px', marginTop: '12px'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent)', lineHeight: '1.5' }}>
                  💡 {q.explanation}
                </p>
              </div>
              <button onClick={nextQuestion} style={{
                ...accentBtn,
                marginTop: '12px',
                background: progressColor
              }}>
                {quizIndex + 1 >= quizQuestions.length ? 'View Results ✓' : 'Next Question →'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}
