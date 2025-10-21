import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './ResetPassword.css'

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Password reset instructions have been sent to your email.')
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resetContainer">
      <div className="resetCard">
        <div className="resetHeader">
          <h2>Reset Password</h2>
          <p>Enter your email address and we'll send you instructions to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="resetForm">
          {error && <div className="errorMessage">{error}</div>}
          {message && <div className="successMessage">{message}</div>}
          
          <div className="inputGroup">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="resetBtn"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="resetFooter">
          <p>
            Remember your password? <Link to="/login">Back to Login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
