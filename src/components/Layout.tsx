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
  }

  return (
    <>
      <header>
        <h1>{title}</h1>
        <button id="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav>
        <Link 
          to="/books" 
          className={location.pathname === '/books' ? 'active' : ''}
        >
          Books
        </Link>
        <Link 
          to="/authors" 
          className={location.pathname === '/authors' ? 'active' : ''}
        >
          Authors
        </Link>
        <Link 
          to="/profile" 
          className={location.pathname === '/profile' ? 'active' : ''}
        >
          Profile
        </Link>
      </nav>

      <main>{children}</main>

      <footer>
        <p>&copy; 2025 Library System</p>
      </footer>
    </>
  )
}

export default Layout
