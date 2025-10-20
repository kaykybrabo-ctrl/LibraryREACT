import React, { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

interface LayoutProps {
  children: ReactNode
  title: string
}

interface UserProfile {
  profile_image?: string
  username: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

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
        <h1>{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src={userProfile?.profile_image ? `/api/uploads/${userProfile.profile_image}` : `/api/uploads/default-user.png`}
              alt="Perfil"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white',
                cursor: 'pointer'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `/api/uploads/default-user.png`
              }}
            />
          </Link>
          <button 
            onClick={handleLogout}
            style={{
              background: 'white',
              color: '#162c74',
              padding: '6px 16px',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
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
