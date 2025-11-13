import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Author, Book } from '../types'
import EditModal from './EditModal'
import './AuthorDetail.css'

const AuthorDetail: React.FC = () => {
  const { isAdmin } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [showBookEditModal, setShowBookEditModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [bookEditLoading, setBookEditLoading] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    if (!id) {
      const timeout = setTimeout(() => {
        navigate('/authors')
      }, 2000)
      return () => clearTimeout(timeout)
    }
    
    if (id === 'undefined' || isNaN(Number(id))) {
      navigate('/authors')
      return
    }
    
    fetchAuthor()
    fetchAuthorBooks()
    fetchAuthors()
  }, [id, navigate])

  const fetchAuthor = async () => {
    if (!id) return
    
    try {
      const response = await axios.get(`/api/authors/${id}`)
      
      setAuthor(response.data)
    } catch (err: any) {
      if (err.response?.status !== 400) {
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthorBooks = async () => {
    try {
      const response = await axios.get(`/api/authors/${id}/books`)
      setBooks(response.data)
    } catch (err) {
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors')
      setAuthors(response.data)
    } catch (err) {
    }
  }



  const handleEditAuthor = async (data: any) => {
    setEditLoading(true)
    try {
      await axios.put(`/api/authors/${id}`, {
        name_author: data.name_author,
        description: data.description
      })

      if (data.imageFile) {
        const formData = new FormData()
        formData.append('author_image', data.imageFile)
        
        await axios.post(`/api/authors/${id}/update`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      await fetchAuthor()
      await fetchAuthorBooks()
      alert('Autor atualizado com sucesso!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao atualizar autor'
      alert(`Erro: ${errorMsg}`)
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditBook = async (data: any) => {
    if (!selectedBook) return
    
    setBookEditLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      if (data.description) {
        formData.append('description', data.description)
      }
      if (data.imageFile) {
        formData.append('photo', data.imageFile)
      }
      if (data.useNewAuthor && data.new_author_name) {
        formData.append('new_author_name', data.new_author_name)
      } else if (data.author_id) {
        formData.append('author_id', data.author_id)
      }

      await axios.put(`/api/books/${selectedBook.book_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      await fetchAuthorBooks()
      alert('Livro atualizado com sucesso!')
    } catch (err) {
      alert('Erro ao atualizar livro')
    } finally {
      setBookEditLoading(false)
    }
  }

  const openBookEditModal = (book: Book) => {
    setSelectedBook(book)
    setShowBookEditModal(true)
  }

  if (loading) {
    return (
      <Layout title="Detalhes do Autor">
        <div className="loading">Carregando detalhes do autor...</div>
      </Layout>
    )
  }

  if (!author) {
    return (
      <Layout title="Detalhes do Autor">
        <div className="error-message">Autor não encontrado</div>
        <button onClick={() => navigate('/authors')}>Voltar aos Autores</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Autor: ${author.name_author}`}>
      <section className="profile-section">
        <button onClick={() => navigate('/authors')} className="back-button">
          ← Voltar aos Autores
        </button>

        <h2>{author.name_author}</h2>

        <div className="author-image-container">
          <img
            src={getImageUrl(author.photo, 'author')}
            alt={author.name_author}
            className="author-image-enhanced"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackImageUrl('author')
            }}
          />
        </div>

        <div className="author-biography-section">
          <h3>Biografia</h3>
          <div className="biography-text">
            <p>
              {author?.description || "Nenhuma biografia disponível ainda."}
            </p>
          </div>
        </div>

      </section>

      <section className="unified-author-container">
        <div className="author-books-section">
          <h3>Livros de {author.name_author}</h3>
          {books.length === 0 ? (
            <p>Nenhum livro encontrado para este autor.</p>
          ) : (
            <div className="author-books-grid">
              {books.map(book => (
                <div key={book.book_id} className="author-book-card">
                  <img
                    src={getImageUrl(book.photo, 'book')}
                    alt={book.title}
                    className="author-book-image"
                    onClick={() => navigate(`/book/${book.book_id}`)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                    }}
                  />
                  <div className="author-book-info">
                    <h4 
                      className="author-book-title"
                      onClick={() => navigate(`/book/${book.book_id}`)}
                    >
                      {book.title}
                    </h4>
                    {book.description && (
                      <p className="author-book-description">
                        {book.description.length > 100 
                          ? `${book.description.substring(0, 100)}...` 
                          : book.description
                        }
                      </p>
                    )}
                    <div className="author-book-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => navigate(`/book/${book.book_id}`)}
                      >
                        👁️ Ver Detalhes
                      </button>
                      {isAdmin && (
                        <button 
                          className="btn-secondary"
                          onClick={() => openBookEditModal(book)}
                        >
                          ✏️ Editar Livro
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {isAdmin && (
        <div className="author-actions" style={{ textAlign: 'center', margin: '20px 0' }}>
          <button 
            className="btn-primary"
            onClick={() => setShowEditModal(true)}
          >
            EDITAR AUTOR
          </button>
        </div>
      )}

      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditAuthor}
        title="Editar Autor"
        type="author"
        initialData={author}
        loading={editLoading}
      />

      <EditModal
        isOpen={showBookEditModal}
        onClose={() => setShowBookEditModal(false)}
        onSave={handleEditBook}
        title="Editar Livro"
        type="book"
        initialData={selectedBook}
        authors={authors}
        loading={bookEditLoading}
      />
    </Layout>
  )
}

export default AuthorDetail
