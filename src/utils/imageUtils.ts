export const getImageUrl = (photo: string | null | undefined, type: 'book' | 'profile' | 'author' = 'book', forceRefresh: boolean = false): string => {
  if (!photo) {
    return getFallbackImageUrl(type)
  }

  let url = ''
  
  if (photo.startsWith('http')) {
    url = photo
  } else if (photo.includes('pedbook/')) {
    url = `https://res.cloudinary.com/ddfgsoh5g/image/upload/${photo}`
  } else if (photo.startsWith('book-') || photo.startsWith('author-') || photo.startsWith('default-')) {
    const folder = type === 'book' ? 'pedbook/books' : 'pedbook/profiles'
    url = `https://res.cloudinary.com/ddfgsoh5g/image/upload/${folder}/${photo}`
  } else {
    url = `/api/uploads/${photo}`
  }
  
  if (forceRefresh) {
    const separator = url.includes('?') ? '&' : '?'
    url += `${separator}t=${Date.now()}`
  }
  
  return url
}

export const getFallbackImageUrl = (type: 'book' | 'profile' | 'author' = 'book'): string => {
  const defaultImages = {
    book: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/pedbook/books/default-book',
    profile: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/pedbook/profiles/default-user',
    author: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/pedbook/profiles/default-author'
  }
  return defaultImages[type]
}
