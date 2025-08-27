import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { Rating, Typography, Box } from '@mui/material'

interface Book {
  book_id: number
  title: string
  description?: string
  author_id: number
  author_name?: string
  photo?: string
}

interface Review {
  review_id: number
  book_id: number
  rating: number
  comment: string
  username: string
  review_date: string
}

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (id) {
      fetchBook()
      fetchReviews()
      checkAuthStatus()
    }
  }, [id])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/user/me')
      setCurrentUser(response.data)
    } catch {
      setCurrentUser(null)
    }
  }

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`)
      setBook(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch book details')
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

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !id) return

    setUploading(true)
    const formData = new FormData()
    formData.append('book_image', imageFile)

    try {
      await axios.post(`/api/books/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchBook()
      setImageFile(null)
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRentBook = async () => {
    try {
      await axios.post(`/api/rent/${id}`)
      alert('Book rented successfully!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to rent book. You may not be logged in or book is already rented.'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleFavoriteBook = async () => {
    try {
      await axios.post(`/api/favorite/${id}`)
      alert('Book added to favorites!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add book to favorites'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setError('Please log in to submit a review')
      return
    }

    try {
      await axios.post('/api/reviews', {
        book_id: Number(id),
        user_id: currentUser.id,
        rating: newReview.rating,
        comment: newReview.comment
      })
      
      setNewReview({ rating: 5, comment: '' })
      fetchReviews()
      alert('Review submitted successfully!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to submit review'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  if (loading) {
    return (
      <Layout title="Book Details">
        <div className="loading">Loading book details...</div>
      </Layout>
    )
  }

  if (!book) {
    return (
      <Layout title="Book Details">
        <div className="error-message">Book not found</div>
        <button onClick={() => navigate('/books')}>Back to Books</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Book: ${book.title}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/books')} style={{ marginBottom: '20px' }}>
          ← Back to Books
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author_name || 'Unknown'}</p>
        <p><strong>Description:</strong> {book.description || 'No description available'}</p>
        
        {book.photo && (
          <img 
            src={`/api/uploads/${book.photo}`} 
            alt={book.title}
            className="book-image"
            style={{ width: '200px', height: '250px', objectFit: 'cover' }}
          />
        )}

        <div className="image-upload">
          <h3>Update Book Image</h3>
          <form onSubmit={handleImageUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            <button type="submit" disabled={!imageFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>
      </section>

      <section className="form-section">
        <h3>Book Actions</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRentBook}>Rent Book</button>
          <button onClick={handleFavoriteBook}>Add to Favorites</button>
        </div>
      </section>

      <section className="form-section">
        <h3>Write a Review</h3>
        {!currentUser ? (
          <p>Please log in to write a review.</p>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend" sx={{ mb: 1 }}>Rating:</Typography>
              <Rating
                name="book-rating"
                value={newReview.rating}
                onChange={(_, newValue) => {
                  setNewReview({ ...newReview, rating: newValue || 1 })
                }}
                max={5}
                size="large"
              />
            </Box>

            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />

            <button type="submit">Submit Review</button>
          </form>
        )}
      </section>

      <section className="form-section">
        <h3>Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div>
            {reviews.map(review => (
              <div key={review.review_id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{review.username}</strong>
                  <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <small style={{ color: '#666' }}>
                  {new Date(review.review_date).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default BookDetail
