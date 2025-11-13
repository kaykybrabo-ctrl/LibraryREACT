import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Loan } from '../types'
import ConfirmModal from './ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'
import './Loans.css'

interface ExtendedLoan extends Loan {
  user_id: number
  username: string
  return_date?: string
  status: 'active' | 'returned' | 'overdue'
}

const Loans: React.FC = () => {
  const { } = useAuth()
  const [loans, setLoans] = useState<ExtendedLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all')
  const { confirmState, showConfirm, hideConfirm, handleCancel } = useConfirm()

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/loans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Falha ao carregar empréstimos')
      }
      
      const data = await response.json()
      setLoans(data)
    } catch (err) {
      setError('Falha ao carregar empréstimos')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (loanId: number) => {
    const loan = loans.find(l => l.loans_id === loanId)
    const bookTitle = loan?.title || 'este livro'
    const username = loan?.username || 'usuário'
    
    const confirmed = await showConfirm({
      title: 'Marcar como Devolvido',
      message: `Tem certeza que deseja marcar "${bookTitle}" (emprestado por ${username}) como devolvido?`,
      confirmText: 'Sim, Marcar como Devolvido',
      cancelText: 'Cancelar',
      type: 'warning'
    })

    if (!confirmed) {
      hideConfirm()
      return
    }

    try {
      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Falha ao devolver livro')
      }
      
      fetchLoans()
      hideConfirm()
    } catch (err) {
      setError('Falha ao devolver livro')
      hideConfirm()
    }
  }

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true
    return loan.status === filter
  })

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'status-active',
      returned: 'status-returned',
      overdue: 'status-overdue'
    }
    
    return (
      <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="loans-container">
        <div className="loading">Carregando empréstimos...</div>
      </div>
    )
  }

  return (
    <div className="loans-container">
      <div className="loans-header">
        <h1>Gerenciamento de Empréstimos</h1>
        <p>Gerencie todos os empréstimos de livros do sistema</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="loans-filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          Todos os Empréstimos ({loans.length})
        </button>
        <button 
          className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('active')}
        >
          Ativos ({loans.filter(l => l.status === 'active').length})
        </button>
        <button 
          className={filter === 'overdue' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('overdue')}
        >
          Atrasados ({loans.filter(l => l.status === 'overdue').length})
        </button>
        <button 
          className={filter === 'returned' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('returned')}
        >
          Devolvidos ({loans.filter(l => l.status === 'returned').length})
        </button>
      </div>

      <div className="loans-grid">
        {filteredLoans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-icon">📚</div>
            <h3>Nenhum empréstimo encontrado</h3>
            <p>Nenhum empréstimo corresponde aos critérios de filtro atuais.</p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div key={loan.loans_id} className="loan-card">
              <div className="loan-card-header">
                <div className="loan-info">
                  <h3>{loan.title}</h3>
                  <p className="loan-user">Emprestado por: {loan.username}</p>
                </div>
                {getStatusBadge(loan.status)}
              </div>
              
              {loan.photo && (
                <div className="loan-book-image">
                  <img src={loan.photo} alt={loan.title} />
                </div>
              )}
              
              <div className="loan-details">
                <div className="loan-dates">
                  <div className="date-item">
                    <span className="date-label">Data do Empréstimo:</span>
                    <span className="date-value">
                      {new Date(loan.loan_date).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {loan.return_date && (
                    <div className="date-item">
                      <span className="date-label">Data de Devolução:</span>
                      <span className="date-value">
                        {new Date(loan.return_date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
                
                {loan.description && (
                  <p className="loan-description">{loan.description}</p>
                )}
              </div>
              
              <div className="loan-actions">
                {loan.status === 'active' && (
                  <button 
                    className="return-btn"
                    onClick={() => handleReturnBook(loan.loans_id)}
                  >
                    Marcar como Devolvido
                  </button>
                )}
                <button className="details-btn">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        loading={confirmState.loading}
      />
    </div>
  )
}

export default Loans
