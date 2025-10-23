import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  showLoginModal: (message?: string) => void;
  hideLoginModal: () => void;
  isModalOpen: boolean;
  modalMessage: string;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showLoginModal = (message?: string) => {
    setModalMessage(message || 'Para realizar esta ação, você precisa estar logado no sistema.');
    setIsModalOpen(true);
  };

  const hideLoginModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  return (
    <AuthModalContext.Provider
      value={{
        showLoginModal,
        hideLoginModal,
        isModalOpen,
        modalMessage,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
