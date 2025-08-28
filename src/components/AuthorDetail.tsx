import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'

interface Author {
  author_id: number
  name_author: string
  photo?: string
  biography?: string
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [biography, setBiography] = useState('')
  const { isAdmin } = useAuth()

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
      setBiography(response.data.biography || '')
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
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('author_image', imageFile)

    try {
      const response = await axios.post(`/api/authors/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null)
      setImageFile(null)
      setError('')
      alert('Author image updated successfully!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload author image')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateBiography = async () => {
    setUploading(true)
    try {
      await axios.put(`/api/authors/${id}`, {
        name_author: author?.name_author,
        biography: biography
      })
      setAuthor(prev => prev ? { ...prev, biography: biography } : null)
      setEditingBio(false)
      setError('')
      alert('Biography updated successfully!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update biography')
    } finally {
      setUploading(false)
    }
  }

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
        
        <div className="author-info">
          {author.photo && (
            <img 
              src={`/api/uploads/${author.photo}`} 
              alt={author.name_author}
              className="author-image"
              style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '20px' }}
            />
          )}

          <div className="biography-section">
            <h3>Biography</h3>
            {editingBio ? (
              <div>
                <textarea
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Enter author biography..."
                  rows={6}
                  style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <div>
                  <button onClick={handleUpdateBiography} disabled={uploading}>
                    {uploading ? 'Saving...' : 'Save Biography'}
                  </button>
                  <button 
                    onClick={() => {
                      setEditingBio(false)
                      setBiography(author?.biography || '')
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  {author.biography || 'No biography available yet.'}
                </p>
                {isAdmin && (
                  <button onClick={() => setEditingBio(true)}>
                    Edit Biography
                  </button>
                )}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="image-upload" style={{ marginTop: '20px' }}>
              <h3>Update Author Photo</h3>
              <form onSubmit={handleImageUpload}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && file.type.startsWith('image/')) {
                      setImageFile(file)
                      setError('')
                    } else {
                      setError('Please select a valid image file (JPG, PNG, GIF, WebP)')
                      e.target.value = ''
                    }
                  }}
                  style={{ marginBottom: '10px' }}
                />
                <button type="submit" disabled={!imageFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </form>
            </div>
          )}
        </div>

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
