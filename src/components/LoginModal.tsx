import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h3>🔐 Login Necessário</h3>
          <button className="login-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="login-modal-body">
          <div className="login-modal-icon">
            👤
          </div>
          <p className="login-modal-message">
            {message || 'Para realizar esta ação, você precisa estar logado no sistema.'}
          </p>
          <p className="login-modal-question">
            Deseja fazer login agora?
          </p>
        </div>
        
        <div className="login-modal-actions">
          <button className="login-modal-btn login-modal-btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button className="login-modal-btn login-modal-btn-primary" onClick={handleLogin}>
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
