import React, { useState } from 'react'
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils'
import './RentModal.css'

interface Book {
  book_id: number
  title: string
  description?: string
  photo?: string
  author_name?: string
}

interface RentModalProps {
  isOpen: boolean
  onClose: () => void
  book?: Book | null
  onConfirm: (returnDate: string) => void
  loading?: boolean
}

const RentModal: React.FC<RentModalProps> = ({ 
  isOpen, 
  onClose, 
  book, 
  onConfirm, 
  loading = false 
}) => {
  const [returnDate, setReturnDate] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  
  const maxDate = '2030-01-01'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!returnDate) {
      setError('Por favor, selecione uma data de devolução')
      return
    }

    const selectedDate = new Date(returnDate)
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const maxAllowedDate = new Date('2030-01-01')

    if (selectedDate <= currentDate) {
      setError('A data de devolução deve ser no futuro')
      return
    }

    if (selectedDate >= maxAllowedDate) {
      setError('Data muito distante. Máximo permitido: 01/01/2030')
      return
    }

    setError('')
    const localDateString = returnDate + 'T12:00:00'
    onConfirm(localDateString)
  }

  const handleClose = () => {
    setReturnDate('')
    setError('')
    onClose()
  }

  return (
    <div className="rent-modal-overlay" onClick={handleClose}>
      <div className="rent-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rent-modal-header">
          <h2>Alugar Livro</h2>
          <button className="rent-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="rent-modal-body">
          {book && (
            <div className="rent-book-info">
              <img
                src={getImageUrl(book.photo, 'book')}
                alt={book.title}
                className="rent-book-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                }}
              />
              <div className="rent-book-details">
                <h3>{book.title}</h3>
                <p><strong>Autor:</strong> {book.author_name || 'Desconhecido'}</p>
                {book.description && (
                  <p className="rent-book-description">{book.description}</p>
                )}
              </div>
            </div>
          )}

          <div className="rent-date-section">
            <div className="rent-date-info">
              <p><strong>Data do Empréstimo:</strong> {today.toLocaleDateString('pt-BR')}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="rent-form-group">
                <label htmlFor="returnDate">
                  <strong>Data de Devolução:</strong>
                </label>
                <input
                  type="date"
                  id="returnDate"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement
                    if (target.validity.rangeOverflow) {
                      target.setCustomValidity('Data muito distante. Máximo: 01/01/2030')
                    } else if (target.validity.rangeUnderflow) {
                      target.setCustomValidity('Data deve ser pelo menos amanhã')
                    } else if (target.validity.valueMissing) {
                      target.setCustomValidity('Por favor, selecione uma data')
                    }
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement
                    target.setCustomValidity('')
                  }}
                  min={minDate}
                  max={maxDate}
                  required
                  className="rent-date-input"
                />
                <small className="rent-date-help">
                  Data deve ser entre amanhã e 01/01/2030
                </small>
              </div>

              {error && <div className="rent-error-message">{error}</div>}

              <div className="rent-modal-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rent-btn-cancel"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rent-btn-confirm"
                  disabled={loading}
                >
                  {loading ? 'Alugando...' : 'Confirmar Aluguel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentModal
