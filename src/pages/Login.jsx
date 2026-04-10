import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    script.async = true
    document.head.appendChild(script)
    window.onTurnstileLoad = () => {
      if (document.getElementById('turnstile-container')) {
        window.turnstile.render('#turnstile-container', {
          sitekey: '0x4AAAAAAC6H1V1ER1tT2Pwu',
          callback: (token) => setTurnstileToken(token),
          'refresh-expired': 'auto'
        })
      }
    }
  }, [])

  const sendOTP = async () => {
    if (!turnstileToken && window.location.hostname !== 'localhost') {
      setMessage('Security check in progress... try again in a moment.')
      return
    }
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setStep('verify')
      setMessage('OTP sent! Check your inbox.')
    }
    setLoading(false)
  }

  const verifyOTP = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon">⚡</div>
          <h1>JobApp</h1>
          <p className="tagline">Your career command center</p>
        </div>

        {step === 'login' && (
          <div className="login-card">
            <h2>Welcome, Commander!</h2>
            <p>Enter your email to get started</p>
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
              />
            </div>
            <div id="turnstile-container"></div>
            <button className="btn-primary" onClick={sendOTP} disabled={loading || !email}>
              {loading ? <span className="spinner"></span> : 'Send OTP →'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="login-card">
            <h2>Check Your Email 📬</h2>
            <p>Enter the code sent to <strong>{email}</strong></p>
            <div className="input-group">
              <span className="input-icon">🔑</span>
              <input
                type="text"
                placeholder="Enter OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyOTP()}
                maxLength={8}
              />
            </div>
            <button className="btn-primary" onClick={verifyOTP} disabled={loading || !otp}>
              {loading ? <span className="spinner"></span> : 'Verify & Login →'}
            </button>
            <button className="btn-ghost" onClick={() => setStep('login')}>
              ← Back
            </button>
          </div>
        )}

        {message && <div className="toast">{message}</div>}
      </div>
    </div>
  )
}