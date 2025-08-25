"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const Layout_1 = __importDefault(require("./Layout"));
const Books = () => {
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
        return (<Layout_1.default title="Books">
        <div className="loading">Loading books...</div>
      </Layout_1.default>);
    }
    return (<Layout_1.default title="Books">
      {error && <div className="error-message">{error}</div>}
      
      <section className="form-section">
        <h2>Add Book</h2>
        <form onSubmit={handleCreateBook}>
          <label htmlFor="author-select">Author:</label>
          <select id="author-select" value={newBook.author_id} onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })} required>
            <option value="">Select an Author</option>
            {authors.map(author => (<option key={author.author_id} value={author.author_id}>
                {author.name_author}
              </option>))}
          </select>
          
          <label htmlFor="book-title">Title:</label>
          <input type="text" id="book-title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} required/>
          
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="search-section">
        <h2>Search Books</h2>
        <form onSubmit={handleSearch}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title"/>
          <button type="submit">Search</button>
        </form>
      </section>

      {books.length === 0 && searchQuery ? (<div className="no-results">No results found for your search.</div>) : (<section className="book-list">
          <h2>Books</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Author ID</th>
                <th>Name</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (<tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.author_id}</td>
                  <td>
                    {editingBook === book.book_id ? (<select value={editData.author_id} onChange={(e) => setEditData({ ...editData, author_id: e.target.value })}>
                        {authors.map(author => (<option key={author.author_id} value={author.author_id}>
                            {author.name_author}
                          </option>))}
                      </select>) : (getAuthorName(book.author_id))}
                  </td>
                  <td>
                    {editingBook === book.book_id ? (<input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })}/>) : (book.title)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingBook === book.book_id ? (<>
                          <button onClick={handleSaveEdit}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </>) : (<>
                          <button onClick={() => navigate(`/books/${book.book_id}`)}>View</button>
                          <button onClick={() => handleEditBook(book)}>Edit</button>
                          <button onClick={() => handleDeleteBook(book.book_id)}>Delete</button>
                        </>)}
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>

          {totalPages > 1 && (<div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (<button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''}>
                  {i + 1}
                </button>))}
            </div>)}
        </section>)}
    </Layout_1.default>);
};
exports.default = Books;
