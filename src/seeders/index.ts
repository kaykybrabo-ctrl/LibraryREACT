import { executeQuery } from '../DB/connection'
import bcrypt from 'bcrypt'

export async function runSeeders() {
  console.log('Iniciando seeders...')
  
  try {
    await createTables()
    await createAdminUser()
    await uploadExistingImages()
    console.log('Seeders executados com sucesso!')
  } catch (error) {
    console.error('Erro ao executar seeders:', error)
    throw error
  }
}

async function createTables() {
  console.log('Criando tabelas...')
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS authors (
      author_id INT AUTO_INCREMENT PRIMARY KEY,
      name_author VARCHAR(255) NOT NULL,
      description TEXT
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS books (
      book_id INT AUTO_INCREMENT PRIMARY KEY,
      author_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      photo VARCHAR(255),
      FOREIGN KEY (author_id) REFERENCES authors(author_id)
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      profile_image VARCHAR(255),
      description TEXT,
      user_id INT
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS loans (
      loans_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id INT NOT NULL,
      loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      return_date TIMESTAMP NULL,
      status ENUM('active', 'returned') DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(book_id)
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS publishers (
      publish_id INT AUTO_INCREMENT PRIMARY KEY,
      publisher_name VARCHAR(255) NOT NULL
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS book_categories (
      book_id INT NOT NULL,
      category_id INT NOT NULL,
      PRIMARY KEY (book_id, category_id),
      FOREIGN KEY (book_id) REFERENCES books(book_id),
      FOREIGN KEY (category_id) REFERENCES categories(category_id)
    )
  `)

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS book_publishers (
      book_id INT NOT NULL,
      publish_id INT NOT NULL,
      PRIMARY KEY (book_id, publish_id),
      FOREIGN KEY (book_id) REFERENCES books(book_id),
      FOREIGN KEY (publish_id) REFERENCES publishers(publish_id)
    )
  `)

  console.log('Tabelas criadas com sucesso!')
}

async function createAdminUser() {
  console.log('Criando usuário administrador...')
  
  const existingUser = await executeQuery(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    ['kayky']
  )
  
  if (existingUser.length > 0) {
    console.log('Usuário admin já existe, pulando criação...')
    return
  }
  
  const hashedPassword = await bcrypt.hash('123', 10)
  
  await executeQuery(`
    INSERT INTO users (username, password, role, description) 
    VALUES (?, ?, 'admin', 'Administrador do sistema PedBook')
  `, ['kayky', hashedPassword])
  
  console.log('Usuário administrador criado com sucesso!')
  console.log('Usuário: kayky')
  console.log('Senha: 123')
}

export async function uploadDefaultImages() {
  console.log('Fazendo upload das imagens padrão para Cloudinary...')
  
  const cloudinary = require('../config/cloudinary').default
  
  try {
    const defaultUserImage = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMTYyYzc0Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjUgNzVjMC0xMy44IDExLjItMjUgMjUtMjVzMjUgMTEuMiAyNSAyNXYxMEgyNXYtMTB6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
      {
        folder: 'pedbook/profiles',
        public_id: 'default-user',
        overwrite: true
      }
    )
    
    const defaultBookImage = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDEyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMTYyYzc0Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxNjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjEiLz4KPHN2ZyB4PSI0NSIgeT0iNzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ij4KPHA+8J+TmjwvcD4KPC9zdmc+Cjx0ZXh0IHg9IjYwIiB5PSIxNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TGl2cm88L3RleHQ+Cjwvc3ZnPg==',
      {
        folder: 'pedbook/books',
        public_id: 'default-book',
        overwrite: true
      }
    )
    
    const defaultAuthorImage = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjUgNzVjMC0xMy44IDExLjItMjUgMjUtMjVzMjUgMTEuMiAyNSAyNXYxMEgyNXYtMTB6IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI1MCIgeT0iOTIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BdXRvcjwvdGV4dD4KPC9zdmc+',
      {
        folder: 'pedbook/profiles',
        public_id: 'default-author',
        overwrite: true
      }
    )
    console.log('Imagens padrão enviadas para Cloudinary!')
    console.log('Imagem padrão do usuário:', defaultUserImage.secure_url)
    console.log('Imagem padrão do livro:', defaultBookImage.secure_url)
    console.log('Imagem padrão do autor:', defaultAuthorImage.secure_url)
    
  } catch (error) {
    console.error('Erro ao fazer upload das imagens padrão:', error)
    throw error
  }
}

export async function uploadExistingImages() {
  console.log('Fazendo upload das imagens existentes para Cloudinary e associando aos livros/autores...')
  
  const cloudinary = require('../config/cloudinary').default
  const fs = require('fs')
  const path = require('path')
  
  try {
    const authorImages = {
      '1756472545209-guilhermebiondo.jpg': 'Guilherme Biondo',
      '1756472560217-Manoel.webp': 'Manoel Leite'
    }
    
    const bookImages = {
      '1756472615955-Life in Silence.jpeg': 'Life in Silence',
      '1756472640346-Fragments of Everyday Life.jpg': 'Fragments of Everyday Life',
      '1756472663784-stor.jpeg': 'Stories of the Wind',
      '1756472688957-Between Noise and Calm.jpg': 'Between Noise and Calm',
      '1756472705438-The Horizon and the Sea.jpg': 'The Horizon and the Sea',
      '1756472911017-Winds of Change.jpg': 'Winds of Change',
      '1756472927973-Paths of the Soul.jpg': 'Paths of the Soul',
      '1756472948239-Under the Grey Sky.jpg': 'Under the Grey Sky',
      '1756472976842-Notes of a Silence.jpg': 'Notes of a Silence',
      '1756472998850-The last.jpg': 'The Last Letter',
      '1756473022314-Between Words.jpg': 'Between Words',
      '1756473037438-Colors of the City.jpg': 'Colors of the City',
      '1756473069362-The Weight of the Rain.jpg': 'The Weight of the Rain',
      '1756473100928-Blue Night.jpg': 'Blue Night',
      '1756473141750-Faces of Memory.jpg': 'Faces of Memory',
      '1756473156075-origin.jpg': 'Origin Tales',
      '1756473212996-Fragments of Hope.jpg': 'Fragments of Hope',
      '1756473225148-Trails and Scars.jpg': 'Trails and Scars',
      '1756473237374-From the Other Side of the Street.jpg': 'From the Other Side of the Street',
      '1756473253299-Interrupted Seasons.jpg': 'Interrupted Seasons'
    }
    
    const uploadsPath = '/usr/src/app/FRONTEND/uploads'
    
    for (const [filename, authorName] of Object.entries(authorImages)) {
      const filePath = path.join(uploadsPath, filename)
      
      if (fs.existsSync(filePath)) {
        console.log(`Fazendo upload da imagem do autor: ${authorName}`)
        
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'pedbook/profiles',
          public_id: `author-${authorName.toLowerCase().replace(/\s+/g, '-')}`,
          overwrite: true
        })
        
        await executeQuery(
          'UPDATE authors SET photo = ? WHERE name_author = ?',
          [result.public_id, authorName]
        )
        
        console.log(`✅ Imagem do autor ${authorName} associada: ${result.secure_url}`)
      }
    }
    
    for (const [filename, bookTitle] of Object.entries(bookImages)) {
      const filePath = path.join(uploadsPath, filename)
      
      if (fs.existsSync(filePath)) {
        console.log(`Fazendo upload da imagem do livro: ${bookTitle}`)
        
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'pedbook/books',
          public_id: `book-${bookTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          overwrite: true
        })
        
        await executeQuery(
          'UPDATE books SET photo = ? WHERE title = ?',
          [result.public_id, bookTitle]
        )
        
        console.log(`✅ Imagem do livro ${bookTitle} associada: ${result.secure_url}`)
      }
    }
    
    console.log('✅ Todas as imagens existentes foram enviadas e associadas!')
    
  } catch (error) {
    console.error('Erro ao fazer upload das imagens existentes:', error)
  }
}
