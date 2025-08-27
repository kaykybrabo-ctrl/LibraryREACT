import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'

interface UserProfile {
  id: number
  username: string
  role: string
  profile_image?: string
  description?: string
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
  const [description, setDescription] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchLoans()
    fetchFavoriteBook()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/get-profile?username=${user?.username}`)
      setProfile(response.data)
      setDescription(response.data.description || '')
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch profile')
      setLoading(false)
    }
  }

  const fetchLoans = async () => {
    if (!user?.username) return

    try {
      const response = await axios.get(`/api/loans?username=${user.username}`, {
        withCredentials: true
      })
      setLoans(response.data)
    } catch (err) {
    }
  }

  const fetchFavoriteBook = async () => {
    if (!user?.username) return

    try {
      const response = await axios.get(`/api/users/favorite?username=${user.username}`)
      if (response.data) {
        setFavoriteBook(response.data)
      } else {
        setFavoriteBook(null)
      }
    } catch (err) {
      setFavoriteBook(null)
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('profile_image', imageFile)
    if (user?.username) {
      formData.append('username', user.username)
    }

    try {
      const response = await axios.post('/api/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(response.data)
      setImageFile(null)
      setError('')
      alert('Profile image updated successfully!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload profile image')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateDescription = async () => {
    setUploading(true)
    const formData = new FormData()
    formData.append('description', description)
    if (user?.username) {
      formData.append('username', user.username)
    }

    try {
      const response = await axios.post('/api/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(response.data)
      setEditingDescription(false)
      setError('')
      alert('Description updated successfully!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update description')
    } finally {
      setUploading(false)
    }
  }

  const handleReturnBook = async (loanId: number) => {
    try {
      const response = await axios.post(`/api/return/${loanId}`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      await fetchLoans()
      
      alert('Book returned successfully!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to return book'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
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

            <div className="description-section">
              <h3>Description</h3>
              {editingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <div>
                    <button onClick={handleUpdateDescription} disabled={uploading}>
                      {uploading ? 'Saving...' : 'Save Description'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingDescription(false)
                        setDescription(profile?.description || '')
                      }}
                      style={{ marginLeft: '10px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>{profile?.description || 'No description added yet.'}</p>
                  <button onClick={() => setEditingDescription(true)}>
                    Edit Description
                  </button>
                </div>
              )}
            </div>

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
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          handleReturnBook(loan.loans_id)
                        }}
                        style={{ 
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
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
