"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./DB/connection");
const read_1 = require("./books/read");
const create_1 = require("./books/create");
const update_1 = require("./books/update");
const deleteb_1 = require("./books/deleteb");
const count_1 = require("./books/count");
const read_2 = require("./authors/read");
const create_2 = require("./authors/create");
const update_2 = require("./authors/update");
const deletea_1 = require("./authors/deletea");
const count_2 = require("./authors/count");
const updateProfile_1 = require("./interface/updateProfile");
const getProfile_1 = require("./interface/getProfile");
const readOne_1 = require("./interface/booksInterface/readOne");
const readOneAuthor_1 = require("./interface/authorInterface/readOneAuthor");
const updateAuthorImage_1 = require("./interface/authorInterface/updateAuthorImage");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
const storage = multer_1.default.diskStorage({
    destination: path_1.default.join(__dirname, '../FRONTEND/uploads'),
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: 'http://localhost:8080', credentials: true }));
app.use((0, express_session_1.default)({ secret: 'your-secret-key', resave: false, saveUninitialized: false, cookie: { secure: false } }));
// Serve React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../FRONTEND/react-dist')));
// Legacy static files for backward compatibility
app.use('/dist', express_1.default.static(path_1.default.join(__dirname, '../FRONTEND/dist')));
app.use('/interface/assets', express_1.default.static(path_1.default.join(__dirname, '../FRONTEND/dist/interface/assets')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../FRONTEND/uploads')));
app.use('/interface', express_1.default.static(path_1.default.join(__dirname, '../FRONTEND/interface'), { index: false }));
app.use('/legacy', express_1.default.static(path_1.default.join(__dirname, '../FRONTEND'), { index: false }));
app.post('/login', async (req, res) => {
    let { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string')
        return res.status(400).end();
    username = username.trim().toLowerCase();
    try {
        const results = await (0, connection_1.executeQuery)('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (!results.length)
            return res.status(401).end();
        const user = results[0];
        if (password !== user.password)
            return res.status(401).end();
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.json({ role: user.role, username: user.username, id: user.id });
    }
    catch {
        res.status(500).end();
    }
});
app.post('/register', async (req, res) => {
    let { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string')
        return res.status(400).end();
    username = username.trim().toLowerCase();
    try {
        const exists = await (0, connection_1.executeQuery)('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (exists.length)
            return res.status(409).end();
        await (0, connection_1.executeQuery)('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'user']);
        res.status(201).end();
    }
    catch {
        res.status(500).end();
    }
});
app.post('/update-profile', upload.single('profile_image'), updateProfile_1.updateProfile);
app.get('/get-profile', getProfile_1.getProfile);
// Serve React app for all routes (SPA)
app.get('/', (_req, res) => res.sendFile(path_1.default.join(__dirname, '../FRONTEND/react-dist/index.html')));
// Legacy routes for backward compatibility
app.get('/legacy', (_req, res) => res.sendFile(path_1.default.join(__dirname, '../FRONTEND/interface/main.html')));
app.get('/legacy/index.html', (_req, res) => res.sendFile(path_1.default.join(__dirname, '../FRONTEND/index.html')));
app.get('/legacy/user.html', (_req, res) => res.sendFile(path_1.default.join(__dirname, '../FRONTEND/interface/user.html')));
app.get('/books/count', count_1.count);
app.get('/books/:id', (req, res) => {
    if ((req.headers.accept || '').includes('text/html')) {
        // Serve React app for book detail pages
        res.sendFile(path_1.default.join(__dirname, '../FRONTEND/react-dist/index.html'));
    }
    else {
        (0, readOne_1.readOneBook)(req, res);
    }
});
app.get('/books', read_1.read);
app.post('/books', create_1.create);
app.put('/books/:id', update_1.update);
app.delete('/books/:id', deleteb_1.deleteb);
app.post('/books/:id/update', upload.single('book_image'), async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
        return res.status(400).end();
    try {
        if (req.file) {
            const bookImage = req.file.filename;
            const old = await (0, connection_1.executeQuery)('SELECT photo FROM books WHERE book_id = ?', [id]);
            if (old.length && old[0].photo) {
                const oldPath = path_1.default.join(__dirname, '../FRONTEND/uploads', old[0].photo);
                try {
                    await fs_1.default.promises.unlink(oldPath);
                }
                catch { }
            }
            await (0, connection_1.executeQuery)('UPDATE books SET photo = ? WHERE book_id = ?', [bookImage, id]);
            return res.json({ photo: bookImage });
        }
        res.status(400).end();
    }
    catch {
        res.status(500).end();
    }
});
app.get('/authors/count', count_2.count);
app.get('/authors/:id', (req, res) => {
    if ((req.headers.accept || '').includes('text/html')) {
        // Serve React app for author detail pages
        res.sendFile(path_1.default.join(__dirname, '../FRONTEND/react-dist/index.html'));
    }
    else {
        (0, readOneAuthor_1.readOneAuthor)(req, res);
    }
});
app.post('/authors/:id/update', upload.single('author_image'), updateAuthorImage_1.updateAuthorImage);
app.get('/authors', read_2.read);
app.post('/authors', create_2.create);
app.put('/authors/:id', update_2.update);
app.delete('/authors/:id', deletea_1.deletea);
app.post('/rent/:id', async (req, res) => {
    const bookId = Number(req.params.id);
    if (isNaN(bookId))
        return res.status(400).end();
    const username = req.body.username;
    if (!username)
        return res.status(400).end();
    try {
        const userResult = await (0, connection_1.executeQuery)('SELECT id FROM users WHERE username = ?', [username]);
        if (!userResult.length)
            return res.status(404).end();
        const userId = userResult[0].id;
        const alreadyLoaned = await (0, connection_1.executeQuery)('SELECT * FROM loans WHERE user_id = ? AND book_id = ?', [userId, bookId]);
        if (alreadyLoaned.length)
            return res.status(409).end();
        await (0, connection_1.executeQuery)('INSERT INTO loans (user_id, book_id, loan_date) VALUES (?, ?, NOW())', [userId, bookId]);
        res.status(201).end();
    }
    catch {
        res.status(500).end();
    }
});
app.post('/favorite/:id', async (req, res) => {
    const bookId = Number(req.params.id);
    if (isNaN(bookId))
        return res.status(400).end();
    const username = req.body.username;
    if (!username)
        return res.status(400).end();
    try {
        const userResult = await (0, connection_1.executeQuery)('SELECT id FROM users WHERE username = ?', [username]);
        if (!userResult.length)
            return res.status(404).end();
        await (0, connection_1.executeQuery)('UPDATE users SET favorite_book_id = ? WHERE username = ?', [bookId, username]);
        res.status(200).end();
    }
    catch {
        res.status(500).end();
    }
});
app.get('/users/favorite', async (req, res) => {
    const username = req.query.username;
    if (!username)
        return res.status(400).end();
    try {
        const results = await (0, connection_1.executeQuery)(`
            SELECT b.book_id, b.title, b.description, b.photo, a.name_author AS author_name
            FROM users u
            LEFT JOIN books b ON u.favorite_book_id = b.book_id
            LEFT JOIN authors a ON b.author_id = a.author_id
            WHERE u.username = ?
            LIMIT 1
        `, [username]);
        if (!results.length || !results[0].book_id)
            return res.status(404).end();
        res.json(results[0]);
    }
    catch {
        res.status(500).end();
    }
});
app.get('/loans', async (req, res) => {
    const username = req.query.username;
    if (!username)
        return res.status(400).end();
    try {
        const userResult = await (0, connection_1.executeQuery)('SELECT id FROM users WHERE username = ?', [username]);
        if (!userResult.length)
            return res.status(404).end();
        const loans = await (0, connection_1.executeQuery)(`
            SELECT l.loans_id, l.loan_date,
                   b.book_id, b.title, b.photo, b.description
            FROM loans l
            JOIN books b ON l.book_id = b.book_id
            WHERE l.user_id = ?
            ORDER BY l.loan_date DESC
        `, [userResult[0].id]);
        res.json(loans);
    }
    catch {
        res.status(500).end();
    }
});
app.post('/return/:loanId', async (req, res) => {
    const loanId = Number(req.params.loanId);
    if (isNaN(loanId))
        return res.status(400).end();
    try {
        const result = await (0, connection_1.executeQuery)('DELETE FROM loans WHERE loans_id = ?', [loanId]);
        if (!result.affectedRows)
            return res.status(404).end();
        res.status(200).end();
    }
    catch {
        res.status(500).end();
    }
});
app.get('/reviews', async (_req, res) => {
    try {
        const reviews = await (0, connection_1.executeQuery)(`
            SELECT r.*, u.username, b.title as bookTitle 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.book_id
            ORDER BY r.review_date DESC
        `);
        res.json(reviews);
    }
    catch {
        res.status(500).end();
    }
});
app.post('/reviews', async (req, res) => {
    const { book_id, user_id, rating, comment } = req.body;
    if (!book_id || !user_id || !rating)
        return res.status(400).end();
    try {
        const bookCheck = await (0, connection_1.executeQuery)('SELECT book_id FROM books WHERE book_id = ?', [book_id]);
        if (!bookCheck.length)
            return res.status(404).end();
        const userCheck = await (0, connection_1.executeQuery)('SELECT id FROM users WHERE id = ?', [user_id]);
        if (!userCheck.length)
            return res.status(404).end();
        await (0, connection_1.executeQuery)('INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [book_id, user_id, rating, comment || '']);
        res.status(201).end();
    }
    catch {
        res.status(500).end();
    }
});
app.get('/get-user-id-from-session', (req, res) => {
    if (req.session?.user?.id) {
        res.json({ user_id: req.session.user.id });
    }
    else {
        res.status(401).end();
    }
});
// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path_1.default.join(__dirname, '../FRONTEND/react-dist/index.html'));
    }
    else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`React app available at: http://localhost:${PORT}`);
    console.log(`Legacy interface available at: http://localhost:${PORT}/legacy`);
});
