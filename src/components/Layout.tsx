import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
  title: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    window.location.replace('/')
  }

  return (
    <>
      <header>
        <h1>{title}</h1>
        <button id="logout-button" onClick={handleLogout}>
          Sair
        </button>
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
