import React, { useState, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'

interface LayoutProps {
  children: ReactNode
  title: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, user, isAuthenticated } = useAuth()
  const { userProfile, profileImageKey } = useProfile()
  const location = useLocation()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.replace('/')
  }

  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <header>
          <h1 
            onClick={() => navigate('/')}
            className="clickable-header"
            title="Voltar para o início"
          >
            {title}
          </h1>
          <div className="header-user-menu">
            {isAuthenticated ? (
              <div className="user-menu">
                <img
                  key={profileImageKey}
                  src={getImageUrl(userProfile?.profile_image, 'profile', profileImageKey > 0)}
                  alt="Perfil"
                  className="user-avatar"
                  onClick={() => setShowDropdown(!showDropdown)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackImageUrl('profile')
                  }}
                />
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-link"
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
                      className="dropdown-button"
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
                  className="auth-link-login"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="auth-link-register"
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
      </div>

      <footer>
        <p>&copy; 2025 PedBook</p>
      </footer>
    </div>
  )
}

export default Layout
