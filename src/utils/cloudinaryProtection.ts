import cloudinary from '../config/cloudinary'

const PROTECTED_IMAGES = [
  'pedbook/books/default-book',
  'pedbook/profiles/default-user', 
  'pedbook/profiles/default-author',
  'pedbook/books/book-life-in-silence',
  'pedbook/books/book-fragments-of-everyday-life',
  'pedbook/books/book-stories-of-the-wind',
  'pedbook/books/book-between-noise-and-calm',
  'pedbook/books/book-the-horizon-and-the-sea',
  'pedbook/books/book-winds-of-change',
  'pedbook/books/book-paths-of-the-soul',
  'pedbook/books/book-under-the-grey-sky',
  'pedbook/books/book-notes-of-a-silence',
  'pedbook/books/book-the-last-letter',
  'pedbook/books/book-between-words',
  'pedbook/books/book-colors-of-the-city',
  'pedbook/books/book-the-weight-of-the-rain',
  'pedbook/books/book-blue-night',
  'pedbook/books/book-faces-of-memory',
  'pedbook/books/book-origin-tales',
  'pedbook/books/book-fragments-of-hope',
  'pedbook/books/book-trails-and-scars',
  'pedbook/books/book-from-the-other-side-of-the-street',
  'pedbook/books/book-interrupted-seasons',
  'pedbook/profiles/author-guilherme-biondo',
  'pedbook/profiles/author-manoel-leite',
  'pedbook/carousel/carousel-1',
  'pedbook/carousel/carousel-2',
  'pedbook/carousel/carousel-3'
]

export function isProtectedImage(publicId: string): boolean {
  return PROTECTED_IMAGES.includes(publicId)
}

export async function safeDeleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (isProtectedImage(publicId)) {
      return {
        success: false,
        message: `Imagem protegida não pode ser deletada: ${publicId}`
      }
    }

    try {
      await cloudinary.api.resource(publicId)
    } catch (error: any) {
      if (error.http_code === 404) {
        return {
          success: false,
          message: `Imagem não encontrada: ${publicId}`
        }
      }
      throw error
    }
    const result = await cloudinary.uploader.destroy(publicId)
    
    if (result.result === 'ok') {
      return {
        success: true,
        message: `Imagem deletada com sucesso: ${publicId}`
      }
    } else {
      return {
        success: false,
        message: `Falha ao deletar imagem: ${publicId} - ${result.result}`
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao deletar imagem: ${publicId} - ${error.message}`
    }
  }
}

export function getProtectedImages(): string[] {
  return [...PROTECTED_IMAGES]
}

export function addProtectedImage(publicId: string): void {
  if (!PROTECTED_IMAGES.includes(publicId)) {
    PROTECTED_IMAGES.push(publicId)
  }
}

export function removeProtectedImage(publicId: string): boolean {
  const index = PROTECTED_IMAGES.indexOf(publicId)
  if (index > -1 && !isEssentialImage(publicId)) {
    PROTECTED_IMAGES.splice(index, 1)
    return true
  }
  return false
}

function isEssentialImage(publicId: string): boolean {
  const essentialImages = [
    'pedbook/books/default-book',
    'pedbook/profiles/default-user', 
    'pedbook/profiles/default-author'
  ]
  return essentialImages.includes(publicId)
}

export async function listAllImages(): Promise<any[]> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'pedbook/',
      max_results: 500
    })
    return result.resources
  } catch (error) {
    console.error('Erro ao listar imagens:', error)
    return []
  }
}

export async function createImageBackupList(): Promise<{ [key: string]: string }> {
  const backupList: { [key: string]: string } = {}
  
  for (const publicId of PROTECTED_IMAGES) {
    try {
      const resource = await cloudinary.api.resource(publicId)
      backupList[publicId] = resource.secure_url
    } catch (error) {
      console.warn(`Imagem protegida não encontrada: ${publicId}`)
    }
  }
  
  return backupList
}
