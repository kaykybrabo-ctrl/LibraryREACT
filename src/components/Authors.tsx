import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Author } from '../types'
import './Cards.css'

const Authors: React.FC = () => {
  const { isAdmin } = useAuth()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [newAuthor, setNewAuthor] = useState({ name: '' })
  const [editingAuthor, setEditingAuthor] = useState<number | null>(null)
  const [editData, setEditData] = useState({ name: '' })
  const [error, setError] = useState('')
  const limit = 5
  const navigate = useNavigate()

  useEffect(() => {
    fetchAuthors()
  }, [currentPage])

  const fetchAuthors = async () => {
    try {
      const offset = currentPage * limit
      const [authorsRes, countRes] = await Promise.all([
        axios.get(`/api/authors?limit=${limit}&offset=${offset}`),
        axios.get('/api/authors/count')
      ])
      
      setAuthors(authorsRes.data)
      setTotalPages(Math.ceil(countRes.data.total / limit))
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar autores')
      setLoading(false)
    }
  }

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuthor.name.trim()) return

    try {
      await axios.post('/api/authors', {
        name_author: newAuthor.name.trim()
      })
      setNewAuthor({ name: '' })
      fetchAuthors()
    } catch (err) {
      setError('Falha ao criar autor')
    }
  }

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author.author_id)
    setEditData({ name: author.name_author })
  }

  const handleSaveEdit = async () => {
    if (!editData.name.trim() || !editingAuthor) return

    try {
      await axios.put(`/api/authors/${editingAuthor}`, {
        name_author: editData.name.trim()
      })
      setEditingAuthor(null)
      fetchAuthors()
    } catch (err) {
      setError('Falha ao atualizar autor')
    }
  }

  const handleCancelEdit = () => {
    setEditingAuthor(null)
    setEditData({ name: '' })
  }

  const handleDeleteAuthor = async (authorId: number) => {
    if (!confirm('Tem certeza que deseja excluir este autor?')) return

    try {
      await axios.delete(`/api/authors/${authorId}`)
      fetchAuthors()
    } catch (err) {
      setError('Falha ao excluir autor')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Layout title="Autores">
        <div className="loading">Carregando autores...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Autores">
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: '#162c74',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#162c74'}
        >
          ← Voltar para Início
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isAdmin && (
        <section className="form-section">
          <h2>Adicionar Autor</h2>
          <form onSubmit={handleCreateAuthor}>
            <label htmlFor="author-name">Nome:</label>
            <input
              type="text"
              id="author-name"
              value={newAuthor.name}
              onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
              required
            />
            <button type="submit">Adicionar</button>
          </form>
        </section>
      )}

      <section className="author-list">
        <h2>Autores ({authors.length})</h2>
        <div className="cards-grid">
          {authors.map(author => (
            <div key={author.author_id} className={`card author-card ${editingAuthor === author.author_id ? 'editing' : ''}`}>
              <div className="author-avatar">
                <img 
                  src={getImageUrl(author.photo, 'author')} 
                  alt={author.name_author}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/authors/${author.author_id}`)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackImageUrl('author')
                  }}
                />
              </div>

              <div className="card-header">
                <h3 className="card-title">
                  {editingAuthor === author.author_id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      style={{ fontSize: '1.3em', fontWeight: '600', textAlign: 'center' }}
                    />
                  ) : (
                    <span onClick={() => navigate(`/authors/${author.author_id}`)} style={{ cursor: 'pointer' }}>
                      {author.name_author}
                    </span>
                  )}
                </h3>
                <span className="card-id">#{author.author_id}</span>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-field-value">
                    <span onClick={() => navigate(`/authors/${author.author_id}`)} style={{ cursor: 'pointer' }}>
                      Autor
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                {editingAuthor === author.author_id ? (
                  <>
                    <button className="btn-success" onClick={handleSaveEdit}>Salvar</button>
                    <button className="btn-secondary" onClick={handleCancelEdit}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => navigate(`/authors/${author.author_id}`)}>Ver Detalhes</button>
                    {isAdmin && (
                      <>
                        <button className="btn-secondary" onClick={() => handleEditAuthor(author)}>Editar</button>
                        <button className="btn-danger" onClick={() => handleDeleteAuthor(author.author_id)}>Excluir</button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
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
    </Layout>
  )
}

export default Authors
