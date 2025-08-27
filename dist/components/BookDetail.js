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
    const [isLoggedIn, setIsLoggedIn] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchBook();
            fetchReviews();
            checkAuthStatus();
        }
    }, [id]);
    const checkAuthStatus = async () => {
        try {
            await axios_1.default.get('/api/user/me');
            setIsLoggedIn(true);
        }
        catch {
            setIsLoggedIn(false);
        }
    };
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
        try {
            await axios_1.default.post(`/api/rent/${id}`);
            alert('Book rented successfully!');
            setError('');
        }
        catch (err) {
            console.error('Rent error:', err);
            const errorMsg = err.response?.data?.error || 'Failed to rent book. You may not be logged in or book is already rented.';
            setError(errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    const handleFavoriteBook = async () => {
        try {
            await axios_1.default.post(`/api/favorite/${id}`);
            alert('Book added to favorites!');
            setError('');
        }
        catch (err) {
            console.error('Favorite error:', err);
            const errorMsg = err.response?.data?.error || 'Failed to add book to favorites';
            setError(errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            // Get user info from session
            const userResponse = await axios_1.default.get('/api/user/me');
            const userId = userResponse.data.id;
            await axios_1.default.post('/api/reviews', {
                book_id: Number(id),
                user_id: userId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
            alert('Review submitted successfully!');
            setError('');
        }
        catch (err) {
            console.error('Review error:', err);
            const errorMsg = err.response?.data?.error || 'Failed to submit review. Please make sure you are logged in.';
            setError(errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Book Details", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading book details..." }) }));
    }
    if (!book) {
        return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Book Details", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-message", children: "Book not found" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), children: "Back to Books" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Book: ${book.title}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), style: { marginBottom: '20px' }, children: "\u2190 Back to Books" }), (0, jsx_runtime_1.jsx)("h2", { children: book.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Author:" }), " ", book.author_name || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Description:" }), " ", book.description || 'No description available'] }), book.photo && ((0, jsx_runtime_1.jsx)("img", { src: `/api/uploads/${book.photo}`, alt: book.title, className: "book-image", style: { width: '200px', height: '250px', objectFit: 'cover' } })), (0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Book Image" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleImageUpload, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => setImageFile(e.target.files?.[0] || null) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Upload Image' })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Book Actions" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleRentBook, children: "Rent Book" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleFavoriteBook, children: "Add to Favorites" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Write a Review" }), !isLoggedIn ? ((0, jsx_runtime_1.jsx)("p", { children: "Please log in to write a review." })) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmitReview, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "rating", children: "Rating:" }), (0, jsx_runtime_1.jsx)("select", { id: "rating", value: newReview.rating, onChange: (e) => setNewReview({ ...newReview, rating: Number(e.target.value) }), children: [1, 2, 3, 4, 5].map(num => ((0, jsx_runtime_1.jsxs)("option", { value: num, children: [num, " Star", num > 1 ? 's' : ''] }, num))) }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "comment", children: "Comment:" }), (0, jsx_runtime_1.jsx)("textarea", { id: "comment", value: newReview.comment, onChange: (e) => setNewReview({ ...newReview, comment: e.target.value }), rows: 4, style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' } }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Submit Review" })] }))] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Reviews" }), reviews.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "No reviews yet." })) : ((0, jsx_runtime_1.jsx)("div", { children: reviews.map(review => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                border: '1px solid #ddd',
                                padding: '15px',
                                marginBottom: '10px',
                                borderRadius: '4px'
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: review.username }), (0, jsx_runtime_1.jsxs)("span", { children: ['★'.repeat(review.rating), '☆'.repeat(5 - review.rating)] })] }), (0, jsx_runtime_1.jsx)("p", { children: review.comment }), (0, jsx_runtime_1.jsx)("small", { style: { color: '#666' }, children: new Date(review.review_date).toLocaleDateString() })] }, review.review_id))) }))] })] }));
};
exports.default = BookDetail;
