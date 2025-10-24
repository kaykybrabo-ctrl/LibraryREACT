import React, { useState, useEffect, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'

interface LayoutProps {
  children: ReactNode
  title: string
}
interface UserProfile {
  profile_image?: string
  username: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, user, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (user?.username) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/get-profile?username=${user?.username}&t=${Date.now()}`)
      setUserProfile(response.data)
    } catch (err) {
    }
  }

  const handleLogout = () => {
    logout()
    window.location.replace('/')
  }

  return (
    <>
      <header>
        <h1 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Voltar para o início"
        >
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
          {isAuthenticated ? (
            <div className="user-menu" style={{ position: 'relative' }}>
              <img
                src={getImageUrl(userProfile?.profile_image, 'profile')}
                alt="Perfil"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid white',
                  cursor: 'pointer'
                }}
                onClick={() => setShowDropdown(!showDropdown)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackImageUrl('profile')
                }}
              />
              {showDropdown && (
                <div className="dropdown-menu" style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '150px',
                  zIndex: 1000
                }}>
                  <Link 
                    to="/profile" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#374151',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: '14px'
                    }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <span>👤</span>
                    <span>Ir ao Perfil</span>
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setShowDropdown(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span>🚪</span>
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                to="/login"
                style={{
                  background: 'white',
                  color: '#162c74',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Login
              </Link>
              <Link 
                to="/register"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Registrar
              </Link>
            </>
          )}
        </div>
      </header>

      <nav>
        <Link 
          to="/books" 
          className={location.pathname === '/books' ? 'active' : ''}
        >
          Livros
        </Link>
        <Link 
          to="/authors" 
          className={location.pathname === '/authors' ? 'active' : ''}
        >
          Autores
        </Link>
        <Link 
          to="/users" 
          className={location.pathname === '/users' ? 'active' : ''}
        >
          Usuários
        </Link>
        <Link 
          to="/profile" 
          className={location.pathname === '/profile' ? 'active' : ''}
        >
          Perfil
        </Link>
      </nav>

      <main>{children}</main>

      <footer>
        <p>&copy; 2025 PedBook</p>
      </footer>
    </>
  )
}

export default Layout
