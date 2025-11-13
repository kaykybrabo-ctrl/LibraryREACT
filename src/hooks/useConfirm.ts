import { useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
  loading: boolean
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    onConfirm: () => {},
    loading: false
  })

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
        loading: false,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, loading: true }))
          resolve(true)
        }
      })
    })
  }

  const hideConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false, loading: false }))
  }

  const handleCancel = () => {
    hideConfirm()
  }

  return {
    confirmState,
    showConfirm,
    hideConfirm,
    handleCancel
  }
}
