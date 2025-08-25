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
const Authors = () => {
    const [authors, setAuthors] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(0);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const [newAuthor, setNewAuthor] = (0, react_1.useState)({ name: '' });
    const [editingAuthor, setEditingAuthor] = (0, react_1.useState)(null);
    const [editData, setEditData] = (0, react_1.useState)({ name: '' });
    const [error, setError] = (0, react_1.useState)('');
    const limit = 5;
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        fetchAuthors();
    }, [currentPage]);
    const fetchAuthors = async () => {
        try {
            const offset = currentPage * limit;
            const [authorsRes, countRes] = await Promise.all([
                axios_1.default.get(`/api/authors?limit=${limit}&offset=${offset}`),
                axios_1.default.get('/api/authors/count')
            ]);
            setAuthors(authorsRes.data);
            setTotalPages(Math.ceil(countRes.data.total / limit));
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch authors');
            setLoading(false);
        }
    };
    const handleCreateAuthor = async (e) => {
        e.preventDefault();
        if (!newAuthor.name.trim())
            return;
        try {
            await axios_1.default.post('/api/authors', {
                name_author: newAuthor.name.trim()
            });
            setNewAuthor({ name: '' });
            fetchAuthors();
        }
        catch (err) {
            setError('Failed to create author');
        }
    };
    const handleEditAuthor = (author) => {
        setEditingAuthor(author.author_id);
        setEditData({ name: author.name_author });
    };
    const handleSaveEdit = async () => {
        if (!editData.name.trim() || !editingAuthor)
            return;
        try {
            await axios_1.default.put(`/api/authors/${editingAuthor}`, {
                name_author: editData.name.trim()
            });
            setEditingAuthor(null);
            fetchAuthors();
        }
        catch (err) {
            setError('Failed to update author');
        }
    };
    const handleCancelEdit = () => {
        setEditingAuthor(null);
        setEditData({ name: '' });
    };
    const handleDeleteAuthor = async (authorId) => {
        if (!confirm('Are you sure you want to delete this author?'))
            return;
        try {
            await axios_1.default.delete(`/api/authors/${authorId}`);
            fetchAuthors();
        }
        catch (err) {
            setError('Failed to delete author');
        }
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    if (loading) {
        return (<Layout_1.default title="Authors">
        <div className="loading">Loading authors...</div>
      </Layout_1.default>);
    }
    return (<Layout_1.default title="Authors">
      {error && <div className="error-message">{error}</div>}
      
      <section className="form-section">
        <h2>Add Author</h2>
        <form onSubmit={handleCreateAuthor}>
          <label htmlFor="author-name">Name:</label>
          <input type="text" id="author-name" value={newAuthor.name} onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })} required/>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="author-list">
        <h2>Authors</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map(author => (<tr key={author.author_id}>
                <td>{author.author_id}</td>
                <td>
                  {editingAuthor === author.author_id ? (<input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}/>) : (author.name_author)}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingAuthor === author.author_id ? (<>
                        <button onClick={handleSaveEdit}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </>) : (<>
                        <button onClick={() => navigate(`/authors/${author.author_id}`)}>View</button>
                        <button onClick={() => handleEditAuthor(author)}>Edit</button>
                        <button onClick={() => handleDeleteAuthor(author.author_id)}>Delete</button>
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
      </section>
    </Layout_1.default>);
};
exports.default = Authors;
