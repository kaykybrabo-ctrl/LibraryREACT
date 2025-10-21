export const getImageUrl = (photo: string | null | undefined, type: 'book' | 'profile' | 'author' = 'book'): string => {
  if (!photo) {
    const defaultImages = {
      book: '/api/uploads/default-book.svg',
      profile: '/api/uploads/default-user.png',
      author: '/api/uploads/default-author.png'
    }
    return defaultImages[type]
  }


  if (photo.startsWith('http')) {
    return photo
  }

  if (photo.includes('pedbook/')) {
    return `https://res.cloudinary.com/ddfgsoh5g/image/upload/${photo}`
  }
  return `/api/uploads/${photo}`
}

export const getFallbackImageUrl = (type: 'book' | 'profile' | 'author' = 'book'): string => {
  const defaultImages = {
    book: '/api/uploads/default-book.svg',
    profile: '/api/uploads/default-user.png',
    author: '/api/uploads/default-author.png'
  }
  return defaultImages[type]
}
