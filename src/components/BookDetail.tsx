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
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(5)
  const [showRentModal, setShowRentModal] = useState(false)
  const [rentLoading, setRentLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [isRented, setIsRented] = useState(false)
  const [returnDate, setReturnDate] = useState<string | null>(null)
  const [currentLoanId, setCurrentLoanId] = useState<number | null>(null)
  const { isAdmin, user } = useAuth()
  const { showLoginModal } = useAuthModal()

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/books')
      return
    }
    fetchBook()
    fetchReviews()
    checkAuthStatus()
    if (isAdmin) {
      fetchAuthors()
    }
  }, [id, isAdmin, navigate])

  useEffect(() => {
    if (user && id) {
      checkRentalStatus()
    }
  }, [user, id])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentUser(response.data)
    } catch (err) {
      setCurrentUser(null)
    }
  }

  const checkRentalStatus = async () => {
    if (!user || !id) return
    
    try {
      const response = await api.get('/my-loans')
      const rentedBook = response.data.find((loan: any) => 
        loan.book_id === parseInt(id!) && loan.status === 'active'
      )
      
      if (rentedBook) {
        setIsRented(true)
        setReturnDate(rentedBook.return_date || rentedBook.due_date)
        setCurrentLoanId(rentedBook.loans_id)
      } else {
        setIsRented(false)
        setReturnDate(null)
        setCurrentLoanId(null)
      }
    } catch (err) {
      setIsRented(false)
      setReturnDate(null)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors?limit=1000')
      setAuthors(response.data)
    } catch (err) {
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


  const handleRentBook = () => {
    if (!user) {
      showLoginModal('É necessário fazer login para alugar livros')
      return
    }
    if (isAdmin) {
      alert('Administradores não podem alugar livros')
      return
    }
    if (isRented) {
      handleReturnBook()
    } else {
      setShowRentModal(true)
    }
  }

  const handleReturnBook = async () => {
    if (!user) {
      showLoginModal('É necessário fazer login para devolver livros')
      return
    }
    if (!currentLoanId) {
      alert('Erro: ID do empréstimo não encontrado')
      return
    }
    try {
      await api.post(`/return/${currentLoanId}`)
      alert('Livro devolvido com sucesso!')
      await checkRentalStatus()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao devolver livro'
      alert(`Erro: ${errorMsg}`)
    }
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
      await checkRentalStatus()
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
    
    if (isAdmin) {
      alert('Administradores não podem favoritar livros')
      return
    }
    
    try {
      await api.post(`/favorite/${id}`)
      alert('Livro adicionado aos favoritos!')
      setError('')
    } catch (err: any) {
      if (err.name === 'AuthModalError' || err.name === 'SilentAuthError') {
        return
      }
      const errorMsg = err.response?.data?.error || 'Falha ao adicionar livro aos favoritos'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
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
      
      <section className="unified-book-container">
        <button onClick={() => navigate('/books')} className="back-button" style={{ marginBottom: '20px' }}>
          ← Voltar aos Livros
        </button>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '15px', color: '#495057' }}>{book.title}</h2>
          <p style={{ marginBottom: '10px' }}><strong>Autor:</strong> 
            <span 
              className="author-link" 
              onClick={() => navigate(`/authors/${book.author_id}`)}
              style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline', marginLeft: '8px' }}
            >
              {book.author_name || 'Desconhecido'}
            </span>
          </p>
          <p style={{ marginBottom: '20px' }}><strong>Descrição:</strong> {book.description || 'Nenhuma descrição disponível'}</p>
          
          <div className="book-image-container" style={{ marginBottom: '20px' }}>
            <img 
              src={getImageUrl(book.photo, 'book')} 
              alt={book.title}
              className="book-image-enhanced"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
              }}
            />
          </div>

        </div>
        {isRented && returnDate && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            <strong>📅 Você alugou este livro</strong>
            <br />
            <span>Data de devolução: {new Date(returnDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {!isAdmin && (
          <div className="book-actions" style={{ marginBottom: '30px' }}>
            <button 
              onClick={handleRentBook}
              className={isRented ? 'btn-warning' : 'btn-success'}
              style={{ marginRight: '10px' }}
            >
              {isRented ? '↩️ Devolver Livro' : '📚 Alugar Livro'}
            </button>
            <button onClick={handleFavoriteBook}>⭐ Adicionar aos Favoritos</button>
          </div>
        )}

        {user && !isAdmin ? (
          <div className="review-form-section" style={{ 
            marginBottom: '30px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#495057' }}>Deixe sua avaliação</h4>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Avaliação:</label>
                <div className="star-rating star-rating-container" style={{ marginBottom: '5px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ 
                        cursor: 'pointer',
                        fontSize: '24px',
                        color: star <= newReview.rating ? '#ffc107' : '#ddd',
                        marginRight: '5px'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <small style={{ color: '#6c757d' }}>
                  {newReview.rating === 0 ? 'Selecione pelo menos 1 estrela' : `${newReview.rating} de 5 estrelas`}
                </small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="comment" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comentário:</label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  placeholder="Escreva sua opinião sobre o livro..."
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ced4da', 
                    borderRadius: '4px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={newReview.rating === 0}
                style={{
                  backgroundColor: newReview.rating === 0 ? '#6c757d' : '#007bff',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: newReview.rating === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Enviar Avaliação
              </button>
            </form>
          </div>
        ) : !user ? (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            marginBottom: '30px',
            textAlign: 'center',
            border: '1px solid #dee2e6'
          }}>
            <p style={{ margin: 0, color: '#6c757d', fontWeight: 'bold' }}>
              É preciso fazer o login para deixar uma avaliação!
            </p>
          </div>
        ) : null}

        <div className="reviews-section">
          <h3 style={{ marginBottom: '20px', color: '#495057' }}>Avaliações dos Usuários</h3>
          
          {reviews.length === 0 ? (
            <p style={{ 
              textAlign: 'center', 
              color: '#6c757d', 
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              Nenhuma avaliação ainda. Seja o primeiro a avaliar este livro!
            </p>
          ) : (
            <>
              <div className="reviews-list">
                {reviews
                  .slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage)
                  .map(review => (
                    <div key={review.review_id} style={{
                      padding: '20px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <strong 
                            onClick={() => navigate(`/profile/${review.username}`)}
                            style={{ 
                              cursor: 'pointer', 
                              color: '#007bff',
                              textDecoration: 'none',
                              marginRight: '15px'
                            }}
                          >
                            👤 {review.username || 'Usuário'}
                          </strong>
                          <span style={{ color: '#ffc107', fontSize: '18px' }}>
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                        <small style={{ color: '#6c757d' }}>
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
                      {review.comment && (
                        <p style={{ 
                          margin: 0, 
                          color: '#495057',
                          lineHeight: '1.5',
                          fontStyle: review.comment ? 'normal' : 'italic'
                        }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                }
              </div>
              
              {reviews.length > reviewsPerPage && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '30px',
                  padding: '20px'
                }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#6c757d' : '#007bff'
                    }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ color: '#6c757d', fontWeight: 'bold' }}>
                    Página {currentPage} de {Math.ceil(reviews.length / reviewsPerPage)}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reviews.length / reviewsPerPage)))}
                    disabled={currentPage === Math.ceil(reviews.length / reviewsPerPage)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      backgroundColor: currentPage === Math.ceil(reviews.length / reviewsPerPage) ? '#f8f9fa' : '#fff',
                      cursor: currentPage === Math.ceil(reviews.length / reviewsPerPage) ? 'not-allowed' : 'pointer',
                      color: currentPage === Math.ceil(reviews.length / reviewsPerPage) ? '#6c757d' : '#007bff'
                    }}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {isAdmin && (
        <div className="book-admin-actions" style={{ textAlign: 'center', margin: '30px 0' }}>
          <button 
            className="btn-primary-large"
            onClick={() => setShowEditModal(true)}
          >
            EDITAR LIVRO
          </button>
        </div>
      )}

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
