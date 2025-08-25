import React, { useState, useEffect } from "react";

function UserDashboard() {
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [token] = useState(localStorage.getItem("token") || "");
    const [books, setBooks] = useState([]);
    const [favorites, setFavorites] = useState(null);
    const [loans, setLoans] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [description, setDescription] = useState("");
    const [profileImage, setProfileImage] = useState("/uploads/default-user.png");
    const [selectedFile, setSelectedFile] = useState(null);
    const [bookSelect, setBookSelect] = useState("");
    const [bookOptions, setBookOptions] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const limit = 5;

    const getAuthHeaders = (type = "application/json") => {
        const h = { Authorization: `Bearer ${token}` };
        if (type) h["Content-Type"] = type;
        return h;
    };

    useEffect(() => {
        if (!username) {
            window.location.href = "/interface/main.html";
        } else {
            fetchProfile();
            fetchBooks();
            fetchFavoriteBook();
            fetchLoanHistory();
            fetchBookOptions();
            fetchReviews();
        }
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch(`/get-profile?username=${encodeURIComponent(username)}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setProfileImage(data.profile_image ? `uploads/${data.profile_image}` : "/uploads/default-user.png");
                setDescription(data.description || "");
            }
        } catch { }
    }

    async function fetchBooks(page = 0) {
        try {
            const offset = page * limit;
            const [resBooks, resCount] = await Promise.all([
                fetch(`/books?limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() }),
                fetch("/books/count", { headers: getAuthHeaders() }),
            ]);
            if (!resBooks.ok || !resCount.ok) throw new Error();
            const booksData = await resBooks.json();
            const { total } = await resCount.json();
            setBooks(booksData);
            setTotalPages(Math.ceil(total / limit));
            setCurrentPage(page);
        } catch {
            setBooks([]);
        }
    }

    async function fetchFavoriteBook() {
        try {
            const res = await fetch(`/users/favorite?username=${encodeURIComponent(username)}`, {
                headers: getAuthHeaders(),
            });
            setFavorites(res.ok ? await res.json() : null);
        } catch {
            setFavorites(null);
        }
    }

    async function fetchLoanHistory() {
        try {
            const res = await fetch(`/loans?username=${encodeURIComponent(username)}`, {
                headers: getAuthHeaders(),
            });
            setLoans(res.ok ? await res.json() : []);
        } catch {
            setLoans([]);
        }
    }

    async function fetchBookOptions() {
        try {
            const res = await fetch("/books?limit=100&offset=0", { headers: getAuthHeaders() });
            setBookOptions(res.ok ? await res.json() : []);
        } catch {
            setBookOptions([]);
        }
    }

    async function fetchReviews() {
        try {
            const res = await fetch("/reviews", { headers: getAuthHeaders() });
            setReviews(res.ok ? await res.json() : []);
        } catch {
            setReviews([]);
        }
    }

    async function handleRent(bookId) {
        const res = await fetch(`/rent/${bookId}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ username }),
        });
        if (res.ok) {
            alert("Book rented!");
            fetchLoanHistory();
        } else {
            alert((await res.json()).error || "Failed to rent");
        }
    }

    async function handleFavorite(bookId) {
        const res = await fetch(`/favorite/${bookId}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ username }),
        });
        if (res.ok) {
            alert("Book favorited!");
            fetchFavoriteBook();
        } else {
            alert((await res.json()).error || "Failed to favorite");
        }
    }

    async function handleReturn(loanId) {
        const res = await fetch(`/return/${loanId}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        if (res.ok) {
            alert("Book returned!");
            fetchLoanHistory();
            fetchBooks(currentPage);
        } else {
            alert((await res.json()).error || "Failed to return");
        }
    }

    async function handleSaveProfile() {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("description", description);
        if (selectedFile) formData.append("profile_image", selectedFile);

        const res = await fetch("/update-profile", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            if (data.profile_image) setProfileImage(`uploads/${data.profile_image}`);
            alert("Profile updated!");
        } else {
            alert(data.error || "Failed to update profile");
        }
    }

    async function handleReviewSubmit(e) {
        e.preventDefault();
        if (!bookSelect || rating < 1 || rating > 5) return alert("Invalid input");

        const userRes = await fetch("/get-user-id-from-session", { headers: getAuthHeaders() });
        if (!userRes.ok) return alert("Please login");

        const { user_id } = await userRes.json();
        const reviewRes = await fetch("/reviews", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ book_id: bookSelect, user_id, rating, comment }),
        });
        if (reviewRes.ok) {
            alert("Review submitted!");
            setBookSelect("");
            setRating(0);
            setComment("");
            fetchReviews();
        } else {
            alert((await reviewRes.json()).error || "Failed to submit review");
        }
    }

    function handleLogout() {
        localStorage.clear();
        window.location.href = "/";
    }

    return (
        <div>
            <h2>Welcome, {username}</h2>
            <img src={profileImage} alt="User" width={100} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <button onClick={handleSaveProfile}>Save Profile</button>
            <button onClick={handleLogout}>Logout</button>

            <h3>Books</h3>
            {books.length ? (
                books.map((book) => (
                    <div key={book.book_id}>
                        <img
                            src={book.photo ? `/uploads/${book.photo}` : "/uploads/default-book.png"}
                            alt={book.title}
                            width={80}
                        />
                        <h4>{book.title}</h4>
                        <button onClick={() => handleRent(book.book_id)}>Rent</button>
                        <button onClick={() => handleFavorite(book.book_id)}>Favorite</button>
                    </div>
                ))
            ) : (
                <p>No books found.</p>
            )}

            <div>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} disabled={i === currentPage} onClick={() => fetchBooks(i)}>
                        {i + 1}
                    </button>
                ))}
            </div>

            <h3>Favorite Book</h3>
            {favorites ? (
                <div>
                    <img
                        src={favorites.photo ? `/uploads/${favorites.photo}` : "/uploads/default-book.png"}
                        alt={favorites.title}
                        width={80}
                    />
                    <h4>{favorites.title}</h4>
                    <p>{favorites.description}</p>
                </div>
            ) : (
                <p>No favorite book found.</p>
            )}

            <h3>Loan History</h3>
            {loans.length ? (
                loans.map((loan) => (
                    <div key={loan.loans_id}>
                        <strong>{loan.title}</strong> - Loan Date:{" "}
                        {new Date(loan.loan_date).toLocaleDateString()}
                        <button onClick={() => handleReturn(loan.loans_id)}>Return</button>
                    </div>
                ))
            ) : (
                <p>No rental history found.</p>
            )}

            <h3>Reviews</h3>
            {reviews.length ? (
                reviews.map((r, i) => (
                    <div key={i}>
                        <strong>{r.username}</strong> rated <em>{r.bookTitle}</em>
                        <div>{"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}</div>
                        <p>{r.comment || "No comment provided"}</p>
                        <small>{new Date(r.review_date).toLocaleDateString()}</small>
                        <hr />
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}

            <h3>Add Review</h3>
            <form onSubmit={handleReviewSubmit}>
                <select value={bookSelect} onChange={(e) => setBookSelect(e.target.value)}>
                    <option value="">Select a book</option>
                    {bookOptions.map((b) => (
                        <option key={b.book_id} value={b.book_id}>
                            {b.title}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    required
                />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
                <button type="submit">Submit Review</button>
            </form>
        </div>
    );
}

export default UserDashboard;
