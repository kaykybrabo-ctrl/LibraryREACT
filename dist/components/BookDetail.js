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
const BookDetail = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [book, setBook] = (0, react_1.useState)(null);
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [newReview, setNewReview] = (0, react_1.useState)({ rating: 5, comment: '' });
    const [username, setUsername] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchBook();
            fetchReviews();
        }
    }, [id]);
    const fetchBook = async () => {
        try {
            const response = await axios_1.default.get(`/api/books/${id}`);
            setBook(response.data);
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch book details');
            setLoading(false);
        }
    };
    const fetchReviews = async () => {
        try {
            const response = await axios_1.default.get('/api/reviews');
            const bookReviews = response.data.filter((review) => review.book_id === Number(id));
            setReviews(bookReviews);
        }
        catch (err) {
            console.error('Failed to fetch reviews');
        }
    };
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile || !id)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('book_image', imageFile);
        try {
            await axios_1.default.post(`/api/books/${id}/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchBook();
            setImageFile(null);
        }
        catch (err) {
            setError('Failed to upload image');
        }
        finally {
            setUploading(false);
        }
    };
    const handleRentBook = async () => {
        if (!username.trim()) {
            setError('Please enter a username to rent this book');
            return;
        }
        try {
            await axios_1.default.post(`/api/rent/${id}`, { username: username.trim() });
            alert('Book rented successfully!');
            setUsername('');
        }
        catch (err) {
            setError('Failed to rent book. User may not exist or book is already rented.');
        }
    };
    const handleFavoriteBook = async () => {
        if (!username.trim()) {
            setError('Please enter a username to favorite this book');
            return;
        }
        try {
            await axios_1.default.post(`/api/favorite/${id}`, { username: username.trim() });
            alert('Book added to favorites!');
            setUsername('');
        }
        catch (err) {
            setError('Failed to add book to favorites');
        }
    };
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('Please enter a username to submit a review');
            return;
        }
        try {
            // Get user ID from username (simplified - in production you'd get this from auth)
            const userResponse = await axios_1.default.get(`/api/get-user-id-from-session`);
            const userId = userResponse.data.user_id;
            await axios_1.default.post('/api/reviews', {
                book_id: Number(id),
                user_id: userId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
            alert('Review submitted successfully!');
        }
        catch (err) {
            setError('Failed to submit review');
        }
    };
    if (loading) {
        return (<Layout_1.default title="Book Details">
        <div className="loading">Loading book details...</div>
      </Layout_1.default>);
    }
    if (!book) {
        return (<Layout_1.default title="Book Details">
        <div className="error-message">Book not found</div>
        <button onClick={() => navigate('/books')}>Back to Books</button>
      </Layout_1.default>);
    }
    return (<Layout_1.default title={`Book: ${book.title}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/books')} style={{ marginBottom: '20px' }}>
          ← Back to Books
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author_name || 'Unknown'}</p>
        <p><strong>Description:</strong> {book.description || 'No description available'}</p>
        
        {book.photo && (<img src={`/api/uploads/${book.photo}`} alt={book.title} className="book-image" style={{ width: '200px', height: '250px', objectFit: 'cover' }}/>)}

        <div className="image-upload">
          <h3>Update Book Image</h3>
          <form onSubmit={handleImageUpload}>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}/>
            <button type="submit" disabled={!imageFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>
      </section>

      <section className="form-section">
        <h3>Book Actions</h3>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username for actions"/>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRentBook}>Rent Book</button>
          <button onClick={handleFavoriteBook}>Add to Favorites</button>
        </div>
      </section>

      <section className="form-section">
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmitReview}>
          <label htmlFor="rating">Rating:</label>
          <select id="rating" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map(num => (<option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>))}
          </select>

          <label htmlFor="comment">Comment:</label>
          <textarea id="comment" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}/>

          <button type="submit">Submit Review</button>
        </form>
      </section>

      <section className="form-section">
        <h3>Reviews</h3>
        {reviews.length === 0 ? (<p>No reviews yet.</p>) : (<div>
            {reviews.map(review => (<div key={review.review_id} style={{
                    border: '1px solid #ddd',
                    padding: '15px',
                    marginBottom: '10px',
                    borderRadius: '4px'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{review.username}</strong>
                  <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <small style={{ color: '#666' }}>
                  {new Date(review.review_date).toLocaleDateString()}
                </small>
              </div>))}
          </div>)}
      </section>
    </Layout_1.default>);
};
exports.default = BookDetail;
