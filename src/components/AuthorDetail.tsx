import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { Author, Book } from '../types'
import './AuthorDetail.css'

const AuthorDetail: React.FC = () => {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

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
          src={getImageUrl(author.photo, 'author')}
          alt={author.name_author}
          className="author-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImageUrl('author')
          }}
        />

        <div className="biography-section">
          <h3>Biografia</h3>
          <p>{author.biography || 'Nenhuma biografia disponível ainda.'}</p>
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
