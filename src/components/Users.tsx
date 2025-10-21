import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import './Cards.css'

interface User {
  user_id: number
  username: string
  role: string
  profile_image?: string
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      
      const usersWithProfiles = await Promise.all(
        response.data.map(async (user: User) => {
          try {
            const profileResponse = await axios.get(`/api/test-profile?username=${user.username}`)
            return {
              ...user,
              profile_image: profileResponse.data.profile_image
            }
          } catch (err) {
            return user
          }
        })
      )
      
      setUsers(usersWithProfiles)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Falha ao carregar usuários')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Usuários">
        <div className="loading">Carregando usuários...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Usuários">
      {error && <div className="error-message">{error}</div>}
      
      <section className="user-list">
        <div className="cards-grid">
          {users.map(user => (
            <div key={user.user_id} className="card author-card">
              <div className="author-avatar">
                <img 
                  src={getImageUrl(user.profile_image, 'profile')} 
                  alt={user.username}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${user.username}`)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackImageUrl('profile')
                  }}
                />
              </div>

              <div className="card-header">
                <h3 className="card-title">
                  <span onClick={() => navigate(`/profile/${user.username}`)} style={{ cursor: 'pointer' }}>
                    {user.username}
                  </span>
                </h3>
                <span className="card-id">
                  {user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                </span>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-field-value">
                    {user.role === 'admin' ? 'Administrador do sistema' : 'Membro da comunidade'}
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-primary" onClick={() => navigate(`/profile/${user.username}`)}>
                  👁️ Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}

export default Users
