import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext'
import { setShowLoginModal } from './api'
import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import LoginModal from './components/LoginModal'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Books from './components/Books'
import Authors from './components/Authors'
import Users from './components/Users'
import BookDetail from './components/BookDetail'
import AuthorDetail from './components/AuthorDetail'
import UserProfile from './components/UserProfile'
import Loans from './components/Loans'
import MyLoans from './components/MyLoans'

function AppContent() {
  const { showLoginModal, hideLoginModal, isModalOpen, modalMessage } = useAuthModal();

  useEffect(() => {
    setShowLoginModal(showLoginModal);
  }, [showLoginModal]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books" element={<Books />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/authors/:id" element={<AuthorDetail />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/loans" element={
          <ProtectedRoute>
            <Loans />
          </ProtectedRoute>
        } />
        <Route path="/my-loans" element={
          <ProtectedRoute>
            <MyLoans />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={hideLoginModal} 
        message={modalMessage}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthModalProvider>
    </AuthProvider>
  )
}

export default App
