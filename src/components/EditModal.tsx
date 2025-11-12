import React, { useState, useEffect } from 'react'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import './EditModal.css'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  title: string
  type: 'book' | 'author' | 'profile'
  initialData: any
  authors?: Array<{ author_id: number; name_author: string }>
  loading?: boolean
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  type,
  initialData,
  authors = [],
  loading = false
}) => {
  const [formData, setFormData] = useState<any>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [useNewAuthor, setUseNewAuthor] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ ...initialData })
      setImagePreview('')
      setImageFile(null)
      setUseNewAuthor(false)
      setErrors({})
    }
  }, [isOpen, initialData])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (type === 'book') {
      if (!formData.title?.trim()) {
        newErrors.title = 'Título é obrigatório'
      }
      if (!useNewAuthor && !formData.author_id) {
        newErrors.author_id = 'Selecione um autor'
      }
      if (useNewAuthor && !formData.new_author_name?.trim()) {
        newErrors.new_author_name = 'Nome do novo autor é obrigatório'
      }
    } else if (type === 'author') {
      if (!formData.name_author?.trim()) {
        newErrors.name_author = 'Nome do autor é obrigatório'
      }
    } else if (type === 'profile') {
      if (!formData.username?.trim()) {
        newErrors.username = 'Nome de usuário é obrigatório'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData = { ...formData }
      if (imageFile) {
        submitData.imageFile = imageFile
      }
      if (type === 'book' && useNewAuthor) {
        submitData.useNewAuthor = true
        submitData.new_author_name = formData.new_author_name
      }
      
      await onSave(submitData)
      handleClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleClose = () => {
    setFormData({})
    setImageFile(null)
    setImagePreview('')
    setUseNewAuthor(false)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const getCurrentImage = () => {
    if (imagePreview) return imagePreview
    
    if (type === 'book') {
      return getImageUrl(formData.photo, 'book')
    } else if (type === 'author') {
      return getImageUrl(formData.photo, 'author')
    } else if (type === 'profile') {
      return getImageUrl(formData.profile_image, 'profile')
    }
    return ''
  }

  const getFallbackImage = () => {
    if (type === 'book') return getFallbackImageUrl('book')
    if (type === 'author') return getFallbackImageUrl('author')
    return getFallbackImageUrl('profile')
  }

  return (
    <div className="edit-modal-overlay" onClick={handleClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>{title}</h2>
          <button className="edit-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="edit-modal-body">
            <div className="edit-image-section">
              <h3>Imagem</h3>
              <div className="edit-image-container">
                <img
                  src={getCurrentImage()}
                  alt="Preview"
                  className="edit-image-preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackImage()
                  }}
                />
                <div className="edit-image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-upload"
                    className="edit-file-input"
                  />
                  <label htmlFor="image-upload" className="edit-file-label">
                    📷 Escolher Nova Imagem
                  </label>
                </div>
              </div>
            </div>

            <div className="edit-fields-section">
              {type === 'book' && (
                <>
                  <div className="edit-field-group">
                    <label htmlFor="title">Título *</label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-text">{errors.title}</span>}
                  </div>

                  <div className="edit-field-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="edit-field-group">
                    <div className="author-selection">
                      <label>
                        <input
                          type="radio"
                          checked={!useNewAuthor}
                          onChange={() => setUseNewAuthor(false)}
                        />
                        Selecionar autor existente
                      </label>
                      <label>
                        <input
                          type="radio"
                          checked={useNewAuthor}
                          onChange={() => setUseNewAuthor(true)}
                        />
                        Criar novo autor
                      </label>
                    </div>

                    {!useNewAuthor ? (
                      <>
                        <select
                          value={formData.author_id || ''}
                          onChange={(e) => handleInputChange('author_id', e.target.value)}
                          className={errors.author_id ? 'error' : ''}
                        >
                          <option value="">Selecione um autor</option>
                          {authors.map(author => (
                            <option key={author.author_id} value={author.author_id}>
                              {author.name_author}
                            </option>
                          ))}
                        </select>
                        {errors.author_id && <span className="error-text">{errors.author_id}</span>}
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Nome do novo autor"
                          value={formData.new_author_name || ''}
                          onChange={(e) => handleInputChange('new_author_name', e.target.value)}
                          className={errors.new_author_name ? 'error' : ''}
                        />
                        {errors.new_author_name && <span className="error-text">{errors.new_author_name}</span>}
                      </>
                    )}
                  </div>
                </>
              )}

              {type === 'author' && (
                <>
                  <div className="edit-field-group">
                    <label htmlFor="name_author">Nome do Autor *</label>
                    <input
                      type="text"
                      id="name_author"
                      value={formData.name_author || ''}
                      onChange={(e) => handleInputChange('name_author', e.target.value)}
                      className={errors.name_author ? 'error' : ''}
                    />
                    {errors.name_author && <span className="error-text">{errors.name_author}</span>}
                  </div>

                  <div className="edit-field-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      placeholder="Biografia do autor..."
                    />
                  </div>
                </>
              )}

              {type === 'profile' && (
                <>
                  <div className="edit-field-group">
                    <label htmlFor="username">Nome de Usuário *</label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={errors.username ? 'error' : ''}
                      disabled
                    />
                    {errors.username && <span className="error-text">{errors.username}</span>}
                  </div>

                  <div className="edit-field-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      placeholder="Conte-nos sobre você..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="edit-modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="edit-btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="edit-btn-save"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
