import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const API_URL = 'https://jobapp-api.aatechonologiesofficial.workers.dev'

export default function CVBuilder() {
  const cvRef = useRef()
  const [activeSection, setActiveSection] = useState('personal')
  const [template, setTemplate] = useState('modern')
  const [generating, setGenerating] = useState(false)
  const [improving, setImproving] = useState(null)

  const [cv, setCv] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    education: [{ degree: '', institution: '', year: '', grade: '' }],
    experience: [{ title: '', company: '', duration: '', description: '' }],
    skills: [''],
    languages: [''],
    certifications: ['']
  })

  const updateField = (field, value) => {
    setCv(prev => ({ ...prev, [field]: value }))
  }

  const updateArrayItem = (field, index, key, value) => {
    setCv(prev => {
      const arr = [...prev[field]]
      if (typeof arr[index] === 'object') {
        arr[index] = { ...arr[index], [key]: value }
      } else {
        arr[index] = value
      }
      return { ...prev, [field]: arr }
    })
  }

  const addItem = (field, template) => {
    setCv(prev => ({ ...prev, [field]: [...prev[field], template] }))
  }

  const removeItem = (field, index) => {
    setCv(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const improveWithAI = async (text, callback) => {
    if (!text.trim()) return
    setImproving(callback.toString())
    try {
      const res = await fetch(`${API_URL}/api/ai/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (data.improved) {
        callback(data.improved)
      }
    } catch (err) {
      console.error('AI improve failed:', err)
    }
    setImproving(null)
  }

  const downloadPDF = async () => {
    setGenerating(true)
    try {
      const element = cvRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${cv.name || 'MyCV'}_Resume.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
    setGenerating(false)
  }

  const sections = [
    { id: 'personal', label: '👤 Personal', icon: '👤' },
    { id: 'education', label: '🎓 Education', icon: '🎓' },
    { id: 'experience', label: '💼 Experience', icon: '💼' },
    { id: 'skills', label: '⚡ Skills', icon: '⚡' },
    { id: 'preview', label: '📄 Preview', icon: '📄' }
  ]

  return (
    <div className="cv-builder">
      <div className="cv-header">
        <h2>CV Builder ✨</h2>
        <p>Create a professional resume in minutes</p>
      </div>

      <div className="cv-tabs">
        {sections.map(s => (
          <button
            key={s.id}
            className={`cv-tab ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'personal' && (
        <div className="cv-section">
          <h3>Personal Information</h3>
          <div className="cv-form">
            <div className="cv-field">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={cv.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="cv-field">
              <label>Email</label>
              <input type="email" placeholder="john@example.com" value={cv.email} onChange={e => updateField('email', e.target.value)} />
            </div>
            <div className="cv-field">
              <label>Phone</label>
              <input type="tel" placeholder="+91 9876543210" value={cv.phone} onChange={e => updateField('phone', e.target.value)} />
            </div>
            <div className="cv-field">
              <label>Location</label>
              <input type="text" placeholder="Hyderabad, India" value={cv.location} onChange={e => updateField('location', e.target.value)} />
            </div>
            <div className="cv-field full">
              <label>Professional Summary</label>
              <textarea placeholder="Brief summary about yourself..." value={cv.summary} onChange={e => updateField('summary', e.target.value)} rows={4} />
              {cv.summary && (
                <button className="ai-btn" onClick={() => improveWithAI(cv.summary, (text) => updateField('summary', text))}>
                  {improving ? '✨ Improving...' : '✨ AI Improve'}
                </button>
              )}
            </div>
          </div>
          <button className="cv-next-btn" onClick={() => setActiveSection('education')}>Next: Education →</button>
        </div>
      )}

      {activeSection === 'education' && (
        <div className="cv-section">
          <h3>Education</h3>
          {cv.education.map((edu, i) => (
            <div key={i} className="cv-card">
              <div className="cv-card-header">
                <span>Education {i + 1}</span>
                {cv.education.length > 1 && (
                  <button className="cv-remove" onClick={() => removeItem('education', i)}>✕</button>
                )}
              </div>
              <div className="cv-form">
                <div className="cv-field">
                  <label>Degree</label>
                  <input type="text" placeholder="B.Tech Computer Science" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} />
                </div>
                <div className="cv-field">
                  <label>Institution</label>
                  <input type="text" placeholder="University Name" value={edu.institution} onChange={e => updateArrayItem('education', i, 'institution', e.target.value)} />
                </div>
                <div className="cv-field">
                  <label>Year</label>
                  <input type="text" placeholder="2020 - 2024" value={edu.year} onChange={e => updateArrayItem('education', i, 'year', e.target.value)} />
                </div>
                <div className="cv-field">
                  <label>Grade/CGPA</label>
                  <input type="text" placeholder="8.5 CGPA" value={edu.grade} onChange={e => updateArrayItem('education', i, 'grade', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button className="cv-add-btn" onClick={() => addItem('education', { degree: '', institution: '', year: '', grade: '' })}>+ Add Education</button>
          <button className="cv-next-btn" onClick={() => setActiveSection('experience')}>Next: Experience →</button>
        </div>
      )}

      {activeSection === 'experience' && (
        <div className="cv-section">
          <h3>Work Experience</h3>
          {cv.experience.map((exp, i) => (
            <div key={i} className="cv-card">
              <div className="cv-card-header">
                <span>Experience {i + 1}</span>
                {cv.experience.length > 1 && (
                  <button className="cv-remove" onClick={() => removeItem('experience', i)}>✕</button>
                )}
              </div>
              <div className="cv-form">
                <div className="cv-field">
                  <label>Job Title</label>
                  <input type="text" placeholder="Software Developer" value={exp.title} onChange={e => updateArrayItem('experience', i, 'title', e.target.value)} />
                </div>
                <div className="cv-field">
                  <label>Company</label>
                  <input type="text" placeholder="Company Name" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} />
                </div>
                <div className="cv-field">
                  <label>Duration</label>
                  <input type="text" placeholder="Jan 2023 - Present" value={exp.duration} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value)} />
                </div>
                <div className="cv-field full">
                  <label>Description</label>
                  <textarea placeholder="What did you do in this role?" value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} rows={3} />
                  {exp.description && (
                    <button className="ai-btn" onClick={() => improveWithAI(exp.description, (text) => updateArrayItem('experience', i, 'description', text))}>
                      {improving ? '✨ Improving...' : '✨ AI Improve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button className="cv-add-btn" onClick={() => addItem('experience', { title: '', company: '', duration: '', description: '' })}>+ Add Experience</button>
          <button className="cv-next-btn" onClick={() => setActiveSection('skills')}>Next: Skills →</button>
        </div>
      )}

      {activeSection === 'skills' && (
        <div className="cv-section">
          <h3>Skills & Languages</h3>
          <div className="cv-card">
            <div className="cv-card-header"><span>Skills</span></div>
            {cv.skills.map((skill, i) => (
              <div key={i} className="cv-inline-field">
                <input type="text" placeholder="e.g. JavaScript, Python, Excel" value={skill} onChange={e => updateArrayItem('skills', i, null, e.target.value)} />
                {cv.skills.length > 1 && (
                  <button className="cv-remove-sm" onClick={() => removeItem('skills', i)}>✕</button>
                )}
              </div>
            ))}
            <button className="cv-add-btn" onClick={() => addItem('skills', '')}>+ Add Skill</button>
          </div>

          <div className="cv-card">
            <div className="cv-card-header"><span>Languages</span></div>
            {cv.languages.map((lang, i) => (
              <div key={i} className="cv-inline-field">
                <input type="text" placeholder="e.g. English, Hindi, Telugu" value={lang} onChange={e => updateArrayItem('languages', i, null, e.target.value)} />
                {cv.languages.length > 1 && (
                  <button className="cv-remove-sm" onClick={() => removeItem('languages', i)}>✕</button>
                )}
              </div>
            ))}
            <button className="cv-add-btn" onClick={() => addItem('languages', '')}>+ Add Language</button>
          </div>

          <div className="cv-card">
            <div className="cv-card-header"><span>Certifications</span></div>
            {cv.certifications.map((cert, i) => (
              <div key={i} className="cv-inline-field">
                <input type="text" placeholder="e.g. AWS Certified, Google Analytics" value={cert} onChange={e => updateArrayItem('certifications', i, null, e.target.value)} />
                {cv.certifications.length > 1 && (
                  <button className="cv-remove-sm" onClick={() => removeItem('certifications', i)}>✕</button>
                )}
              </div>
            ))}
            <button className="cv-add-btn" onClick={() => addItem('certifications', '')}>+ Add Certification</button>
          </div>

          <button className="cv-next-btn" onClick={() => setActiveSection('preview')}>Preview CV →</button>
        </div>
      )}

      {activeSection === 'preview' && (
        <div className="cv-section">
          <div className="cv-template-picker">
            <span>Template:</span>
            {['modern', 'classic', 'minimal'].map(t => (
              <button key={t} className={`template-btn ${template === t ? 'active' : ''}`} onClick={() => setTemplate(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="cv-preview-wrap">
            <div ref={cvRef} className={`cv-preview cv-${template}`}>
              <div className="cv-p-header">
                <h1>{cv.name || 'Your Name'}</h1>
                <div className="cv-p-contact">
                  {cv.email && <span>📧 {cv.email}</span>}
                  {cv.phone && <span>📱 {cv.phone}</span>}
                  {cv.location && <span>📍 {cv.location}</span>}
                </div>
              </div>

              {cv.summary && (
                <div className="cv-p-section">
                  <h2>Professional Summary</h2>
                  <p>{cv.summary}</p>
                </div>
              )}

              {cv.education.some(e => e.degree) && (
                <div className="cv-p-section">
                  <h2>Education</h2>
                  {cv.education.filter(e => e.degree).map((edu, i) => (
                    <div key={i} className="cv-p-item">
                      <div className="cv-p-item-header">
                        <strong>{edu.degree}</strong>
                        <span>{edu.year}</span>
                      </div>
                      <div className="cv-p-item-sub">
                        {edu.institution} {edu.grade && `| ${edu.grade}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cv.experience.some(e => e.title) && (
                <div className="cv-p-section">
                  <h2>Work Experience</h2>
                  {cv.experience.filter(e => e.title).map((exp, i) => (
                    <div key={i} className="cv-p-item">
                      <div className="cv-p-item-header">
                        <strong>{exp.title}</strong>
                        <span>{exp.duration}</span>
                      </div>
                      <div className="cv-p-item-sub">{exp.company}</div>
                      {exp.description && <p className="cv-p-desc">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {cv.skills.some(s => s) && (
                <div className="cv-p-section">
                  <h2>Skills</h2>
                  <div className="cv-p-tags">
                    {cv.skills.filter(s => s).map((skill, i) => (
                      <span key={i} className="cv-p-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {cv.languages.some(l => l) && (
                <div className="cv-p-section">
                  <h2>Languages</h2>
                  <div className="cv-p-tags">
                    {cv.languages.filter(l => l).map((lang, i) => (
                      <span key={i} className="cv-p-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              )}

              {cv.certifications.some(c => c) && (
                <div className="cv-p-section">
                  <h2>Certifications</h2>
                  <div className="cv-p-tags">
                    {cv.certifications.filter(c => c).map((cert, i) => (
                      <span key={i} className="cv-p-tag">{cert}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="cv-download-btn" onClick={downloadPDF} disabled={generating}>
            {generating ? 'Generating PDF...' : '📥 Download as PDF'}
          </button>
        </div>
      )}
    </div>
  )
}