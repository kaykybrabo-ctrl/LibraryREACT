"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const Layout_1 = __importDefault(require("./Layout"));
const AuthContext_1 = require("../contexts/AuthContext");
const UserProfile = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [loans, setLoans] = (0, react_1.useState)([]);
    const [favoriteBook, setFavoriteBook] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [activeTab, setActiveTab] = (0, react_1.useState)('profile');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [description, setDescription] = (0, react_1.useState)('');
    const [editingDescription, setEditingDescription] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchProfile();
        fetchLoans();
        fetchFavoriteBook();
    }, []);
    const fetchProfile = async () => {
        try {
            const response = await axios_1.default.get(`/api/get-profile?username=${user?.username}`);
            setProfile(response.data);
            setDescription(response.data.description || '');
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch profile');
            setLoading(false);
        }
    };
    const fetchLoans = async () => {
        if (!user?.username)
            return;
        try {
            const response = await axios_1.default.get(`/api/loans?username=${user.username}`);
            setLoans(response.data);
        }
        catch (err) {
            console.error('Failed to fetch loans');
        }
    };
    const fetchFavoriteBook = async () => {
        if (!user?.username)
            return;
        try {
            const response = await axios_1.default.get(`/api/users/favorite?username=${user.username}`);
            if (response.data) {
                setFavoriteBook(response.data);
            }
            else {
                setFavoriteBook(null);
            }
        }
        catch (err) {
            console.error('Failed to fetch favorite book');
            setFavoriteBook(null);
        }
    };
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('profile_image', imageFile);
        if (user?.username) {
            formData.append('username', user.username);
        }
        try {
            const response = await axios_1.default.post('/api/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(response.data);
            setImageFile(null);
            setError('');
            alert('Profile image updated successfully!');
        }
        catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || 'Failed to upload profile image');
        }
        finally {
            setUploading(false);
        }
    };
    const handleUpdateDescription = async () => {
        setUploading(true);
        const formData = new FormData();
        formData.append('description', description);
        if (user?.username) {
            formData.append('username', user.username);
        }
        try {
            const response = await axios_1.default.post('/api/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(response.data);
            setEditingDescription(false);
            setError('');
            alert('Description updated successfully!');
        }
        catch (err) {
            console.error('Description update error:', err);
            setError(err.response?.data?.error || 'Failed to update description');
        }
        finally {
            setUploading(false);
        }
    };
    const handleReturnBook = async (loanId) => {
        if (!confirm('Are you sure you want to return this book?'))
            return;
        try {
            await axios_1.default.post(`/api/return/${loanId}`);
            fetchLoans();
            alert('Book returned successfully!');
        }
        catch (err) {
            setError('Failed to return book');
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "User Profile", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading profile..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "User Profile", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'profile' ? 'active' : ''}`, onClick: () => setActiveTab('profile'), children: "Profile" }), (0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'loans' ? 'active' : ''}`, onClick: () => setActiveTab('loans'), children: "My Loans" }), (0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'favorite' ? 'active' : ''}`, onClick: () => setActiveTab('favorite'), children: "Favorite Book" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "tab-content", children: [activeTab === 'profile' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Profile Information" }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Username:" }), " ", user?.username || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Role:" }), " ", user?.role || 'User'] }), profile?.profile_image && ((0, jsx_runtime_1.jsx)("img", { src: `/api/uploads/${profile.profile_image}`, alt: "Profile", className: "profile-image" })), (0, jsx_runtime_1.jsxs)("div", { className: "description-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Description" }), editingDescription ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Tell us about yourself...", rows: 4, style: { width: '100%', marginBottom: '10px' } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateDescription, disabled: uploading, children: uploading ? 'Saving...' : 'Save Description' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setEditingDescription(false);
                                                            setDescription(profile?.description || '');
                                                        }, style: { marginLeft: '10px' }, children: "Cancel" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: profile?.description || 'No description added yet.' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingDescription(true), children: "Edit Description" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Profile Image" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleImageUpload, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => setImageFile(e.target.files?.[0] || null) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Upload Image' })] })] })] })), activeTab === 'loans' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "My Borrowed Books" }), loans.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "You haven't borrowed any books yet." })) : ((0, jsx_runtime_1.jsx)("div", { children: loans.map(loan => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        border: '1px solid #ddd',
                                        padding: '15px',
                                        marginBottom: '15px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { children: loan.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Loan Date:" }), " ", new Date(loan.loan_date).toLocaleDateString()] }), loan.description && (0, jsx_runtime_1.jsx)("p", { children: loan.description })] }), (0, jsx_runtime_1.jsxs)("div", { children: [loan.photo && ((0, jsx_runtime_1.jsx)("img", { src: `/api/uploads/${loan.photo}`, alt: loan.title, className: "book-image", style: { marginRight: '15px' } })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleReturnBook(loan.loans_id), children: "Return Book" })] })] }, loan.loans_id))) }))] })), activeTab === 'favorite' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "My Favorite Book" }), !favoriteBook ? ((0, jsx_runtime_1.jsx)("p", { children: "You haven't set a favorite book yet." })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    border: '1px solid #ddd',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px'
                                }, children: [favoriteBook.photo && ((0, jsx_runtime_1.jsx)("img", { src: `/api/uploads/${favoriteBook.photo}`, alt: favoriteBook.title, style: { width: '120px', height: '160px', objectFit: 'cover' } })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { children: favoriteBook.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Author:" }), " ", favoriteBook.author_name || 'Unknown'] }), favoriteBook.description && ((0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Description:" }), " ", favoriteBook.description] }))] })] }))] }))] })] }));
};
exports.default = UserProfile;
