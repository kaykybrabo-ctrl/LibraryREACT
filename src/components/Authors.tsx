import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'

interface Author {
  author_id: number
  name_author: string
  photo?: string
}

const Authors: React.FC = () => {
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
      setError('Failed to fetch authors')
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
      setError('Failed to create author')
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
      setError('Failed to update author')
    }
  }

  const handleCancelEdit = () => {
    setEditingAuthor(null)
    setEditData({ name: '' })
  }

  const handleDeleteAuthor = async (authorId: number) => {
    if (!confirm('Are you sure you want to delete this author?')) return

    try {
      await axios.delete(`/api/authors/${authorId}`)
      fetchAuthors()
    } catch (err) {
      setError('Failed to delete author')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Layout title="Authors">
        <div className="loading">Loading authors...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Authors">
      {error && <div className="error-message">{error}</div>}
      
      <section className="form-section">
        <h2>Add Author</h2>
        <form onSubmit={handleCreateAuthor}>
          <label htmlFor="author-name">Name:</label>
          <input
            type="text"
            id="author-name"
            value={newAuthor.name}
            onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
            required
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="author-list">
        <h2>Authors</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map(author => (
              <tr key={author.author_id}>
                <td>{author.author_id}</td>
                <td>
                  {editingAuthor === author.author_id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    author.name_author
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingAuthor === author.author_id ? (
                      <>
                        <button onClick={handleSaveEdit}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => navigate(`/authors/${author.author_id}`)}>View</button>
                        <button onClick={() => handleEditAuthor(author)}>Edit</button>
                        <button onClick={() => handleDeleteAuthor(author.author_id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
