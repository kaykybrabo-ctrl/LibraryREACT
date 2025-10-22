import { executeQuery } from '../DB/connection'
import bcrypt from 'bcrypt'

export async function runSeeders() {
  console.log('Iniciando seeders...')

  try {
    await createTables()
    await createAdminUser()
    console.log('Seeders executados com sucesso!')
  } catch (error) {
    console.error('Erro ao executar seeders:', error)
    throw error
  }
}

async function createTables() {
  console.log('Criando tabelas do banco de dados...')

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS authors (
      author_id INT AUTO_INCREMENT PRIMARY KEY,
      name_author VARCHAR(255) NOT NULL,
      description TEXT,
      photo VARCHAR(255)
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
    CREATE TABLE IF NOT EXISTS reviews (
      review_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(book_id),
      UNIQUE KEY unique_user_book (user_id, book_id)
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

  console.log('Todas as tabelas do banco foram criadas com sucesso!')
}

async function createAdminUser() {
  console.log('Verificando usuário administrador...')

  const existingUser = await executeQuery(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    ['kayky']
  )

  if (existingUser.length > 0) {
    console.log('Usuário admin já existe')
    return
  }

  const hashedPassword = await bcrypt.hash('123', 10)

  await executeQuery(`
    INSERT INTO users (username, password, role, description, profile_image) 
    VALUES (?, ?, 'admin', 'Administrador do sistema PedBook', 'default-user')
  `, ['kayky', hashedPassword])

  console.log('   Usuário administrador criado com sucesso!')
  console.log('   Usuário: kayky')
  console.log('   Senha: 123')
  console.log('   Role: admin')
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