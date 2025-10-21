import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.config({
  cloud_name: 'ddfgsoh5g',
  api_key: '877612776229599',
  api_secret: 'pDivBkF6G2A5PWLY_XihAA592kQ',
})

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pedbook',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  } as any
})

export const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pedbook/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' }
    ]
  } as any
})

export const bookStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pedbook/books',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 600, height: 900, crop: 'fill' },
      { quality: 'auto' }
    ]
  } as any
})

export default cloudinary
