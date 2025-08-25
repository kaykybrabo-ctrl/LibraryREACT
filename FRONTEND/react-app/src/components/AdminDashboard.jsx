import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/app.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBookId, setEditingBookId] = useState(null);
    const [editedBook, setEditedBook] = useState({ author_id: "", title: "" });
    const [newBook, setNewBook] = useState({ author_id: "", title: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const booksPerPage = 5;

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    });

    useEffect(() => {
        fetchAuthors();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [currentPage, searchTerm]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const offset = (currentPage - 1) * booksPerPage;

            // Buscar livros da página atual
            const res = await fetch(
                `http://localhost:8080/api/books?limit=${booksPerPage}&offset=${offset}&search=${encodeURIComponent(
                    searchTerm
                )}`,
                { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error("Error fetching books");
            const data = await res.json();
            setBooks(data);

            // Buscar total de livros para paginação
            const countRes = await fetch(
                `http://localhost:8080/api/books/count?search=${encodeURIComponent(searchTerm)}`,
                { headers: getAuthHeaders() }
            );
            const countData = await countRes.json();
            setTotalBooks(countData.total);
        } catch (err) {
            console.error(err);
            setBooks([]);
            setTotalBooks(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/authors", { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error fetching authors");
            const data = await res.json();
            setAuthors(data);
        } catch (err) {
            console.error(err);
            setAuthors([]);
        }
    };

    const totalPages = Math.ceil(totalBooks / booksPerPage);
    const handlePageChange = (page) => setCurrentPage(page);
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!newBook.author_id || !newBook.title.trim()) return;
        try {
            const res = await fetch("http://localhost:8080/api/books", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    author_id: Number(newBook.author_id),
                    title: newBook.title.trim(),
                }),
            });
            if (res.ok) {
                setNewBook({ author_id: "", title: "" });
                fetchBooks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startEditBook = (book) => {
        setEditingBookId(book.book_id);
        setEditedBook({ author_id: book.author_id, title: book.title });
    };

    const handleSaveEdit = async (book_id) => {
        try {
            await fetch(`http://localhost:8080/api/books/${book_id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    author_id: Number(editedBook.author_id),
                    title: editedBook.title,
                }),
            });
            setEditingBookId(null);
            fetchBooks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (book_id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await fetch(`http://localhost:8080/api/books/${book_id}`, { method: "DELETE", headers: getAuthHeaders() });
            fetchBooks();
        } catch (err) {
            console.error(err);
        }
    };

    // Logout corrigido: remove token e redireciona
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-container">
            <header>
                <h1>Manage Books</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <main>
                <section className="form-section">
                    <h2>Add Book</h2>
                    <form onSubmit={handleAddBook}>
                        <select
                            value={newBook.author_id}
                            onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })}
                        >
                            <option value="">Select Author</option>
                            {authors.map((a) => (
                                <option key={a.author_id} value={a.author_id}>
                                    {a.name_author}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        />
                        <button type="submit">Add</button>
                    </form>
                </section>

                <section className="form-section">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </section>

                <section className="book-list">
                    <h2>Book List</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Author</th>
                                <th>Title</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center" }}>
                                        No books found
                                    </td>
                                </tr>
                            ) : (
                                books.map((book) => (
                                    <tr key={book.book_id}>
                                        <td>{book.book_id}</td>
                                        <td>
                                            {editingBookId === book.book_id ? (
                                                <select
                                                    value={editedBook.author_id}
                                                    onChange={(e) => setEditedBook({ ...editedBook, author_id: e.target.value })}
                                                >
                                                    {authors.map((a) => (
                                                        <option key={a.author_id} value={a.author_id}>
                                                            {a.name_author}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                authors.find((a) => a.author_id === book.author_id)?.name_author || ""
                                            )}
                                        </td>
                                        <td>
                                            {editingBookId === book.book_id ? (
                                                <input
                                                    type="text"
                                                    value={editedBook.title}
                                                    onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                                                />
                                            ) : (
                                                book.title
                                            )}
                                        </td>
                                        <td>
                                            {editingBookId === book.book_id ? (
                                                <>
                                                    <button onClick={() => handleSaveEdit(book.book_id)}>Save</button>
                                                    <button onClick={() => setEditingBookId(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditBook(book)}>Edit</button>
                                                    <button onClick={() => handleDelete(book.book_id)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button onClick={handlePrev} disabled={currentPage === 1}>
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? "active" : ""}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={handleNext} disabled={currentPage === totalPages}>
                            Next
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
