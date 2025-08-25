import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Register from './components/Register'
import Books from './components/Books'
import Authors from './components/Authors'
import BookDetail from './components/BookDetail'
import AuthorDetail from './components/AuthorDetail'
import UserProfile from './components/UserProfile'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          } />
          <Route path="/authors" element={
            <ProtectedRoute>
              <Authors />
            </ProtectedRoute>
          } />
          <Route path="/books/:id" element={
            <ProtectedRoute>
              <BookDetail />
            </ProtectedRoute>
          } />
          <Route path="/authors/:id" element={
            <ProtectedRoute>
              <AuthorDetail />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
