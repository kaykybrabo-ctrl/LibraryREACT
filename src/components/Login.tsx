import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        navigate('/books')
      } else {
        setError('Usuário ou senha inválidos')
      }
    } catch (err) {
      setError('Falha no login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="login-container">
      <h1>PedBook</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Usuário:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          placeholder="Digite seu nome de usuário"
        />

        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-link">
        Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
      </p>
    </div>
  )
}

export default Login
