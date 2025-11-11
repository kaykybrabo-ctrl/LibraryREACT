import { executeQuery } from '../DB/connection'
import bcrypt from 'bcrypt'

export async function runSeeders() {
  console.log('Iniciando seeders...')

  try {
    await createTables()
    await cleanDatabase()
    await createAdminUser()
    await createAuthorsAndBooks()
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
      user_id INT,
      favorite_book_id INT,
      FOREIGN KEY (favorite_book_id) REFERENCES books(book_id)
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

async function cleanDatabase() {
  console.log('Limpando banco de dados...')
  
  await executeQuery('SET FOREIGN_KEY_CHECKS = 0')
  
  await executeQuery('UPDATE users SET favorite_book_id = NULL WHERE favorite_book_id IS NOT NULL')
  
  await executeQuery('DELETE FROM reviews')
  await executeQuery('DELETE FROM loans')
  await executeQuery('DELETE FROM book_categories')
  await executeQuery('DELETE FROM book_publishers')
  await executeQuery('DELETE FROM books')
  await executeQuery('DELETE FROM authors')
  await executeQuery('DELETE FROM users')
  await executeQuery('DELETE FROM categories')
  await executeQuery('DELETE FROM publishers')
  
  await executeQuery('ALTER TABLE users AUTO_INCREMENT = 1')
  await executeQuery('ALTER TABLE authors AUTO_INCREMENT = 1')
  await executeQuery('ALTER TABLE books AUTO_INCREMENT = 1')
  await executeQuery('ALTER TABLE reviews AUTO_INCREMENT = 1')
  await executeQuery('ALTER TABLE loans AUTO_INCREMENT = 1')
  
  await executeQuery('SET FOREIGN_KEY_CHECKS = 1')
  
  console.log('Banco de dados limpo!')
}

async function createAdminUser() {
  console.log('Criando usuário administrador...')

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

async function createAuthorsAndBooks() {
  console.log('Criando autores e livros...')

  await executeQuery(`
    INSERT INTO authors (author_id, name_author, description, photo) VALUES
    (1, 'Guilherme Biondo', 'Guilherme Biondo é um escritor que começou a escrever desde jovem, movido pela curiosidade e paixão por contar histórias. Seus livros falam sobre pessoas, sentimentos e tudo que faz parte do cotidiano, mas com uma perspectiva única e sincera.', 'author-guilherme-biondo'),
    (2, 'Manoel Leite', 'Manoel Leite é um autor e observador atento da vida cotidiana. Suas histórias surgem de experiências simples, mas cheias de significado. Com um estilo de escrita direto e humano, Manoel busca tocar o leitor com temas sobre memória, afeto e identidade.', 'author-manoel-leite')
  `)

  const books = [
    { id: 1, author_id: 1, title: 'Life in Silence', description: 'Uma história tocante sobre superar lutas pessoais através do silêncio e introspecção.', photo: 'book-life-in-silence' },
    { id: 2, author_id: 1, title: 'Fragments of Everyday Life', description: 'Contos curtos capturando a beleza e complexidade dos momentos cotidianos.', photo: 'book-fragments-of-everyday-life' },
    { id: 3, author_id: 2, title: 'Stories of the Wind', description: 'Contos inspirados pelos ventos sempre mutáveis e os mistérios que eles carregam.', photo: 'book-stories-of-the-wind' },
    { id: 4, author_id: 2, title: 'Between Noise and Calm', description: 'Uma narrativa explorando o equilíbrio entre o caos e a paz.', photo: 'book-between-noise-and-calm' },
    { id: 5, author_id: 1, title: 'The Horizon and the Sea', description: 'Uma jornada evocativa de descoberta ao longo do horizonte infinito.', photo: 'book-the-horizon-and-the-sea' },
    { id: 6, author_id: 1, title: 'Winds of Change', description: 'Histórias sobre transformação e os ventos que nos guiam.', photo: 'book-winds-of-change' },
    { id: 7, author_id: 2, title: 'Paths of the Soul', description: 'Uma exploração poética dos caminhos internos que todos percorremos.', photo: 'book-paths-of-the-soul' },
    { id: 8, author_id: 2, title: 'Under the Grey Sky', description: 'Um conto dramático ambientado contra um fundo de céus incertos.', photo: 'book-under-the-grey-sky' },
    { id: 9, author_id: 1, title: 'Notes of a Silence', description: 'Reflexões sobre momentos de silêncio e seus significados poderosos.', photo: 'book-notes-of-a-silence' },
    { id: 10, author_id: 2, title: 'The Last Letter', description: 'Uma história comovente girando em torno de uma despedida final.', photo: 'book-the-last-letter' },
    { id: 11, author_id: 1, title: 'Between Words', description: 'Explorando o que existe além da linguagem falada e do texto escrito.', photo: 'book-between-words' },
    { id: 12, author_id: 2, title: 'Colors of the City', description: 'Um retrato vívido da vida urbana através de suas cores vibrantes.', photo: 'book-colors-of-the-city' },
    { id: 13, author_id: 1, title: 'The Weight of the Rain', description: 'Uma história metafórica sobre fardos e alívio trazidos pela chuva.', photo: 'book-the-weight-of-the-rain' },
    { id: 14, author_id: 2, title: 'Blue Night', description: 'Uma jornada misteriosa através da escuridão e luz da noite.', photo: 'book-blue-night' },
    { id: 15, author_id: 1, title: 'Faces of Memory', description: 'Histórias que capturam a natureza fugaz das memórias.', photo: 'book-faces-of-memory' },
    { id: 16, author_id: 2, title: 'Origin Tales', description: 'Explorando as raízes e começos de nossa existência.', photo: 'book-origin-tales' },
    { id: 17, author_id: 1, title: 'Fragments of Hope', description: 'Pequenos vislumbres de esperança em tempos desafiadores.', photo: 'book-fragments-of-hope' },
    { id: 18, author_id: 2, title: 'Trails and Scars', description: 'As marcas deixadas pelas jornadas e lutas da vida.', photo: 'book-trails-and-scars' },
    { id: 19, author_id: 1, title: 'From the Other Side of the Street', description: 'Uma mudança de perspectiva para ver o mundo de um novo ângulo.', photo: 'book-from-the-other-side-of-the-street' },
    { id: 20, author_id: 2, title: 'Interrupted Seasons', description: 'Histórias sobre mudanças inesperadas e pausas na vida.', photo: 'book-interrupted-seasons' }
  ]

  for (const book of books) {
    await executeQuery(`
      INSERT INTO books (book_id, author_id, title, description, photo) 
      VALUES (?, ?, ?, ?, ?)
    `, [book.id, book.author_id, book.title, book.description, book.photo])
  }

  console.log('2 autores e 20 livros criados!')
}

