import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Book, Review } from '../types'
import './BookDetail.css'

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (id) {
      fetchBook()
      fetchReviews()
      checkAuthStatus()
    }
  }, [id])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/user/me')
      setCurrentUser(response.data)
    } catch {
      setCurrentUser(null)
    }
  }

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`)
      setBook(response.data)
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar detalhes do livro')
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews')
      const bookReviews = response.data.filter((review: Review) => 
        review.book_id === Number(id)
      )
      setReviews(bookReviews)
    } catch (err) {
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !id) return

    setUploading(true)
    const formData = new FormData()
    formData.append('book_image', imageFile)

    try {
      await axios.post(`/api/books/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchBook()
      setImageFile(null)
    } catch (err) {
      setError('Falha ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRentBook = async () => {
    try {
      await axios.post(`/api/rent/${id}`)
      alert('Livro alugado com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao alugar livro. Você pode não estar logado ou o livro já está alugado.'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleFavoriteBook = async () => {
    try {
      await axios.post(`/api/favorite/${id}`)
      alert('Livro adicionado aos favoritos!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao adicionar livro aos favoritos'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setError('Faça login para enviar uma avaliação')
      return
    }

    try {
      await axios.post('/api/reviews', {
        book_id: Number(id),
        user_id: currentUser.id,
        rating: newReview.rating,
        comment: newReview.comment
      })
      
      setNewReview({ rating: 5, comment: '' })
      fetchReviews()
      alert('Avaliação enviada com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao enviar avaliação'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  if (loading) {
    return (
      <Layout title="Detalhes do Livro">
        <div className="loading">Carregando detalhes do livro...</div>
      </Layout>
    )
  }

  if (!book) {
    return (
      <Layout title="Detalhes do Livro">
        <div className="error-message">Livro não encontrado</div>
        <button onClick={() => navigate('/books')}>Voltar aos Livros</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Livro: ${book.title}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/books')} className="back-button">
          ← Voltar aos Livros
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Autor:</strong> {book.author_name || 'Desconhecido'}</p>
        <p><strong>Descrição:</strong> {book.description || 'Nenhuma descrição disponível'}</p>
        
        <div className="book-image-container">
          <img 
            src={getImageUrl(book.photo, 'book')} 
            alt={book.title}
            className="book-image-enhanced"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
            }}
          />
        </div>

        {isAdmin && (
          <div className="image-upload">
            <h3>Atualizar Imagem do Livro</h3>
            <form onSubmit={handleImageUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <button type="submit" disabled={!imageFile || uploading}>
                {uploading ? 'Enviando...' : 'Enviar Imagem'}
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="form-section">
        <h3>Ações do Livro</h3>
        <div className="book-actions">
          {!isAdmin && <button onClick={handleRentBook}>Alugar Livro</button>}
          <button onClick={handleFavoriteBook}>Adicionar aos Favoritos</button>
        </div>
      </section>

      <section className="form-section">
        <h3>Escrever uma Avaliação</h3>
        {!currentUser ? (
          <p>Faça login para escrever uma avaliação.</p>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '16px' }}>
              <label>Avaliação:</label>
              <div className="star-rating" style={{ marginTop: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    onMouseEnter={() => setNewReview({ ...newReview, rating: star })}
                    style={{
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: star <= newReview.rating ? '#162c74' : '#ddd',
                      transition: 'color 0.2s ease',
                      marginRight: '4px'
                    }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: '10px', color: '#666' }}>
                  {newReview.rating} de 5 estrelas
                </span>
              </div>
            </div>

            <label htmlFor="comment">Comentário:</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="review-textarea"
            />

            <button type="submit">Enviar Avaliação</button>
          </form>
        )}
      </section>

      <section className="form-section">
        <h3>Avaliações</h3>
        {reviews.length === 0 ? (
          <p>Nenhuma avaliação ainda.</p>
        ) : (
          <div>
            {reviews.map(review => (
              <div key={review.review_id} className="review-card">
                <div className="review-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong 
                      onClick={() => navigate(`/profile/${review.username}`)}
                      style={{ 
                        cursor: 'pointer', 
                        color: '#162c74', 
                        textDecoration: 'underline'
                      }}
                    >
                      👤 {review.username || 'Usuário'}
                    </strong>
                    <span style={{ color: '#ffa500', fontSize: '18px' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <small className="review-date">
                    {review.created_at ? 
                      new Date(review.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : 
                      'Data não disponível'
                    }
                  </small>
                </div>
                <p style={{ margin: '10px 0', lineHeight: '1.5' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default BookDetail
