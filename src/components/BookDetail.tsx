import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../api'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { useAuthModal } from '../contexts/AuthModalContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Book, Review, Author } from '../types'
import RentModal from './RentModal'
import EditModal from './EditModal'
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
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(5)
  const [showRentModal, setShowRentModal] = useState(false)
  const [rentLoading, setRentLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const { isAdmin, user } = useAuth()
  const { showLoginModal } = useAuthModal()

  useEffect(() => {
    if (id) {
      fetchBook()
      fetchReviews()
      checkAuthStatus()
      if (isAdmin) {
        fetchAuthors()
      }
    }
  }, [id, isAdmin])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentUser(response.data)
    } catch (err) {
      setCurrentUser(null)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors?limit=1000')
      setAuthors(response.data)
    } catch (err) {
      console.error('Erro ao carregar autores:', err)
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

  const handleRentBook = () => {
    if (!user) {
      showLoginModal('É necessário fazer login para alugar livros')
      return
    }
    if (isAdmin) {
      alert('Administradores não podem alugar livros')
      return
    }
    setShowRentModal(true)
  }

  const handleConfirmRent = async (returnDate: string) => {
    setRentLoading(true)
    try {
      await api.post(`/rent/${id}`, {
        return_date: returnDate
      })
      setShowRentModal(false)
      alert('Livro alugado com sucesso!')
      setError('')
    } catch (err: any) {
      if (err.name === 'AuthModalError' || err.name === 'SilentAuthError') {
        return;
      }
      const errorMsg = err.response?.data?.error || 'Falha ao alugar livro.'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    } finally {
      setRentLoading(false)
    }
  }

  const handleEditBook = async (data: any) => {
    setEditLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      
      if (data.useNewAuthor && data.new_author_name) {
        formData.append('new_author_name', data.new_author_name)
      } else {
        formData.append('author_id', data.author_id)
      }
      
      if (data.imageFile) {
        formData.append('photo', data.imageFile)
      }

      await axios.put(`/api/books/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      await fetchBook()
      alert('Livro atualizado com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao atualizar livro'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    } finally {
      setEditLoading(false)
    }
  }

  const handleFavoriteBook = async () => {
    if (!user) {
      showLoginModal('É necessário fazer login para favoritar livros')
      return
    }
    try {
      await api.post(`/favorite/${id}`)
      alert('Livro adicionado aos favoritos!')
      setError('')
    } catch (err: any) {
      if (err.name === 'AuthModalError' || err.name === 'SilentAuthError') {
        return;
      }
      const errorMsg = err.response?.data?.error || 'Falha ao adicionar livro aos favoritos'
      setError(errorMsg)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      showLoginModal('É necessário fazer login para deixar uma avaliação')
      return
    }

    if (isAdmin) {
      alert('Administradores não podem criar avaliações')
      return
    }

    if (newReview.rating === 0) {
      alert('Por favor, selecione pelo menos 1 estrela')
      return
    }

    try {
      await api.post('/reviews', {
        book_id: Number(id),
        user_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment
      })
      
      setNewReview({ rating: 0, comment: '' })
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
        <p><strong>Autor:</strong> 
          <span 
            className="author-link" 
            onClick={() => navigate(`/authors/${book.author_id}`)}
            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
          >
            {book.author_name || 'Desconhecido'}
          </span>
        </p>
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

      {/* Container unificado para detalhes, ações e avaliações */}
      <section className="unified-book-container">
        <div className="book-actions-section">
          <h3>Ações do Livro</h3>
          <div className="book-actions">
            {!isAdmin && user && <button onClick={handleRentBook}>Alugar Livro</button>}
            {!isAdmin && user && <button onClick={handleFavoriteBook}>Adicionar aos Favoritos</button>}
            {!user && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Faça login para alugar ou favoritar livros
              </p>
            )}
          </div>
        </div>

        <div className="reviews-section">
          <h3>Avaliações</h3>
          
          {/* Formulário de avaliação no topo */}
          {user && !isAdmin ? (
            <div className="review-form-section">
              <h4>Deixe sua avaliação</h4>
              <form onSubmit={handleSubmitReview}>
                <div className="review-form-container">
                  <label>Avaliação:</label>
                  <div className="star-rating star-rating-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        style={{ marginRight: '4px' }}
                      >
                        ★
                      </span>
                    ))}
                    <span className="star-rating-text">
                      {newReview.rating === 0 ? 'Selecione uma avaliação' : `${newReview.rating} de 5 estrelas`}
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
                  placeholder="Escreva sua opinião sobre o livro..."
                />

                <button type="submit" disabled={newReview.rating === 0}>
                  Enviar Avaliação
                </button>
              </form>
            </div>
          ) : !user ? (
            <div className="login-prompt">
              <p style={{ color: '#666', fontStyle: 'italic', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                É preciso fazer o login para deixar uma avaliação!
              </p>
            </div>
          ) : null}

          {/* Lista de avaliações com paginação */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>Nenhuma avaliação ainda.</p>
            ) : (
              <>
                {reviews
                  .slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage)
                  .map(review => (
                    <div key={review.review_id} className="review-card">
                      <div className="review-header">
                        <div className="review-user-info">
                          <strong 
                            onClick={() => navigate(`/profile/${review.username}`)}
                            className="review-username"
                            style={{ cursor: 'pointer', color: '#007bff' }}
                          >
                            👤 {review.username || 'Usuário'}
                          </strong>
                          <span className="review-stars">
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
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                }
                
                {/* Paginação */}
                {reviews.length > reviewsPerPage && (
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                    <span>Página {currentPage} de {Math.ceil(reviews.length / reviewsPerPage)}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reviews.length / reviewsPerPage)))}
                      disabled={currentPage === Math.ceil(reviews.length / reviewsPerPage)}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <RentModal
        isOpen={showRentModal}
        onClose={() => setShowRentModal(false)}
        book={book}
        onConfirm={handleConfirmRent}
        loading={rentLoading}
      />

      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditBook}
        title="Editar Livro"
        type="book"
        initialData={book}
        authors={authors}
        loading={editLoading}
      />
    </Layout>
  )
}

export default BookDetail
