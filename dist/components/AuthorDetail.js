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
const AuthorDetail = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [author, setAuthor] = (0, react_1.useState)(null);
    const [books, setBooks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchAuthor();
            fetchAuthorBooks();
        }
    }, [id]);
    const fetchAuthor = async () => {
        try {
            const response = await axios_1.default.get(`/api/authors/${id}`);
            setAuthor(response.data);
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch author details');
            setLoading(false);
        }
    };
    const fetchAuthorBooks = async () => {
        try {
            const response = await axios_1.default.get('/api/books?limit=9999&offset=0');
            const authorBooks = response.data.filter((book) => book.author_id === Number(id));
            setBooks(authorBooks);
        }
        catch (err) {
            console.error('Failed to fetch author books');
        }
    };
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile || !id)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('author_image', imageFile);
        try {
            await axios_1.default.post(`/api/authors/${id}/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAuthor();
            setImageFile(null);
        }
        catch (err) {
            setError('Failed to upload image');
        }
        finally {
            setUploading(false);
        }
    };
    if (loading) {
        return (<Layout_1.default title="Author Details">
        <div className="loading">Loading author details...</div>
      </Layout_1.default>);
    }
    if (!author) {
        return (<Layout_1.default title="Author Details">
        <div className="error-message">Author not found</div>
        <button onClick={() => navigate('/authors')}>Back to Authors</button>
      </Layout_1.default>);
    }
    return (<Layout_1.default title={`Author: ${author.name_author}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/authors')} style={{ marginBottom: '20px' }}>
          ← Back to Authors
        </button>
        
        <h2>{author.name_author}</h2>
        
        {author.photo && (<img src={`/api/uploads/${author.photo}`} alt={author.name_author} className="author-image" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}/>)}

        <div className="image-upload">
          <h3>Update Author Image</h3>
          <form onSubmit={handleImageUpload}>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}/>
            <button type="submit" disabled={!imageFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>
      </section>

      <section className="book-list">
        <h3>Books by {author.name_author}</h3>
        {books.length === 0 ? (<p>No books found for this author.</p>) : (<table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (<tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>
                    <button onClick={() => navigate(`/books/${book.book_id}`)}>
                      View Book
                    </button>
                  </td>
                </tr>))}
            </tbody>
          </table>)}
      </section>
    </Layout_1.default>);
};
exports.default = AuthorDetail;
