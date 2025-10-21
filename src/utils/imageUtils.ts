export const getImageUrl = (photo: string | null | undefined, type: 'book' | 'profile' | 'author' = 'book', forceRefresh: boolean = false): string => {
  if (!photo) {
    const defaultImages = {
      book: '/api/uploads/default-book.svg',
      profile: '/api/uploads/default-user.png',
      author: '/api/uploads/default-author.png'
    }
    return defaultImages[type]
  }

  let url = ''
  
  if (photo.startsWith('http')) {
    url = photo
  } else if (photo.includes('pedbook/')) {
    url = `https://res.cloudinary.com/ddfgsoh5g/image/upload/${photo}`
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
    book: '/api/uploads/default-book.svg',
    profile: '/api/uploads/default-user.png',
    author: '/api/uploads/default-author.png'
  }
  return defaultImages[type]
}
