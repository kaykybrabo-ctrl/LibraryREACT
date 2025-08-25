import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, buildUploadUrl } from '../config/api';

function UserDashboard() {
    const [profile, setProfile] = useState(null);
    const [books, setBooks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (profile?.username) {
            fetchUserData();
        }
    }, [profile?.username]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await fetch(buildApiUrl('/api/get-profile'), {
                credentials: 'include'
            });

            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Falha ao buscar perfil');
            }

            const profileData = await res.json();
            setProfile(profileData);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            // Buscar livros
            const booksRes = await fetch(buildApiUrl('/api/books'), {
                credentials: 'include'
            });
            if (booksRes.ok) {
                const booksData = await booksRes.json();
                setBooks(booksData);
            }

            // Buscar favoritos
            const favoritesRes = await fetch(buildApiUrl(`/api/users/favorite?username=${profile.username}`), {
                credentials: 'include'
            });
            if (favoritesRes.ok) {
                const favoritesData = await favoritesRes.json();
                setFavorites(Array.isArray(favoritesData) ? favoritesData : [favoritesData]);
            }

            // Buscar histórico
            const historyRes = await fetch(buildApiUrl(`/api/loans?username=${profile.username}`), {
                credentials: 'include'
            });
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setHistory(historyData);
            }

            // Buscar reviews
            const reviewsRes = await fetch(buildApiUrl('/api/reviews'), {
                credentials: 'include'
            });
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);
            }
        } catch (err) {
            console.error('Erro ao buscar dados do usuário:', err);
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">Erro: {error}</div>;
    if (!profile) return <div className="loading">Carregando perfil...</div>;

    return (
        <div className="user-container">
            <header className="user-header">
                <div className="profile-info">
                    <h1>Bem-vindo, {profile.username}</h1>
                    {profile.photo && (
                        <img
                            src={buildUploadUrl(profile.photo)}
                            alt="Perfil"
                            className="profile-photo"
                        />
                    )}
                    <p className="profile-description">
                        {profile.description || 'Nenhuma descrição disponível'}
                    </p>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Sair
                </button>
            </header>

            <main className="user-main">
                <section className="books-section">
                    <h2>Livros Disponíveis</h2>
                    <div className="books-grid">
                        {books.map((book) => (
                            <div key={book.book_id} className="book-card">
                                <h3>{book.title}</h3>
                                <p><strong>Autor:</strong> {book.author_name}</p>
                                {book.cover_image && (
                                    <img
                                        src={buildUploadUrl(book.cover_image)}
                                        alt={book.title}
                                        className="book-cover"
                                    />
                                )}
                                <button className="favorite-btn">❤️ Favoritar</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="favorites-section">
                    <h2>Meus Favoritos</h2>
                    <div className="favorites-list">
                        {favorites.length > 0 ? (
                            favorites.map((favorite) => (
                                <div key={favorite.book_id} className="favorite-item">
                                    <span>{favorite.title}</span>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum favorito ainda</p>
                        )}
                    </div>
                </section>

                <section className="history-section">
                    <h2>Histórico de Empréstimos</h2>
                    <div className="history-list">
                        {history.length > 0 ? (
                            history.map((item) => (
                                <div key={item.loans_id} className="history-item">
                                    <span>{item.title}</span>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum empréstimo ainda</p>
                        )}
                    </div>
                </section>

                <section className="reviews-section">
                    <h2>Avaliações</h2>
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.review_id} className="review-item">
                                    <p><strong>{review.username}</strong> avaliou com {review.rating} estrelas:</p>
                                    <p>{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p>Nenhuma avaliação ainda</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default UserDashboard; 