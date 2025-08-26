import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import session from 'express-session';
import cors from 'cors';

import { executeQuery } from './DB/connection';
import { read as readBooks } from './books/read';
import { create as createBook } from './books/create';
import { update as updateBook } from './books/update';
import { deleteb as deleteBook } from './books/deleteb';
import { count as countBooks } from './books/count';
import { read as readAuthors } from './authors/read';
import { create as createAuthor } from './authors/create';
import { update as updateAuthor } from './authors/update';
import { deletea as deleteAuthor } from './authors/deletea';
import { count as countAuthors } from './authors/count';
import { updateProfile } from './interface/updateProfile';
import { getProfile } from './interface/getProfile';
import { readOneBook } from './interface/booksInterface/readOne';
import { readOneAuthor } from './interface/authorInterface/readOneAuthor';
import { updateAuthorImage } from './interface/authorInterface/updateAuthorImage';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../FRONTEND/uploads'),
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false, cookie: { secure: false } }));

// Serve React app
app.use(express.static(path.join(__dirname, '../FRONTEND/react-dist')));

// Legacy static files for backward compatibility
app.use('/dist', express.static(path.join(__dirname, '../FRONTEND/dist')));
app.use('/interface/assets', express.static(path.join(__dirname, '../FRONTEND/dist/interface/assets')));
app.use('/api/uploads', express.static(path.join(__dirname, '../FRONTEND/uploads')));
app.use('/interface', express.static(path.join(__dirname, '../FRONTEND/interface'), { index: false }));
app.use('/legacy', express.static(path.join(__dirname, '../FRONTEND'), { index: false }));

// Login routes (both /login and /api/login for compatibility)
const loginHandler = async (req: Request, res: Response) => {
    let { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).end();
    username = username.trim().toLowerCase();
    try {
        console.log('Executing query for user:', username);
        const results: any = await executeQuery('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        console.log('Query results:', results);
        if (!results.length) return res.status(401).end();
        const user = results[0];
        console.log('User found:', user);
        if (password !== user.password) return res.status(401).end();
        (req.session as any).user = { id: user.id, username: user.username, role: user.role };
        res.json({ role: user.role, username: user.username, id: user.id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

app.post('/login', loginHandler);
app.post('/api/login', loginHandler);

// Register routes (both /register and /api/register for compatibility)
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

app.post('/update-profile', upload.single('profile_image'), updateProfile);
app.post('/api/update-profile', upload.single('profile_image'), updateProfile);
app.get('/get-profile', getProfile);
app.get('/api/get-profile', getProfile);

// User favorite routes
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
        console.error('Database error in users/favorite:', error);
        res.json(null);
    }
});

app.get('/api/users/favorite', async (req, res) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    try {
        // First check if user has a favorite book
        const userResult: any[] = await executeQuery(`
            SELECT favorite_book_id FROM users WHERE username = ?
        `, [username]);
        
        if (userResult.length === 0) {
            return res.json(null);
        }
        
        const favoriteBookId = userResult[0].favorite_book_id;
        
        // If no favorite book set, return null
        if (!favoriteBookId) {
            return res.json(null);
        }
        
        // Get the favorite book details
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
        console.error('Database error in api/users/favorite:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Serve React app for all routes (SPA)
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html')));

// Legacy routes for backward compatibility
app.get('/legacy', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/interface/main.html')));
app.get('/legacy/index.html', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/index.html')));
app.get('/legacy/user.html', (_req, res) => res.sendFile(path.join(__dirname, '../FRONTEND/interface/user.html')));

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: any) => {
    const user = (req.session as any)?.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Books routes (both /books and /api/books for compatibility)
app.get('/books/count', countBooks);
app.get('/api/books/count', countBooks);

app.get('/books/:id', (req: Request, res: Response) => {
    if ((req.headers.accept || '').includes('text/html')) {
        // Serve React app for book detail pages
        res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html'));
    } else {
        readOneBook(req, res);
    }
});
app.get('/api/books/:id', readOneBook);

app.get('/books', readBooks);
app.get('/api/books', readBooks);

// Admin-only routes for books CRUD
app.post('/books', requireAdmin, createBook);
app.post('/api/books', requireAdmin, createBook);

app.put('/books/:id', requireAdmin, updateBook);
app.put('/api/books/:id', requireAdmin, updateBook);

app.delete('/books/:id', requireAdmin, deleteBook);
app.delete('/api/books/:id', requireAdmin, deleteBook);
app.post('/books/:id/update', requireAdmin, upload.single('book_image'), async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return res.status(400).end();
    try {
        if (req.file) {
            const bookImage = req.file.filename;
            const old: any = await executeQuery('SELECT photo FROM books WHERE book_id = ?', [id]);
            if (old.length && old[0].photo) {
                const oldPath = path.join(__dirname, '../FRONTEND/uploads', old[0].photo);
                try { await fs.promises.unlink(oldPath); } catch { }
            }
            await executeQuery('UPDATE books SET photo = ? WHERE book_id = ?', [bookImage, id]);
            return res.json({ photo: bookImage });
        }
        res.status(400).end();
    } catch {
        res.status(500).end();
    }
});
app.post('/api/books/:id/update', requireAdmin, upload.single('book_image'), async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return res.status(400).end();
    try {
        if (req.file) {
            const bookImage = req.file.filename;
            const old: any = await executeQuery('SELECT photo FROM books WHERE book_id = ?', [id]);
            if (old.length && old[0].photo) {
                const oldPath = path.join(__dirname, '../FRONTEND/uploads', old[0].photo);
                try { await fs.promises.unlink(oldPath); } catch { }
            }
            await executeQuery('UPDATE books SET photo = ? WHERE book_id = ?', [bookImage, id]);
            return res.json({ photo: bookImage });
        }
        res.status(400).end();
    } catch {
        res.status(500).end();
    }
});

// Authors routes (both /authors and /api/authors for compatibility)
app.get('/authors/count', countAuthors);
app.get('/api/authors/count', countAuthors);

app.get('/authors/:id', (req: Request, res: Response) => {
    if ((req.headers.accept || '').includes('text/html')) {
        // Serve React app for author detail pages
        res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html'));
    } else {
        readOneAuthor(req, res);
    }
});
app.get('/api/authors/:id', readOneAuthor);

app.get('/authors', readAuthors);
app.get('/api/authors', readAuthors);

// Admin-only routes for authors CRUD
app.post('/authors', requireAdmin, createAuthor);
app.post('/api/authors', requireAdmin, createAuthor);

app.put('/authors/:id', requireAdmin, updateAuthor);
app.put('/api/authors/:id', requireAdmin, updateAuthor);

app.delete('/authors/:id', requireAdmin, deleteAuthor);
app.delete('/api/authors/:id', requireAdmin, deleteAuthor);

app.post('/authors/:id/update', requireAdmin, upload.single('author_image'), updateAuthorImage);
app.post('/api/authors/:id/update', requireAdmin, upload.single('author_image'), updateAuthorImage);

// Rent routes
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
        console.error('Database error in rent:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/rent/:id', rentHandler);
app.post('/api/rent/:id', rentHandler);

// Favorite routes
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
        console.error('Database error in favorite:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/favorite/:id', favoriteHandler);
app.post('/api/favorite/:id', favoriteHandler);

// Users favorite routes
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

// Loans routes
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

// Return routes
const returnHandler = async (req: Request, res: Response) => {
    const loanId = Number(req.params.loanId);
    if (isNaN(loanId)) return res.status(400).end();
    try {
        const result: any = await executeQuery('DELETE FROM loans WHERE loans_id = ?', [loanId]);
        if (!result.affectedRows) return res.status(404).end();
        res.status(200).end();
    } catch {
        res.status(500).end();
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
    } catch {
        res.status(500).end();
    }
};

app.get('/reviews', getReviewsHandler);
app.get('/api/reviews', getReviewsHandler);

const reviewsHandler = async (req: Request, res: Response) => {
    const { book_id, user_id, rating, comment } = req.body;
    if (!book_id || !user_id || !rating) return res.status(400).end();
    try {
        const bookCheck: any = await executeQuery('SELECT book_id FROM books WHERE book_id = ?', [book_id]);
        if (!bookCheck.length) return res.status(404).end();
        const userCheck: any = await executeQuery('SELECT id FROM users WHERE id = ?', [user_id]);
        if (!userCheck.length) return res.status(404).end();
        await executeQuery('INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [book_id, user_id, rating, comment || '']);
        res.status(201).end();
    } catch {
        res.status(500).end();
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

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../FRONTEND/react-dist/index.html'));
    } else {
        console.log(`404 - API endpoint not found: ${req.path}`);
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`React app available at: http://localhost:${PORT}`);
    console.log(`Legacy interface available at: http://localhost:${PORT}/legacy`);
});
