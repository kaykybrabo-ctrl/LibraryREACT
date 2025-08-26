import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'

interface Author {
  author_id: number
  name_author: string
  photo?: string
}

interface Book {
  book_id: number
  title: string
  description?: string
  author_id: number
}

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Removed unused imageFile state

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
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch author details')
      setLoading(false)
    }
  }

  const fetchAuthorBooks = async () => {
    try {
      const response = await axios.get('/api/books?limit=9999&offset=0')
      const authorBooks = response.data.filter((book: Book) => 
        book.author_id === Number(id)
      )
      setBooks(authorBooks)
    } catch (err) {
      console.error('Failed to fetch author books')
    }
  }

  // Image upload functionality removed for now

  if (loading) {
    return (
      <Layout title="Author Details">
        <div className="loading">Loading author details...</div>
      </Layout>
    )
  }

  if (!author) {
    return (
      <Layout title="Author Details">
        <div className="error-message">Author not found</div>
        <button onClick={() => navigate('/authors')}>Back to Authors</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Author: ${author.name_author}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/authors')} style={{ marginBottom: '20px' }}>
          ← Back to Authors
        </button>
        
        <h2>{author.name_author}</h2>
        
        {author.photo && (
          <img 
            src={`/api/uploads/${author.photo}`} 
            alt={author.name_author}
            className="author-image"
            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
          />
        )}

      </section>

      <section className="book-list">
        <h3>Books by {author.name_author}</h3>
        {books.length === 0 ? (
          <p>No books found for this author.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>
                    <button onClick={() => navigate(`/books/${book.book_id}`)}>
                      View Book
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
