import axios from 'axios'

let showLoginModalGlobal: ((message?: string) => void) | null = null;

export const setShowLoginModal = (showModal: (message?: string) => void) => {
  showLoginModalGlobal = showModal;
};

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('401') || 
      message.includes('Unauthorized') ||
      message.includes('AuthModalError') ||
      message.includes('SilentAuthError')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('401') || message.includes('Unauthorized')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      if (url.includes('/login') || url.includes('/register')) {
        return Promise.reject(error);
      }
      
      if (url.includes('get-profile') || url.includes('user/me')) {
        const silentError = new Error('User not authenticated');
        silentError.name = 'SilentAuthError';
        error.config.suppressLog = true;
        return Promise.reject(silentError);
      }
      
      let message = 'Para realizar esta ação, você precisa estar logado no sistema.';
      
      if (url.includes('favorite')) {
        message = 'Para favoritar livros, você precisa estar logado no sistema.';
      } else if (url.includes('rent')) {
        message = 'Para alugar livros, você precisa estar logado no sistema.';
      } else if (url.includes('review')) {
        message = 'Para avaliar livros, você precisa estar logado no sistema.';
      }
      
      if (showLoginModalGlobal) {
        showLoginModalGlobal(message);
        error.config.suppressLog = true;
        const silentError = new Error('Authentication required - modal shown');
        silentError.name = 'AuthModalError';
        return Promise.reject(silentError);
      } else {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      if (url.includes('/login') || url.includes('/register')) {
        return Promise.reject(error);
      }
      
      if (!error.config?.url?.includes('get-profile') && !error.config?.url?.includes('user/me')) {
        if (showLoginModalGlobal) {
          showLoginModalGlobal('Para realizar esta ação, você precisa estar logado no sistema.');
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
