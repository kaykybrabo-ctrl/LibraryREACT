import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import './BookDetails.css'

interface Book {
  book_id: number
  title: string
  description?: string
  photo?: string
  author_id: number
  author_name?: string
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLoginMessage, setShowLoginMessage] = useState(false)

  useEffect(() => {
    if (id) {
      fetchBook()
    }
  }, [id])

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books`)
      const books = response.data
      const foundBook = books.find((b: any) => b.book_id === parseInt(id!))
      
      if (foundBook) {
        const authorsResponse = await axios.get('/api/authors')
        const authors = authorsResponse.data
        const author = authors.find((a: any) => a.author_id === foundBook.author_id)
        
        setBook({
          ...foundBook,
          author_name: author?.name_author || 'Autor desconhecido'
        })
      } else {
        setError('Livro não encontrado')
      }
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar detalhes do livro')
      setLoading(false)
    }
  }

  const handleAuthRequiredAction = (action: string) => {
    if (!isAuthenticated) {
      setShowLoginMessage(true)
      setTimeout(() => setShowLoginMessage(false), 4000)
      return
    }
    
    if (action === 'rent') {
      handleRent()
    } else if (action === 'favorite') {
      handleFavorite()
    }
  }

  const handleRent = async () => {
    try {
      await axios.post(`/api/rent/${book?.book_id}`)
      alert('Livro alugado com sucesso!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao alugar livro'
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleFavorite = async () => {
    try {
      await axios.post(`/api/set-favorite/${book?.book_id}`)
      alert('Livro favoritado com sucesso!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao favoritar livro'
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  if (loading) {
    return (
      <Layout title="Detalhes do Livro">
        <div className="loading">Carregando detalhes...</div>
      </Layout>
    )
  }

  if (error || !book) {
    return (
      <Layout title="Detalhes do Livro">
        <div className="error-message">{error}</div>
      </Layout>
    )
  }

  return (
    <Layout title={book.title}>
      {showLoginMessage && (
        <div className="login-message">
          <p>É necessário fazer login para realizar esta ação.</p>
          <button onClick={handleGoToLogin} className="btn-primary">
            Fazer Login
          </button>
          <button onClick={() => setShowLoginMessage(false)} className="btn-secondary">
            Fechar
          </button>
        </div>
      )}

      <div className="book-details-container">
        <button onClick={() => navigate('/books')} className="back-button">
          ← Voltar aos Livros
        </button>

        <div className="book-details-content">
          <div className="book-image-section">
            <img
              src={getImageUrl(book.photo, 'book')}
              alt={book.title}
              className="book-detail-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
              }}
            />
          </div>

          <div className="book-info-section">
            <h1>{book.title}</h1>
            <p className="book-author">por {book.author_name}</p>
            
            {book.description && (
              <div className="book-description">
                <h3>Descrição</h3>
                <p>{book.description}</p>
              </div>
            )}

            <div className="book-actions">
              <button 
                onClick={() => handleAuthRequiredAction('rent')}
                className="btn-primary"
              >
                📚 Alugar Livro
              </button>
              
              <button 
                onClick={() => handleAuthRequiredAction('favorite')}
                className="btn-secondary"
              >
                ⭐ Favoritar
              </button>

              {!isAuthenticated && (
                <p className="auth-hint">
                  <small>Faça login para alugar ou favoritar este livro</small>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BookDetails
