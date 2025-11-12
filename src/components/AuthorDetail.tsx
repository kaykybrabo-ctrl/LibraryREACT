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
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionText, setDescriptionText] = useState('')
  const [updating, setUpdating] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageKey, setImageKey] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [showBookEditModal, setShowBookEditModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [bookEditLoading, setBookEditLoading] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    if (!id || id === 'undefined') {
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
      
      const biografias = {
        1: "Guilherme Biondo é um escritor que começou a escrever desde jovem, movido pela curiosidade e paixão por contar histórias. Seus livros falam sobre pessoas, sentimentos e tudo que faz parte do cotidiano, mas com uma perspectiva única e sincera.",
        2: "Manoel Leite é um autor e observador atento da vida cotidiana. Suas histórias surgem de experiências simples, mas cheias de significado. Com um estilo de escrita direto e humano, Manoel busca tocar o leitor com temas sobre memória, afeto e identidade."
      }
      
      const authorData = {
        ...response.data,
        description: biografias[response.data.author_id as keyof typeof biografias] || response.data.description || null
      }
      
      setAuthor(authorData)
      setDescriptionText(authorData.description || '')
    } catch (err: any) {
      if (err.response?.status !== 400) {
        console.error('Failed to fetch author:', err)
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
      console.error('Failed to fetch author books')
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors')
      setAuthors(response.data)
    } catch (err) {
      console.error('Failed to fetch authors')
    }
  }

  const handleUpdateBiography = async () => {
    if (!id) return
    
    setUpdating(true)
    try {
      await axios.put(`/api/authors/${id}`, {
        description: descriptionText
      })
      
      setAuthor(prev => prev ? { ...prev, description: descriptionText } : null)
      setEditingDescription(false)
      alert('Biografia atualizada com sucesso!')
    } catch (err) {
      alert('Erro ao atualizar biografia')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setDescriptionText(author?.description || '')
    setEditingDescription(false)
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !id) return

    const formData = new FormData()
    formData.append('author_image', imageFile)

    setUploading(true)
    try {
      const response = await axios.post(`/api/authors/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null)
      setImageKey(prev => prev + 1)
      setImageFile(null)
      alert('Imagem do autor atualizada com sucesso!')
    } catch (err) {
      alert('Erro ao fazer upload da imagem')
      setUploading(false)
    }
  }

  const handleEditAuthor = async (data: any) => {
    setEditLoading(true)
    try {
      const formData = new FormData()
      formData.append('name_author', data.name_author)
      if (data.description) {
        formData.append('description', data.description)
      }
      if (data.imageFile) {
        formData.append('photo', data.imageFile)
      }

      await axios.put(`/api/authors/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      await fetchAuthor()
      await fetchAuthorBooks()
      setImageKey(prev => prev + 1)
      alert('Autor atualizado com sucesso!')
    } catch (err) {
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
            key={imageKey}
            src={getImageUrl(author.photo, 'author', imageKey > 0)}
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
              {author?.author_id === 1 ? 
                "Guilherme Biondo é um escritor que começou a escrever desde jovem, movido pela curiosidade e paixão por contar histórias. Seus livros falam sobre pessoas, sentimentos e tudo que faz parte do cotidiano, mas com uma perspectiva única e sincera." :
                author?.author_id === 2 ?
                "Manoel Leite é um autor e observador atento da vida cotidiana. Suas histórias surgem de experiências simples, mas cheias de significado. Com um estilo de escrita direto e humano, Manoel busca tocar o leitor com temas sobre memória, afeto e identidade." :
                "Nenhuma biografia disponível ainda."
              }
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="image-upload">
            <h3>Atualizar Imagem do Autor</h3>
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
