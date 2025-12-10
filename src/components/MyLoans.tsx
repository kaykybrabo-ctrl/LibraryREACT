import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loan } from '../types'
import { formatDateWithoutTimezone } from '../utils/dateUtils'
import './MyLoans.css'
import { toast } from 'react-toastify'

interface UserLoan extends Loan {
  return_date?: string
  due_date?: string
  status: 'active' | 'returned' | 'overdue'
  days_remaining?: number
}

const MyLoans: React.FC = () => {
  const { user } = useAuth()
  const [loans, setLoans] = useState<UserLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('active')

  useEffect(() => {
    if (user) {
      fetchMyLoans()
    }
  }, [user])

  const fetchMyLoans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/my-loans', {
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
      setError('Falha ao carregar seus empréstimos')
      toast.error('Falha ao carregar seus empréstimos')
    } finally {
      setLoading(false)
    }
  }

  const handleRenewLoan = async (loanId: number) => {
    try {
      const response = await fetch(`/api/loans/${loanId}/renew`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Falha ao renovar empréstimo')
      }
      
      fetchMyLoans()
      toast.success('Empréstimo renovado com sucesso!')
    } catch (err) {
      setError('Falha ao renovar empréstimo')
      toast.error('Falha ao renovar empréstimo')
    }
  }

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true
    return loan.status === filter
  })

  const getStatusBadge = (loan: UserLoan) => {
    const statusClasses = {
      active: 'status-active',
      returned: 'status-returned',
      overdue: 'status-overdue'
    }
    
    let statusText = loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
    if (loan.status === 'active' && loan.days_remaining !== undefined) {
      statusText += ` (${loan.days_remaining} dias restantes)`
    }
    
    return (
      <span className={`status-badge ${statusClasses[loan.status]}`}>
        {statusText}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="my-loans-container">
        <div className="loading">Carregando seus empréstimos...</div>
      </div>
    )
  }

  return (
    <div className="my-loans-container">
      <div className="my-loans-header">
        <h1>Meus Empréstimos</h1>
        <p>Acompanhe seus livros emprestados e histórico de leitura</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="loans-stats">
        <div className="stat-card">
          <div className="stat-number">{loans.filter(l => l.status === 'active').length}</div>
          <div className="stat-label">Empréstimos Ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{loans.filter(l => l.status === 'returned').length}</div>
          <div className="stat-label">Livros Lidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{loans.filter(l => l.status === 'overdue').length}</div>
          <div className="stat-label">Atrasados</div>
        </div>
      </div>

      <div className="my-loans-filters">
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
          Histórico ({loans.filter(l => l.status === 'returned').length})
        </button>
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          Todos ({loans.length})
        </button>
      </div>

      <div className="my-loans-grid">
        {filteredLoans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-icon">📚</div>
            <h3>Nenhum empréstimo encontrado</h3>
            <p>
              {filter === 'active' 
                ? "Você não tem empréstimos ativos. " 
                : filter === 'returned'
                ? "Você ainda não devolveu nenhum livro. "
                : "Nenhum empréstimo corresponde ao filtro atual. "
              }
              <Link to="/books">Navegue pelos livros para começar!</Link>
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div key={loan.loans_id} className={`my-loan-card ${loan.status}`}>
              <div className="loan-card-header">
                <div className="loan-book-image">
                  {loan.photo ? (
                    <img src={loan.photo} alt={loan.title} />
                  ) : (
                    <div className="no-image">📖</div>
                  )}
                </div>
                <div className="loan-info">
                  <h3>{loan.title}</h3>
                  {getStatusBadge(loan)}
                </div>
              </div>
              
              <div className="loan-details">
                <div className="loan-dates">
                  <div className="date-item">
                    <span className="date-label">Emprestado:</span>
                    <span className="date-value">
                      {formatDateWithoutTimezone(loan.loan_date)}
                    </span>
                  </div>
                  {loan.due_date && (
                    <div className="date-item">
                      <span className="date-label">Data de Vencimento:</span>
                      <span className={`date-value ${loan.status === 'overdue' ? 'overdue-date' : ''}`}>
                        {formatDateWithoutTimezone(loan.due_date)}
                      </span>
                    </div>
                  )}
                  {loan.return_date && (
                    <div className="date-item">
                      <span className="date-label">Devolvido:</span>
                      <span className="date-value">
                        {formatDateWithoutTimezone(loan.return_date)}
                      </span>
                    </div>
                  )}
                </div>
                
                {loan.description && (
                  <p className="loan-description">{loan.description}</p>
                )}
              </div>
              
              <div className="loan-actions">
                <Link 
                  to={`/books/${loan.book_id}`}
                  className="view-book-btn"
                >
                  Ver Livro
                </Link>
                {loan.status === 'active' && (
                  <button 
                    className="renew-btn"
                    onClick={() => handleRenewLoan(loan.loans_id)}
                  >
                    Renovar Empréstimo
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {loans.length > 0 && (
        <div className="loans-summary">
          <h3>Resumo de Leitura</h3>
          <p>
            Você emprestou <strong>{loans.length}</strong> livros no total, 
            com <strong>{loans.filter(l => l.status === 'returned').length}</strong> livros concluídos.
            {loans.filter(l => l.status === 'active').length > 0 && (
              <> Continue com a ótima leitura! Você atualmente tem <strong>{loans.filter(l => l.status === 'active').length}</strong> empréstimos ativos.</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default MyLoans
