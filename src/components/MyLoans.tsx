import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loan } from '../types'
import './MyLoans.css'

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
        throw new Error('Failed to fetch loans')
      }
      
      const data = await response.json()
      setLoans(data)
    } catch (err) {
      setError('Failed to load your loans')
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
        throw new Error('Failed to renew loan')
      }
      
      fetchMyLoans()
    } catch (err) {
      setError('Failed to renew loan')
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
      statusText += ` (${loan.days_remaining} days left)`
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
        <div className="loading">Loading your loans...</div>
      </div>
    )
  }

  return (
    <div className="my-loans-container">
      <div className="my-loans-header">
        <h1>My Loans</h1>
        <p>Track your borrowed books and reading history</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="loans-stats">
        <div className="stat-card">
          <div className="stat-number">{loans.filter(l => l.status === 'active').length}</div>
          <div className="stat-label">Active Loans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{loans.filter(l => l.status === 'returned').length}</div>
          <div className="stat-label">Books Read</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{loans.filter(l => l.status === 'overdue').length}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="my-loans-filters">
        <button 
          className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('active')}
        >
          Active ({loans.filter(l => l.status === 'active').length})
        </button>
        <button 
          className={filter === 'overdue' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({loans.filter(l => l.status === 'overdue').length})
        </button>
        <button 
          className={filter === 'returned' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('returned')}
        >
          History ({loans.filter(l => l.status === 'returned').length})
        </button>
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({loans.length})
        </button>
      </div>

      <div className="my-loans-grid">
        {filteredLoans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-icon">📚</div>
            <h3>No loans found</h3>
            <p>
              {filter === 'active' 
                ? "You don't have any active loans. " 
                : filter === 'returned'
                ? "You haven't returned any books yet. "
                : "No loans match the current filter. "
              }
              <Link to="/books">Browse books to get started!</Link>
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
                    <span className="date-label">Borrowed:</span>
                    <span className="date-value">
                      {new Date(loan.loan_date).toLocaleDateString()}
                    </span>
                  </div>
                  {loan.due_date && (
                    <div className="date-item">
                      <span className="date-label">Due Date:</span>
                      <span className={`date-value ${loan.status === 'overdue' ? 'overdue-date' : ''}`}>
                        {new Date(loan.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {loan.return_date && (
                    <div className="date-item">
                      <span className="date-label">Returned:</span>
                      <span className="date-value">
                        {new Date(loan.return_date).toLocaleDateString()}
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
                  View Book
                </Link>
                {loan.status === 'active' && (
                  <button 
                    className="renew-btn"
                    onClick={() => handleRenewLoan(loan.loans_id)}
                  >
                    Renew Loan
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {loans.length > 0 && (
        <div className="loans-summary">
          <h3>Reading Summary</h3>
          <p>
            You've borrowed <strong>{loans.length}</strong> books in total, 
            with <strong>{loans.filter(l => l.status === 'returned').length}</strong> books completed.
            {loans.filter(l => l.status === 'active').length > 0 && (
              <> Keep up the great reading! You currently have <strong>{loans.filter(l => l.status === 'active').length}</strong> active loans.</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default MyLoans
