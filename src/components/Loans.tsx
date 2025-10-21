import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Loan } from '../types'
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
        throw new Error('Failed to fetch loans')
      }
      
      const data = await response.json()
      setLoans(data)
    } catch (err) {
      setError('Failed to load loans')
      console.error('Error fetching loans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (loanId: number) => {
    try {
      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to return book')
      }
      
      fetchLoans()
    } catch (err) {
      setError('Failed to return book')
      console.error('Error returning book:', err)
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
        <div className="loading">Loading loans...</div>
      </div>
    )
  }

  return (
    <div className="loans-container">
      <div className="loans-header">
        <h1>Library Loans Management</h1>
        <p>Manage all book loans in the system</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="loans-filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All Loans ({loans.length})
        </button>
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
          Returned ({loans.filter(l => l.status === 'returned').length})
        </button>
      </div>

      <div className="loans-grid">
        {filteredLoans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-icon">📚</div>
            <h3>No loans found</h3>
            <p>No loans match the current filter criteria.</p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div key={loan.loans_id} className="loan-card">
              <div className="loan-card-header">
                <div className="loan-info">
                  <h3>{loan.title}</h3>
                  <p className="loan-user">Borrowed by: {loan.username}</p>
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
                    <span className="date-label">Loan Date:</span>
                    <span className="date-value">
                      {new Date(loan.loan_date).toLocaleDateString()}
                    </span>
                  </div>
                  {loan.return_date && (
                    <div className="date-item">
                      <span className="date-label">Return Date:</span>
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
                {loan.status === 'active' && (
                  <button 
                    className="return-btn"
                    onClick={() => handleReturnBook(loan.loans_id)}
                  >
                    Mark as Returned
                  </button>
                )}
                <button className="details-btn">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Loans
