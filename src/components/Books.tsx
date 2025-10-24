import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../api'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Book, Author } from '../types'
import './Cards.css'

const Books: React.FC = () => {
  const { isAdmin, user, isAuthenticated } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [rentedBooks, setRentedBooks] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [newBook, setNewBook] = useState({ title: '', author_id: '', author_name: '' })
  const [useNewAuthor, setUseNewAuthor] = useState(false)
  const [editingBook, setEditingBook] = useState<number | null>(null)
  const [editData, setEditData] = useState({ title: '', author_id: '' })
  const [error, setError] = useState('')
  const [showLoginMessage, setShowLoginMessage] = useState(false)
  const limit = 6
  const navigate = useNavigate()

  useEffect(() => {
    fetchAuthors()
    fetchBooks()
    if (!isAdmin && user?.username) {
      fetchRentedBooks()
    }
  }, [currentPage, searchQuery, user])

  const fetchBooks = async () => {
    try {
      const offset = currentPage * limit
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const [booksRes, countRes] = await Promise.all([
        axios.get(`/api/books?limit=${limit}&offset=${offset}${searchParam}`),
        axios.get(`/api/books/count${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`)
      ])
      
      setBooks(booksRes.data)
      setTotalPages(Math.ceil(countRes.data.total / limit))
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar livros')
      setLoading(false)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors?limit=9999&offset=0')
      setAuthors(response.data)
    } catch (err) {
      setError('Falha ao carregar autores')
    }
  }

  const fetchRentedBooks = async () => {
    if (!user?.username) return
    
    try {
      const response = await axios.get(`/api/loans?username=${user.username}`, {
        withCredentials: true
      })
      const rentedBookIds = response.data.map((loan: any) => loan.book_id)
      setRentedBooks(rentedBookIds)
    } catch (err) {
    }
  }

  const getAuthorName = (authorId: number) => {
    const author = authors.find(a => a.author_id === authorId)
    return author ? author.name_author : ''
  }

  const getAuthor = (authorId: number) => {
    return authors.find(a => a.author_id === authorId)
  }

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBook.title.trim()) return
    
    if (useNewAuthor && !newBook.author_name.trim()) return
    if (!useNewAuthor && !newBook.author_id) return

    try {
      const payload: any = { title: newBook.title.trim() }
      
      if (useNewAuthor) {
        payload.author_name = newBook.author_name.trim()
      } else {
        payload.author_id = Number(newBook.author_id)
      }

      const response = await axios.post('/api/books', payload)
      
      if (response.data.author_created) {
        alert('Livro criado com sucesso! Novo autor foi criado automaticamente.')
        fetchAuthors()
      } else {
        alert('Livro criado com sucesso!')
      }
      
      setNewBook({ title: '', author_id: '', author_name: '' })
      setUseNewAuthor(false)
      fetchBooks()
    } catch (err) {
      setError('Falha ao criar livro')
    }
  }

  const handleEditBook = (book: Book) => {
    setEditingBook(book.book_id)
    setEditData({ title: book.title, author_id: book.author_id.toString() })
  }

  const handleSaveEdit = async () => {
    if (!editData.title.trim() || !editData.author_id || !editingBook) return

    try {
      await axios.put(`/api/books/${editingBook}`, {
        title: editData.title.trim(),
        author_id: Number(editData.author_id)
      })
      setEditingBook(null)
      fetchBooks()
    } catch (err) {
      setError('Falha ao atualizar livro')
    }
  }

  const handleCancelEdit = () => {
    setEditingBook(null)
    setEditData({ title: '', author_id: '' })
  }

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return

    try {
      await axios.delete(`/api/books/${bookId}`)
      fetchBooks()
    } catch (err) {
      setError('Falha ao excluir livro')
    }
  }

  const handleRentBook = async (bookId: number) => {
    if (!isAuthenticated) {
      setShowLoginMessage(true)
      setTimeout(() => setShowLoginMessage(false), 4000)
      return
    }
    
    try {
      await api.post(`/rent/${bookId}`)
      alert('Livro alugado com sucesso!')
      setError('')
      setRentedBooks(prev => [...prev, bookId])
    } catch (err: any) {
      if (err.name === 'AuthModalError' || err.name === 'SilentAuthError') {
        return;
      }
      const errorMsg = err.response?.data?.error || 'Falha ao alugar livro.'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleReturnBook = async (bookId: number) => {
    if (!user?.username) return
    
    try {
      const loansResponse = await axios.get(`/api/loans?username=${user.username}`, {
        withCredentials: true
      })
      const loan = loansResponse.data.find((l: any) => l.book_id === bookId)
      
      if (loan) {
        await axios.post(`/api/return/${loan.loans_id}`, {}, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        })
        alert('Livro devolvido com sucesso!')
        setError('')
        setRentedBooks(prev => prev.filter(id => id !== bookId))
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao devolver livro.'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
    fetchBooks()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Layout title="Livros">
        <div className="loading">Carregando livros...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Livros">
      <div className="back-button-container">
        <button 
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Voltar para Início
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showLoginMessage && (
        <div className="login-message">
          <p className="login-message-text">
            É necessário fazer login para alugar livros
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="login-message-button"
          >
            Fazer Login
          </button>
          <button 
            onClick={() => setShowLoginMessage(false)}
            className="close-message-button"
          >
            Fechar
          </button>
        </div>
      )}
      
      {isAdmin && (
        <section className="form-section">
          <h2>Adicionar Livro</h2>
          <form onSubmit={handleCreateBook}>
            <div className="radio-container">
              <label>
                <input
                  type="radio"
                  name="author-type"
                  checked={!useNewAuthor}
                  onChange={() => setUseNewAuthor(false)}
                />
                Usar autor existente
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="author-type"
                  checked={useNewAuthor}
                  onChange={() => setUseNewAuthor(true)}
                />
                Criar novo autor
              </label>
            </div>

            {!useNewAuthor ? (
              <>
                <label htmlFor="author-select">Autor:</label>
                <select
                  id="author-select"
                  value={newBook.author_id}
                  onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })}
                  required={!useNewAuthor}
                >
                  <option value="">Selecione um Autor</option>
                  {authors.map(author => (
                    <option key={author.author_id} value={author.author_id}>
                      {author.name_author}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label htmlFor="author-name">Nome do Novo Autor:</label>
                <input
                  type="text"
                  id="author-name"
                  value={newBook.author_name}
                  onChange={(e) => setNewBook({ ...newBook, author_name: e.target.value })}
                  placeholder="Digite o nome do autor"
                  required={useNewAuthor}
                />
              </>
            )}
            
            <label htmlFor="book-title">Título:</label>
            <input
              type="text"
              id="book-title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
            />
            
            <button type="submit">Adicionar</button>
          </form>
        </section>
      )}

      <section className="search-section">
        <h2>Buscar Livros</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título"
          />
          <button type="submit">Buscar</button>
        </form>
      </section>

      {books.length === 0 && searchQuery ? (
        <div className="no-results">Nenhum resultado encontrado para sua busca.</div>
      ) : (
        <section className="book-list">
          <h2>Livros</h2>
          <div className="cards-grid">
            {books.map(book => {
              const isRented = rentedBooks.includes(book.book_id)
              return (
              <div key={book.book_id} className={`card book-card ${editingBook === book.book_id ? 'editing' : ''} ${isRented ? 'rented' : ''}`}>
                <div className="card-image-container">
                  <img 
                    src={getImageUrl(book.photo, 'book')} 
                    alt={book.title}
                    className="card-image"
                    onClick={() => navigate(`/book/${book.book_id}`)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                    }}
                  />
                </div>

                <div className="card-body">
                  <div className="card-header">
                    <h3 className="card-title">
                      {editingBook === book.book_id ? (
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="inline-edit-input"
                        />
                      ) : (
                        <span onClick={() => navigate(`/book/${book.book_id}`)} className="clickable-title">
                          {book.title}
                        </span>
                      )}
                    </h3>
                    <span className="card-id">#{book.book_id}</span>
                  </div>

                  <div className="card-content">
                    <div className="card-field">
                      <label>Autor:</label>
                      <div className="card-field-value">
                        {editingBook === book.book_id ? (
                          <select
                            value={editData.author_id}
                            onChange={(e) => setEditData({ ...editData, author_id: e.target.value })}
                          >
                            {authors.map(author => (
                              <option key={author.author_id} value={author.author_id}>
                                {author.name_author}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div 
                            onClick={() => navigate(`/authors/${book.author_id}`)} 
                            className="author-info"
                          >
                            <img 
                              src={getImageUrl(getAuthor(book.author_id)?.photo, 'author')}
                              alt={getAuthorName(book.author_id)}
                              className="author-avatar-small"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getFallbackImageUrl('author')
                              }}
                            />
                            <span className="author-link">
                              {getAuthorName(book.author_id)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {book.description && (
                      <div className="card-field">
                        <label>Descrição:</label>
                        <div className="card-field-value">
                          {book.description.length > 100 
                            ? `${book.description.substring(0, 100)}...` 
                            : book.description
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    {editingBook === book.book_id ? (
                      <>
                        <button className="btn-success" onClick={handleSaveEdit}>Salvar</button>
                        <button className="btn-secondary" onClick={handleCancelEdit}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-primary" onClick={() => navigate(`/books/${book.book_id}`)}>
                          👁️ Ver
                        </button>
                        {!isAdmin && (
                          isRented ? (
                            <button className="btn-warning" onClick={() => handleReturnBook(book.book_id)}>
                              ↩️ Devolver
                            </button>
                          ) : (
                            <button className="btn-success" onClick={() => handleRentBook(book.book_id)}>
                              📚 Alugar
                            </button>
                          )
                        )}
                        {isAdmin && (
                          <>
                            <button className="btn-secondary" onClick={() => handleEditBook(book)}>
                              ✏️ Editar
                            </button>
                            <button className="btn-danger" onClick={() => handleDeleteBook(book.book_id)}>
                              🗑️ Excluir
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={currentPage === i ? 'active' : ''}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </Layout>
  )
}

export default Books
