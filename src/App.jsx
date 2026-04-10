import { useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  const sendOTP = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setStep('verify')
      setMessage('OTP sent to your email! Check inbox.')
    }
    setLoading(false)
  }

  const verifyOTP = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })
    if (error) {
      setMessage(error.message)
    } else {
      setUser(data.user)
      setStep('dashboard')
      setMessage('Login successful!')
    }
    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setStep('login')
    setEmail('')
    setOtp('')
    setMessage('')
  }

  return (
    <div className="container">
      <h1>🎯 JobApp</h1>

      {step === 'login' && (
        <div className="card">
          <h2>Welcome, Commander!</h2>
          <p>Enter your email to get started</p>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendOTP} disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="card">
          <h2>Check Your Email</h2>
          <p>Enter the 6-digit code sent to {email}</p>
          <input
            type="text"
            placeholder="Enter OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOTP} disabled={loading || !otp}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button className="secondary" onClick={() => setStep('login')}>
            Back
          </button>
        </div>
      )}

      {step === 'dashboard' && (
        <div className="card">
          <h2>Welcome, Commander! 🚀</h2>
          <p>Logged in as: {user?.email}</p>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default App