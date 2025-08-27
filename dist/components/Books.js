"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const Layout_1 = __importDefault(require("./Layout"));
const AuthContext_1 = require("../contexts/AuthContext");
const Books = () => {
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    const [books, setBooks] = (0, react_1.useState)([]);
    const [authors, setAuthors] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(0);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [newBook, setNewBook] = (0, react_1.useState)({ title: '', author_id: '' });
    const [editingBook, setEditingBook] = (0, react_1.useState)(null);
    const [editData, setEditData] = (0, react_1.useState)({ title: '', author_id: '' });
    const [error, setError] = (0, react_1.useState)('');
    const limit = 5;
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        fetchAuthors();
        fetchBooks();
    }, [currentPage, searchQuery]);
    const fetchBooks = async () => {
        try {
            const offset = currentPage * limit;
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const [booksRes, countRes] = await Promise.all([
                axios_1.default.get(`/api/books?limit=${limit}&offset=${offset}${searchParam}`),
                axios_1.default.get(`/api/books/count${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`)
            ]);
            setBooks(booksRes.data);
            setTotalPages(Math.ceil(countRes.data.total / limit));
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch books');
            setLoading(false);
        }
    };
    const fetchAuthors = async () => {
        try {
            const response = await axios_1.default.get('/api/authors?limit=9999&offset=0');
            setAuthors(response.data);
        }
        catch (err) {
            setError('Failed to fetch authors');
        }
    };
    const getAuthorName = (authorId) => {
        const author = authors.find(a => a.author_id === authorId);
        return author ? author.name_author : '';
    };
    const handleCreateBook = async (e) => {
        e.preventDefault();
        if (!newBook.title.trim() || !newBook.author_id)
            return;
        try {
            await axios_1.default.post('/api/books', {
                title: newBook.title.trim(),
                author_id: Number(newBook.author_id)
            });
            setNewBook({ title: '', author_id: '' });
            fetchBooks();
        }
        catch (err) {
            setError('Failed to create book');
        }
    };
    const handleEditBook = (book) => {
        setEditingBook(book.book_id);
        setEditData({ title: book.title, author_id: book.author_id.toString() });
    };
    const handleSaveEdit = async () => {
        if (!editData.title.trim() || !editData.author_id || !editingBook)
            return;
        try {
            await axios_1.default.put(`/api/books/${editingBook}`, {
                title: editData.title.trim(),
                author_id: Number(editData.author_id)
            });
            setEditingBook(null);
            fetchBooks();
        }
        catch (err) {
            setError('Failed to update book');
        }
    };
    const handleCancelEdit = () => {
        setEditingBook(null);
        setEditData({ title: '', author_id: '' });
    };
    const handleDeleteBook = async (bookId) => {
        if (!confirm('Are you sure you want to delete this book?'))
            return;
        try {
            await axios_1.default.delete(`/api/books/${bookId}`);
            fetchBooks();
        }
        catch (err) {
            setError('Failed to delete book');
        }
    };
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchBooks();
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Books", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading books..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Books", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), isAdmin && ((0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Add Book" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateBook, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "author-select", children: "Author:" }), (0, jsx_runtime_1.jsxs)("select", { id: "author-select", value: newBook.author_id, onChange: (e) => setNewBook({ ...newBook, author_id: e.target.value }), required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select an Author" }), authors.map(author => ((0, jsx_runtime_1.jsx)("option", { value: author.author_id, children: author.name_author }, author.author_id)))] }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "book-title", children: "Title:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "book-title", value: newBook.title, onChange: (e) => setNewBook({ ...newBook, title: e.target.value }), required: true }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Add" })] })] })), (0, jsx_runtime_1.jsxs)("section", { className: "search-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Search Books" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSearch, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by title" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Search" })] })] }), books.length === 0 && searchQuery ? ((0, jsx_runtime_1.jsx)("div", { className: "no-results", children: "No results found for your search." })) : ((0, jsx_runtime_1.jsxs)("section", { className: "book-list", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Books" }), (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "ID" }), (0, jsx_runtime_1.jsx)("th", { children: "Author ID" }), (0, jsx_runtime_1.jsx)("th", { children: "Name" }), (0, jsx_runtime_1.jsx)("th", { children: "Title" }), (0, jsx_runtime_1.jsx)("th", { children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: books.map(book => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: book.book_id }), (0, jsx_runtime_1.jsx)("td", { children: book.author_id }), (0, jsx_runtime_1.jsx)("td", { children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsx)("select", { value: editData.author_id, onChange: (e) => setEditData({ ...editData, author_id: e.target.value }), children: authors.map(author => ((0, jsx_runtime_1.jsx)("option", { value: author.author_id, children: author.name_author }, author.author_id))) })) : (getAuthorName(book.author_id)) }), (0, jsx_runtime_1.jsx)("td", { children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: editData.title, onChange: (e) => setEditData({ ...editData, title: e.target.value }) })) : (book.title) }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("div", { className: "action-buttons", children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleSaveEdit, children: "Save" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCancelEdit, children: "Cancel" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate(`/books/${book.book_id}`), children: "View" }), isAdmin && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleEditBook(book), children: "Edit" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteBook(book.book_id), children: "Delete" })] }))] })) }) })] }, book.book_id))) })] }), totalPages > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "pagination", children: Array.from({ length: totalPages }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handlePageChange(i), className: currentPage === i ? 'active' : '', children: i + 1 }, i))) }))] }))] }));
};
exports.default = Books;
