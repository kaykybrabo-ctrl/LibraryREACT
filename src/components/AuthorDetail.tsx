import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Author, Book } from '../types'
import './AuthorDetail.css'

const AuthorDetail: React.FC = () => {
  const { isAdmin } = useAuth()
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBiography, setEditingBiography] = useState(false)
  const [biographyText, setBiographyText] = useState('')
  const [updating, setUpdating] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageKey, setImageKey] = useState(0)

  useEffect(() => {
    if (id) {
      fetchAuthor()
      fetchAuthorBooks()
    }
  }, [id])

  const fetchAuthor = async () => {
    try {
      const response = await axios.get(`/api/authors/${id}`)
      setAuthor(response.data)
      setBiographyText(response.data.biography || '')
    } catch (err) {
      console.error('Failed to fetch author')
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

  const handleUpdateBiography = async () => {
    if (!id) return
    
    setUpdating(true)
    try {
      await axios.put(`/api/authors/${id}`, {
        biography: biographyText
      })
      
      setAuthor(prev => prev ? { ...prev, biography: biographyText } : null)
      setEditingBiography(false)
      alert('Biografia atualizada com sucesso!')
    } catch (err) {
      alert('Erro ao atualizar biografia')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setBiographyText(author?.biography || '')
    setEditingBiography(false)
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
    } finally {
      setUploading(false)
    }
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

        <img
          key={imageKey}
          src={getImageUrl(author.photo, 'author', imageKey > 0)}
          alt={author.name_author}
          className="author-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImageUrl('author')
          }}
        />

        {isAdmin && (
          <div className="image-upload" style={{ marginTop: '20px' }}>
            <h3>Atualizar Imagem do Autor</h3>
            <form onSubmit={handleImageUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={{ marginBottom: '10px' }}
              />
              <button 
                type="submit" 
                disabled={!imageFile || uploading}
                className="btn-primary"
                style={{ display: 'block' }}
              >
                {uploading ? 'Enviando...' : 'Enviar Imagem'}
              </button>
            </form>
          </div>
        )}

        <div className="biography-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Biografia</h3>
            {isAdmin && !editingBiography && (
              <button 
                onClick={() => setEditingBiography(true)}
                className="btn-secondary"
                style={{ fontSize: '14px', padding: '5px 10px' }}
              >
                ✏️ Editar
              </button>
            )}
          </div>
          
          {editingBiography ? (
            <div>
              <textarea
                value={biographyText}
                onChange={(e) => setBiographyText(e.target.value)}
                placeholder="Digite a biografia do autor..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleUpdateBiography} 
                  disabled={updating}
                  className="btn-primary"
                >
                  {updating ? 'Salvando...' : 'Salvar'}
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                  disabled={updating}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p style={{ lineHeight: '1.6', color: '#555' }}>
              {author.biography || 'Nenhuma biografia disponível ainda.'}
            </p>
          )}
        </div>
      </section>

      <section className="book-list">
        <h3>Livros de {author.name_author}</h3>
        {books.length === 0 ? (
          <p>Nenhum livro encontrado para este autor.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>
                    <button onClick={() => navigate(`/books/${book.book_id}`)}>
                      Ver Livro
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  )
}

export default AuthorDetail
