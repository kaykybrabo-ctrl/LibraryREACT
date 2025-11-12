import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import { User, Loan } from '../types'
import EditModal from './EditModal'
import './UserProfile.css'

interface FavoriteBook {
  book_id: number
  title: string
  description?: string
  photo?: string
  author_name?: string
}

const UserProfile: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const { updateProfileImage, refreshProfile } = useProfile()
  const { username: urlUsername } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<User | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [favoriteBook, setFavoriteBook] = useState<FavoriteBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'loans'>('profile')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [imageKey, setImageKey] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const targetUsername = urlUsername || user?.username
  const isOwnProfile = !urlUsername || urlUsername === user?.username
  const canEdit = isOwnProfile
  const showBackButton = !!urlUsername

  useEffect(() => {
    if (targetUsername) {
      fetchProfile()
      fetchLoans()
    }
  }, [targetUsername])

  useEffect(() => {
    if (profile && (!profile.role || profile.role !== 'admin')) {
      fetchFavoriteBook()
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/get-profile?username=${targetUsername}&t=${Date.now()}`)
      setProfile(response.data)
      setDescription(response.data.description || '')
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar perfil')
      setLoading(false)
    }
  }

  const fetchLoans = async () => {
    if (!targetUsername) return
    
    const canFetchLoans = (isOwnProfile && user?.role !== 'admin') || (isAdmin && profile?.role !== 'admin')
    if (!canFetchLoans) return

    try {
      const response = await axios.get(`/api/loans?username=${targetUsername}`, {
        withCredentials: true
      })
      setLoans(response.data)
    } catch (err) {
    }
  }

  const fetchFavoriteBook = async () => {
    if (!targetUsername) return

    try {
      const response = await axios.get(`/api/users/favorite?username=${targetUsername}`)
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
      setProfile(prev => ({
        ...prev,
        ...response.data
      }))
      setImageKey(prev => prev + 1)
      setImageFile(null)
      setError('')
      
      if (isOwnProfile && response.data.profile_image) {
        updateProfileImage(response.data.profile_image)
        await refreshProfile()
      }
      
      alert('Imagem do perfil atualizada com sucesso!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao enviar imagem do perfil')
    } finally {
      setUploading(false)
    }
  }

  const handleEditProfile = async (data: any) => {
    setEditLoading(true)
    try {
      const formData = new FormData()
      formData.append('description', data.description || '')
      
      if (data.imageFile) {
        formData.append('profile_image', data.imageFile)
      }
      
      if (user?.username) {
        formData.append('username', user.username)
      }

      const response = await axios.post('/api/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setProfile(prev => ({
        ...prev,
        ...response.data
      }))
      
      setImageKey(prev => prev + 1)
      
      if (response.data.profile_image) {
        updateProfileImage(response.data.profile_image)
        await refreshProfile()
      }
      
      alert('Perfil atualizado com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao atualizar perfil'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    } finally {
      setEditLoading(false)
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
      setProfile(prev => ({
        ...prev,
        ...response.data,
        profile_image: response.data.profile_image || prev?.profile_image
      }))
      setEditingDescription(false)
      setError('')
      alert('Descrição atualizada com sucesso!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao atualizar descrição')
    } finally {
      setUploading(false)
    }
  }

  const handleReturnBook = async (loanId: number) => {
    try {
      await axios.post(`/api/return/${loanId}`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      await fetchLoans()
      
      alert('Livro devolvido com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao devolver livro'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  if (loading) {
    return (
      <Layout title={isOwnProfile ? "Meu Perfil" : `Perfil de ${targetUsername}`}>
        <div className="loading">Carregando perfil...</div>
      </Layout>
    )
  }

  return (
    <Layout title={isOwnProfile ? "Meu Perfil" : `Perfil de ${targetUsername}`}>
      {error && <div className="error-message">{error}</div>}

      {showBackButton && (
        <div className="back-button-container">
          <button 
            onClick={() => navigate('/users')}
            className="back-to-users-button"
          >
            ← Voltar aos Usuários
          </button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        {(isOwnProfile && user?.role !== 'admin') && (
          <button
            className={`tab ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            Meus Aluguéis
          </button>
        )}
        {(!isOwnProfile && isAdmin && profile?.role !== 'admin') && (
          <button
            className={`tab ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            Aluguéis
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <section className="profile-section">
            <h2>Informações do Perfil</h2>
            <p><strong>Usuário:</strong> {profile?.username || targetUsername || 'Desconhecido'}</p>
            <p><strong>Função:</strong> {profile?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>

            <img
              key={imageKey}
              src={getImageUrl(profile?.profile_image, 'profile', imageKey > 0)}
              alt="Perfil"
              className="profile-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackImageUrl('profile')
              }}
            />

            <div className="description-section">
              <h3>Descrição</h3>
              <div>
                <p>{profile?.description || 'Nenhuma descrição adicionada ainda.'}</p>
              </div>
            </div>

            {/* Seção do Livro Favorito - Apenas para usuários comuns */}
            {!profile?.role || profile.role !== 'admin' ? (
              <div className="favorite-book-section">
                <h3>Livro Favorito</h3>
                {!favoriteBook ? (
                  <p>{isOwnProfile ? 'Você ainda não definiu um livro favorito.' : `${profile?.username || targetUsername} ainda não definiu um livro favorito.`}</p>
                ) : (
                  <div className="favorite-book-card">
                    <img
                      src={getImageUrl(favoriteBook.photo, 'book')}
                      alt={favoriteBook.title}
                      className="favorite-book-image"
                      onClick={() => navigate(`/book/${favoriteBook.book_id}`)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                      }}
                    />
                    <div className="favorite-book-info">
                      <h4 
                        className="favorite-book-title"
                        onClick={() => navigate(`/book/${favoriteBook.book_id}`)}
                      >
                        {favoriteBook.title}
                      </h4>
                      <p><strong>Autor:</strong> {favoriteBook.author_name || 'Desconhecido'}</p>
                      {favoriteBook.description && (
                        <p className="favorite-book-description">{favoriteBook.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {canEdit && (
              <div className="profile-actions">
                <button 
                  className="btn-primary"
                  onClick={() => setShowEditModal(true)}
                >
                  EDITAR PERFIL
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'loans' && (
          (isOwnProfile && user?.role !== 'admin') || 
          (!isOwnProfile && isAdmin && profile?.role !== 'admin')
        ) && (
          <section className="profile-section">
            <h2>{isOwnProfile ? 'Meus Livros Emprestados' : `Livros Emprestados por ${targetUsername}`}</h2>
            {loans.length === 0 ? (
              <p>{isOwnProfile ? 'Você ainda não pegou nenhum livro emprestado.' : 'Este usuário não tem livros emprestados.'}</p>
            ) : (
              <div>
                {loans.map(loan => (
                  <div key={loan.loans_id} className="loan-card">
                    <div>
                      <h4>{loan.title}</h4>
                      <p><strong>Data do Empréstimo:</strong> {new Date(loan.loan_date).toLocaleDateString('pt-BR')}</p>
                      {loan.return_date && (
                        <p><strong>📅 Devolução:</strong> {new Date(loan.return_date).toLocaleDateString('pt-BR')}</p>
                      )}
                      {loan.description && <p>{loan.description}</p>}
                    </div>
                    <div>
                      <img
                        src={getImageUrl(loan.photo, 'book')}
                        alt={loan.title}
                        className="loan-book-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                        }}
                      />
                      {isOwnProfile && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            handleReturnBook(loan.loans_id)
                          }}
                          className="return-button"
                        >
                          Devolver Livro
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditProfile}
        title="Editar Perfil"
        type="profile"
        initialData={{
          username: profile?.username,
          description: profile?.description,
          profile_image: profile?.profile_image
        }}
        loading={editLoading}
      />
    </Layout>
  )
}

export default UserProfile
