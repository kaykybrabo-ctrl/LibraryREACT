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
    (0, react_1.useEffect)(() => {
        fetchProfile();
        fetchLoans();
        fetchFavoriteBook();
    }, []);
    const fetchProfile = async () => {
        try {
            const response = await axios_1.default.get('/api/get-profile');
            setProfile(response.data);
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
            setFavoriteBook(response.data);
        }
        catch (err) {
            console.error('Failed to fetch favorite book');
        }
    };
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('profile_image', imageFile);
        try {
            await axios_1.default.post('/api/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchProfile();
            setImageFile(null);
        }
        catch (err) {
            setError('Failed to upload profile image');
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
        return (<Layout_1.default title="User Profile">
        <div className="loading">Loading profile...</div>
      </Layout_1.default>);
    }
    return (<Layout_1.default title="User Profile">
      {error && <div className="error-message">{error}</div>}
      
      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>
          My Loans
        </button>
        <button className={`tab ${activeTab === 'favorite' ? 'active' : ''}`} onClick={() => setActiveTab('favorite')}>
          Favorite Book
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (<section className="profile-section">
            <h2>Profile Information</h2>
            <p><strong>Username:</strong> {user?.username || 'Unknown'}</p>
            <p><strong>Role:</strong> {user?.role || 'User'}</p>
            
            {profile?.profile_image && (<img src={`/api/uploads/${profile.profile_image}`} alt="Profile" className="profile-image"/>)}

            <div className="image-upload">
              <h3>Update Profile Image</h3>
              <form onSubmit={handleImageUpload}>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}/>
                <button type="submit" disabled={!imageFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </form>
            </div>
          </section>)}

        {activeTab === 'loans' && (<section className="profile-section">
            <h2>My Borrowed Books</h2>
            {loans.length === 0 ? (<p>You haven't borrowed any books yet.</p>) : (<div>
                {loans.map(loan => (<div key={loan.loans_id} style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    <div>
                      <h4>{loan.title}</h4>
                      <p><strong>Loan Date:</strong> {new Date(loan.loan_date).toLocaleDateString()}</p>
                      {loan.description && <p>{loan.description}</p>}
                    </div>
                    <div>
                      {loan.photo && (<img src={`/api/uploads/${loan.photo}`} alt={loan.title} className="book-image" style={{ marginRight: '15px' }}/>)}
                      <button onClick={() => handleReturnBook(loan.loans_id)}>
                        Return Book
                      </button>
                    </div>
                  </div>))}
              </div>)}
          </section>)}

        {activeTab === 'favorite' && (<section className="profile-section">
            <h2>My Favorite Book</h2>
            {!favoriteBook ? (<p>You haven't set a favorite book yet.</p>) : (<div style={{
                    border: '1px solid #ddd',
                    padding: '20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                {favoriteBook.photo && (<img src={`/api/uploads/${favoriteBook.photo}`} alt={favoriteBook.title} style={{ width: '120px', height: '160px', objectFit: 'cover' }}/>)}
                <div>
                  <h3>{favoriteBook.title}</h3>
                  <p><strong>Author:</strong> {favoriteBook.author_name || 'Unknown'}</p>
                  {favoriteBook.description && (<p><strong>Description:</strong> {favoriteBook.description}</p>)}
                </div>
              </div>)}
          </section>)}
      </div>
    </Layout_1.default>);
};
exports.default = UserProfile;
