import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { executeQuery } from './DB/connection';
import { updateProfile } from './interface/updateProfile';
import { profileStorage, bookStorage } from './config/cloudinary';
import { runSeeders, uploadDefaultImages } from './seeders';
import { create as createBook } from './books/create';
import { update as updateBook } from './books/update';
import { deleteb as deleteBook } from './books/deleteb';
import { count as countBooks } from './books/count';
import { read as readAuthors } from './authors/read';
import { create as createAuthor } from './authors/create';
import { update as updateAuthor } from './authors/update';
import { deletea as deleteAuthor } from './authors/deletea';
import { count as countAuthors } from './authors/count';
import { getProfile } from './interface/getProfile';
import { readOneBook } from './interface/booksInterface/readOne';
import { readOneAuthor } from './interface/authorInterface/readOneAuthor';
import { updateAuthorImage } from './interface/authorInterface/updateAuthorImage';

dotenv.config();

async function readBooks(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;
    
    let query = `
      SELECT b.*, a.name_author 
      FROM books b 
      LEFT JOIN authors a ON b.author_id = a.author_id
    `;
    let params: any[] = [];
    
    if (search) {
      query += ` WHERE b.title LIKE ? OR a.name_author LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY b.book_id DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const books = await executeQuery(query, params);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 8082;

const upload = multer({ storage: profileStorage });
const uploadBook = multer({ storage: bookStorage });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/api/uploads', express.static(path.join(__dirname, '../FRONTEND/uploads')));

app.use(express.static(path.join(__dirname, '../FRONTEND/react-dist')));

app.use('/dist', express.static(path.join(__dirname, '../FRONTEND/dist')));
app.use('/interface/assets', express.static(path.join(__dirname, '../FRONTEND/dist/interface/assets')));
app.use('/interface', express.static(path.join(__dirname, '../FRONTEND/interface'), { index: false }));
app.use('/legacy', express.static(path.join(__dirname, '../FRONTEND'), { index: false }));

const loginHandler = async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).end();
    username = username.trim().toLowerCase();
    try {
        const results: any = await executeQuery('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (!results.length) return res.status(401).end();
        const user = results[0];
        if (password !== user.password) return res.status(401).end();
        (req.session as any).user = { id: user.id, username: user.username, role: user.role };
        res.json({ role: user.role, username: user.username, id: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

app.post('/login', loginHandler);
app.post('/api/login', loginHandler);

const registerHandler = async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).end();
    username = username.trim().toLowerCase();
    try {
        const exists: any = await executeQuery('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (exists.length) return res.status(409).end();
        await executeQuery('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'user']);
        res.status(201).end();
    } catch {
        res.status(500).end();
    }
};

app.post('/register', registerHandler);
app.post('/api/register', registerHandler);

const forgotPasswordHandler = async (req: Request, res: Response) => {
    const { username } = req.body;
    if (typeof username !== 'string') return res.status(400).end();
    
    try {
        const userExists: any = await executeQuery('SELECT * FROM users WHERE username = ? LIMIT 1', [username.trim().toLowerCase()]);
        
        if (userExists.length > 0) {
            const previewLink = `https://ethereal.email/message/preview/${Date.now()}`;
            res.json({ 
                message: 'If the account exists, a password reset email has been sent.',
                preview: previewLink
            });
        } else {
            res.json({ 
                message: 'If the account exists, a password reset email has been sent.'
            });
        }
    } catch (error) {
        res.json({ 
            message: 'If the account exists, a password reset email has been sent.'
        });
    }
};

app.post('/forgot-password', forgotPasswordHandler);
app.post('/api/forgot-password', forgotPasswordHandler);

app.post('/update-profile', upload.single('profile_image'), updateProfile);
app.post('/api/update-profile', upload.single('profile_image'), updateProfile);
app.get('/get-profile', getProfile);
app.get('/api/get-profile', getProfile);

app.get('/users/favorite', async (req, res) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    try {
        const result: any[] = await executeQuery(`
            SELECT b.*, a.name_author as author_name 
            FROM users u 
            JOIN books b ON u.favorite_book_id = b.book_id 
            LEFT JOIN authors a ON b.author_id = a.author_id 
            WHERE u.username = ?
        `, [username]);
        
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json(null);
        }
    } catch (error) {
        res.json(null);
    }
});

app.get('/api/users', async (_, res) => {
    console.log('GET /api/users called');
    try {
        const result = await executeQuery(`
            SELECT id as user_id, username, role 
            FROM users 
            ORDER BY username
        `);
        console.log('Users query result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/setup-profile-columns', async (_, res) => {
    try {
        try {
            await executeQuery(`ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL`);
        } catch (e) {
        }
        
        try {
            await executeQuery(`ALTER TABLE users ADD COLUMN description TEXT NULL`);
        } catch (e) {
        }
        
        res.json({ message: 'Profile columns setup completed' });
    } catch (error) {
        console.error('Error setting up profile columns:', error);
        res.status(500).json({ error: 'Failed to setup profile columns' });
    }
});

app.get('/api/map-existing-photos', async (_, res) => {
    try {
        const uploadsDir = path.join(__dirname, '../FRONTEND/uploads');
        const files = fs.readdirSync(uploadsDir);
        
        await executeQuery('UPDATE users SET profile_image = NULL WHERE profile_image NOT LIKE "%-%"');
        const photoMap: { [key: string]: string } = {
            'kayky': '1756472615955-Life in Silence.jpeg',
            'kaue': '1756472663784-stor.jpeg', 
            'barbara': '1756472640346-Fragments of Everyday Life.jpg'
        };
        
        for (const [username, filename] of Object.entries(photoMap)) {
            if (files.includes(filename)) {
                await executeQuery(
                    'UPDATE users SET profile_image = ? WHERE username = ?',
                    [filename, username]
                );
            }
        }
        
        res.json({ message: 'Photos mapped successfully', photoMap, filesInDir: files.length });
    } catch (error) {
        console.error('Error mapping photos:', error);
        res.status(500).json({ error: 'Failed to map photos' });
    }
});

app.get('/api/test-profile', async (req, res) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    try {
        const results: any[] = await executeQuery(
            'SELECT id, username, role, profile_image, description FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (!results.length) return res.status(404).json({ error: 'User not found' });

        const user = results[0];
        console.log(`test-profile for ${username}: profile_image = ${user.profile_image}`);
        
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            profile_image: user.profile_image || null,
            description: user.description || ''
        });
    } catch (error) {
        console.error('test-profile error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/users/favorite', async (req, res) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    try {
        const userResult: any[] = await executeQuery(`
            SELECT favorite_book_id FROM users WHERE username = ?
        `, [username]);
        
        if (userResult.length === 0) {
            return res.json(null);
        }
        
        const favoriteBookId = userResult[0].favorite_book_id;
        
        if (!favoriteBookId) {
            return res.json(null);
        }
        
        const result: any[] = await executeQuery(`
            SELECT b.*, a.name_author as author_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.author_id 
            WHERE b.book_id = ?
        `, [favoriteBookId]);
        
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html')));

app.get('/legacy', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/interface/main.html')));
app.get('/legacy/index.html', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/index.html')));
app.get('/legacy/user.html', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/interface/user.html')));

const requireAdmin = async (req: Request, res: Response, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.substring(7);
        const decoded = atob(token);
        const username = decoded.split(':')[0];

        const results: any = await executeQuery('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (!results.length) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const user = results[0];
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

app.get('/books/count', countBooks);
app.get('/api/books/count', countBooks);

app.get('/books/:id', (req: Request, res: Response) => {
    if ((req.headers.accept || '').includes('text/html')) {
        res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html'));
    } else {
        readOneBook(req, res);
    }
});
app.get('/api/books/:id', readOneBook);

app.get('/books', readBooks);
app.get('/api/books', readBooks);

app.post('/books', requireAdmin, createBook);
app.post('/api/books', requireAdmin, createBook);

app.put('/books/:id', requireAdmin, updateBook);
app.put('/api/books/:id', requireAdmin, updateBook);

app.delete('/books/:id', requireAdmin, deleteBook);
app.delete('/api/books/:id', requireAdmin, deleteBook);
app.post('/books/:id/update', requireAdmin, uploadBook.single('book_image'), async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return res.status(400).end();
    try {
        if (req.file) {
            const bookImage = (req.file as any).path;
            await executeQuery('UPDATE books SET photo = ? WHERE book_id = ?', [bookImage, id]);
            return res.json({ photo: bookImage });
        }
        res.status(400).end();
    } catch {
        res.status(500).end();
    }
});
app.post('/api/books/:id/update', requireAdmin, uploadBook.single('book_image'), async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return res.status(400).end();
    try {
        if (req.file) {
            const bookImage = (req.file as any).path;
            await executeQuery('UPDATE books SET photo = ? WHERE book_id = ?', [bookImage, id]);
            return res.json({ photo: bookImage });
        }
        res.status(400).end();
    } catch {
        res.status(500).end();
    }
});

app.get('/authors/count', countAuthors);
app.get('/api/authors/count', countAuthors);

app.get('/authors/:id', (req: Request, res: Response) => {
    if ((req.headers.accept || '').includes('text/html')) {
        res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html'));
    } else {
        readOneAuthor(req, res);
    }
});
app.get('/api/authors/:id', readOneAuthor);

app.get('/authors', readAuthors);
app.get('/api/authors', readAuthors);

app.post('/authors', requireAdmin, createAuthor);
app.post('/api/authors', requireAdmin, createAuthor);

app.put('/authors/:id', requireAdmin, updateAuthor);
app.put('/api/authors/:id', requireAdmin, updateAuthor);

app.delete('/authors/:id', requireAdmin, deleteAuthor);
app.delete('/api/authors/:id', requireAdmin, deleteAuthor);

app.post('/authors/:id/update', requireAdmin, upload.single('author_image'), updateAuthorImage);
app.post('/api/authors/:id/update', requireAdmin, upload.single('author_image'), updateAuthorImage);

app.get('/api/authors/:id/books', async (req: Request, res: Response) => {
    try {
        const authorId = req.params.id;
        const books = await executeQuery(`
            SELECT b.*, a.name_author 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.author_id 
            WHERE b.author_id = ?
            ORDER BY b.book_id DESC
        `, [authorId]);
        res.json(books);
    } catch (error) {
        console.error('Error fetching author books:', error);
        res.status(500).json({ error: 'Failed to fetch author books' });
    }
});

const rentHandler = async (req: Request, res: Response) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const bookId = Number(req.params.id);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });
    
    try {
        const userId = sessionUser.id;
        const alreadyLoaned: any = await executeQuery('SELECT * FROM loans WHERE user_id = ? AND book_id = ?', [userId, bookId]);
        if (alreadyLoaned.length) return res.status(409).json({ error: 'Book already rented by you' });
        
        await executeQuery('INSERT INTO loans (user_id, book_id, loan_date) VALUES (?, ?, NOW())', [userId, bookId]);
        res.status(201).json({ message: 'Book rented successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/rent/:id', rentHandler);
app.post('/api/rent/:id', rentHandler);

const favoriteHandler = async (req: Request, res: Response) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const bookId = Number(req.params.id);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });
    
    try {
        await executeQuery('UPDATE users SET favorite_book_id = ? WHERE username = ?', [bookId, sessionUser.username]);
        res.status(200).json({ message: 'Book added to favorites' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/favorite/:id', favoriteHandler);
app.post('/api/favorite/:id', favoriteHandler);

const usersFavoriteHandler = async (req: Request, res: Response) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).end();
    try {
        const results: any = await executeQuery(`
            SELECT b.book_id, b.title, b.description, b.photo, a.name_author AS author_name
            FROM users u
            LEFT JOIN books b ON u.favorite_book_id = b.book_id
            LEFT JOIN authors a ON b.author_id = a.author_id
            WHERE u.username = ?
            LIMIT 1
        `, [username]);
        if (!results.length || !results[0].book_id) return res.status(404).end();
        res.json(results[0]);
    } catch {
        res.status(500).end();
    }
};

app.get('/users/favorite', usersFavoriteHandler);
app.get('/api/users/favorite', usersFavoriteHandler);

const loansHandler = async (req: Request, res: Response) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).end();
    try {
        const userResult: any = await executeQuery('SELECT id FROM users WHERE username = ?', [username]);
        if (!userResult.length) return res.status(404).end();
        const loans = await executeQuery(`
            SELECT l.loans_id, l.loan_date,
                   b.book_id, b.title, b.photo, b.description
            FROM loans l
            JOIN books b ON l.book_id = b.book_id
            WHERE l.user_id = ?
            ORDER BY l.loan_date DESC
        `, [userResult[0].id]);
        res.json(loans);
    } catch {
        res.status(500).end();
    }
};

app.get('/loans', loansHandler);
app.get('/api/loans', loansHandler);

const returnHandler = async (req: Request, res: Response) => {
    const loanId = Number(req.params.loanId);
    if (isNaN(loanId)) return res.status(400).json({ error: 'Invalid loan ID' });
    
    try {
        const result: any = await executeQuery('DELETE FROM loans WHERE loans_id = ?', [loanId]);
        
        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        
        res.status(200).json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/return/:loanId', returnHandler);
app.post('/api/return/:loanId', returnHandler);

const getReviewsHandler = async (_req: Request, res: Response) => {
    try {
        const reviews = await executeQuery(`
            SELECT r.*, u.username, b.title as bookTitle 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.book_id
            ORDER BY r.review_date DESC
        `);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

app.get('/reviews', getReviewsHandler);
app.get('/api/reviews', getReviewsHandler);

const reviewsHandler = async (req: Request, res: Response) => {
    const { book_id, user_id, rating, comment } = req.body;
    if (!book_id || !user_id || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const bookCheck: any = await executeQuery('SELECT book_id FROM books WHERE book_id = ?', [book_id]);
        if (!bookCheck.length) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const userCheck: any = await executeQuery('SELECT id FROM users WHERE id = ?', [user_id]);
        if (!userCheck.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const existingReview: any = await executeQuery(
            'SELECT review_id FROM reviews WHERE user_id = ? AND book_id = ?', 
            [user_id, book_id]
        );
        
        if (existingReview.length > 0) {
            await executeQuery(
                'UPDATE reviews SET rating = ?, comment = ?, review_date = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ?',
                [rating, comment || '', user_id, book_id]
            );
            res.status(200).json({ message: 'Review updated successfully' });
        } else {
            await executeQuery(
                'INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', 
                [book_id, user_id, rating, comment || '']
            );
            res.status(201).json({ message: 'Review created successfully' });
        }
    } catch (error) {
        console.error('Error creating/updating review:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/reviews', reviewsHandler);
app.post('/api/reviews', reviewsHandler);

app.get('/user/me', (req: Request, res: Response) => {
    const user = (req.session as any)?.user;
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ id: user.id, username: user.username, role: user.role });
});

app.get('/api/user/me', (req: Request, res: Response) => {
    const user = (req.session as any)?.user;
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ id: user.id, username: user.username, role: user.role });
});

app.get('/user/role', (req: Request, res: Response) => {
    const user = (req.session as any)?.user;
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ role: user.role, isAdmin: user.role === 'admin' });
});

app.get('/api/user/role', (req: Request, res: Response) => {
    const user = (req.session as any)?.user;
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ role: user.role, isAdmin: user.role === 'admin' });
});

app.get('/api/stats', async (_req: Request, res: Response) => {
    try {
        const [booksResult, authorsResult, loansResult, usersResult] = await Promise.all([
            executeQuery('SELECT COUNT(*) as count FROM books'),
            executeQuery('SELECT COUNT(*) as count FROM authors'),
            executeQuery('SELECT COUNT(*) as count FROM loans WHERE return_date IS NULL'),
            executeQuery('SELECT COUNT(*) as count FROM users')
        ]);

        res.json({
            totalBooks: booksResult[0]?.count || 0,
            totalAuthors: authorsResult[0]?.count || 0,
            activeLoans: loansResult[0]?.count || 0,
            totalUsers: usersResult[0]?.count || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor PedBook...')
    
    await runSeeders()
    await uploadDefaultImages()
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`)
      console.log(`🌐 Acesse: http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

startServer()
