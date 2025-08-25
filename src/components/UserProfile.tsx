import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'

interface UserProfile {
  id: number
  username: string
  role: string
  profile_image?: string
}

interface Loan {
  loans_id: number
  loan_date: string
  book_id: number
  title: string
  photo?: string
  description?: string
}

interface FavoriteBook {
  book_id: number
  title: string
  description?: string
  photo?: string
  author_name?: string
}

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [favoriteBook, setFavoriteBook] = useState<FavoriteBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'loans' | 'favorite'>('profile')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchLoans()
    fetchFavoriteBook()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/get-profile')
      setProfile(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch profile')
      setLoading(false)
    }
  }

  const fetchLoans = async () => {
    if (!user?.username) return
    
    try {
      const response = await axios.get(`/api/loans?username=${user.username}`)
      setLoans(response.data)
    } catch (err) {
      console.error('Failed to fetch loans')
    }
  }

  const fetchFavoriteBook = async () => {
    if (!user?.username) return
    
    try {
      const response = await axios.get(`/api/users/favorite?username=${user.username}`)
      setFavoriteBook(response.data)
    } catch (err) {
      console.error('Failed to fetch favorite book')
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('profile_image', imageFile)

    try {
      await axios.post('/api/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchProfile()
      setImageFile(null)
    } catch (err) {
      setError('Failed to upload profile image')
    } finally {
      setUploading(false)
    }
  }

  const handleReturnBook = async (loanId: number) => {
    if (!confirm('Are you sure you want to return this book?')) return

    try {
      await axios.post(`/api/return/${loanId}`)
      fetchLoans()
      alert('Book returned successfully!')
    } catch (err) {
      setError('Failed to return book')
    }
  }

  if (loading) {
    return (
      <Layout title="User Profile">
        <div className="loading">Loading profile...</div>
      </Layout>
    )
  }

  return (
    <Layout title="User Profile">
      {error && <div className="error-message">{error}</div>}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          My Loans
        </button>
        <button 
          className={`tab ${activeTab === 'favorite' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorite')}
        >
          Favorite Book
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <section className="profile-section">
            <h2>Profile Information</h2>
            <p><strong>Username:</strong> {user?.username || 'Unknown'}</p>
            <p><strong>Role:</strong> {user?.role || 'User'}</p>
            
            {profile?.profile_image && (
              <img 
                src={`/api/uploads/${profile.profile_image}`} 
                alt="Profile"
                className="profile-image"
              />
            )}

            <div className="image-upload">
              <h3>Update Profile Image</h3>
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
        )}

        {activeTab === 'loans' && (
          <section className="profile-section">
            <h2>My Borrowed Books</h2>
            {loans.length === 0 ? (
              <p>You haven't borrowed any books yet.</p>
            ) : (
              <div>
                {loans.map(loan => (
                  <div key={loan.loans_id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '15px', 
                    marginBottom: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4>{loan.title}</h4>
                      <p><strong>Loan Date:</strong> {new Date(loan.loan_date).toLocaleDateString()}</p>
                      {loan.description && <p>{loan.description}</p>}
                    </div>
                    <div>
                      {loan.photo && (
                        <img 
                          src={`/api/uploads/${loan.photo}`} 
                          alt={loan.title}
                          className="book-image"
                          style={{ marginRight: '15px' }}
                        />
                      )}
                      <button onClick={() => handleReturnBook(loan.loans_id)}>
                        Return Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'favorite' && (
          <section className="profile-section">
            <h2>My Favorite Book</h2>
            {!favoriteBook ? (
              <p>You haven't set a favorite book yet.</p>
            ) : (
              <div style={{ 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                {favoriteBook.photo && (
                  <img 
                    src={`/api/uploads/${favoriteBook.photo}`} 
                    alt={favoriteBook.title}
                    style={{ width: '120px', height: '160px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h3>{favoriteBook.title}</h3>
                  <p><strong>Author:</strong> {favoriteBook.author_name || 'Unknown'}</p>
                  {favoriteBook.description && (
                    <p><strong>Description:</strong> {favoriteBook.description}</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  )
}

export default UserProfile
