import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css';
import styles from './HomeHeader.module.css';

interface Book {
  book_id: number;
  title: string;
  description?: string;
  photo?: string;
  author_id: number;
  author_name?: string;
}

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    const id = setInterval(() => rotateNext(), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const booksRes = await axios.get('/api/books');
        const authorsRes = await axios.get('/api/authors');
        
        const booksWithAuthors = booksRes.data.slice(0, 6).map((book: any) => {
          const author = authorsRes.data.find((a: any) => a.author_id === book.author_id);
          return {
            ...book,
            author_name: author?.name_author || 'Autor desconhecido'
          };
        });
        
        setBooks(booksWithAuthors);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar');
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="home-root">
      <div className={styles.homeHeader}>
        <div className={styles.container}>
          <div className={styles.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            <span className={styles.logo} aria-hidden>📚</span>
            <h1 className={styles.title}>PedBook</h1>
          </div>
          <nav className={styles.homeNav}>
            <a href="#highlights" className={styles.navLink}>Destaques</a>
            <a href="#contato" className={styles.navLink}>Contato</a>
            <Link to="/login" className={styles.loginBtn}>Entrar</Link>
          </nav>
        </div>
      </div>

      <section className="hero">
        <div className="hero-gradient" />
        <div className="carousel">
          <div className="slide active" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600')" }}>
            <div className="overlay" style={{ paddingLeft: '60px' }}>
              <h2>Explore livros incríveis</h2>
              <p>Descubra autores, leia sinopses e gerencie seus favoritos.</p>
              <div className="cta-row">
                <button type="button" className="btn primary" onClick={() => navigate('/login')}>Entrar</button>
                <button type="button" className="btn ghost" onClick={() => navigate('/register')}>Criar conta</button>
              </div>
            </div>
          </div>
          <div className="slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600')" }}>
            <div className="overlay" style={{ paddingLeft: '60px' }}>
              <h2>Descubra novos livros</h2>
              <p>Explore nosso acervo e encontre sua próxima leitura.</p>
              <div className="cta-row">
                <button type="button" className="btn primary" onClick={() => navigate('/login')}>Entrar</button>
                <button type="button" className="btn ghost" onClick={() => navigate('/register')}>Criar conta</button>
              </div>
            </div>
          </div>
          <div className="slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1600')" }}>
            <div className="overlay" style={{ paddingLeft: '60px' }}>
              <h2>Leituras para todos</h2>
              <p>Ficção, romance, crônicas e muito mais.</p>
              <div className="cta-row">
                <button type="button" className="btn primary" onClick={() => navigate('/login')}>Entrar</button>
                <button type="button" className="btn ghost" onClick={() => navigate('/register')}>Criar conta</button>
              </div>
            </div>
          </div>
          <div className="carousel-controls" aria-label="Controles do carrossel">
            <button className="prev" aria-label="Anterior" onClick={rotatePrev}>‹</button>
            <button className="next" aria-label="Próximo" onClick={rotateNext}>›</button>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="feature-card">
          <h3>📚 Acervo Completo</h3>
          <p>Explore nossa vasta coleção de livros organizados por categoria, autor e gênero.</p>
        </div>
        <div className="feature-card">
          <h3>🔍 Busca Avançada</h3>
          <p>Encontre rapidamente o livro que procura com nossa ferramenta de busca inteligente.</p>
        </div>
        <div className="feature-card">
          <h3>⭐ Avaliações</h3>
          <p>Leia e compartilhe avaliações para descobrir suas próximas leituras favoritas.</p>
        </div>
        <div className="feature-card">
          <h3>👤 Perfil Pessoal</h3>
          <p>Personalize seu perfil com foto e descrição, gerencie seus empréstimos ativos e defina seu livro favorito.</p>
        </div>
      </section>

      <section id="highlights" className="highlights">
        <div className="section-head">
          <h3>Livros em destaque</h3>
          <p>Confira algumas obras do nosso acervo</p>
        </div>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="cards">
              {books.map(book => (
                <div 
                  key={`featured-${book.book_id}`} 
                  className="card" 
                  onClick={() => navigate(`/book/${book.book_id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="thumb">
                    <img 
                      src={book.photo ? `/api/uploads/${book.photo}` : `https://via.placeholder.com/300x450/162c74/ffffff?text=${encodeURIComponent(book.title)}`} 
                      alt={book.title} 
                      loading="eager" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      onError={(e) => { 
                        (e.currentTarget as HTMLImageElement).src = `https://via.placeholder.com/300x450/162c74/ffffff?text=${encodeURIComponent(book.title)}`; 
                      }} 
                    />
                  </div>
                  <div className="card-body">
                    <h4 title={book.title}>{book.title}</h4>
                    <p className="author">{book.author_name}</p>
                    <p className="desc">{book.description || 'Descrição não disponível'}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button 
                onClick={() => navigate('/books')}
                style={{
                  background: '#162c74',
                  color: 'white',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                onMouseOut={(e) => e.currentTarget.style.background = '#162c74'}
              >
                📚 Ver Todos os Livros
              </button>
            </div>
          </>
        )}
      </section>

      <section className="testimonials">
        <div className="section-head">
          <h3>O que dizem sobre o PedBook</h3>
        </div>
        <div className="quotes">
          <blockquote>
            "Interface linda e muito fácil de usar. Encontrei meus livros favoritos rapidinho."
            <span>— Ana, leitora</span>
          </blockquote>
          <blockquote>
            "Perfeito para organizar empréstimos e acompanhar avaliações da equipe."
            <span>— Júlio, bibliotecário</span>
          </blockquote>
          <blockquote>
            "Catálogo diverso e navegação fluida. Recomendo demais."
            <span>— Carla, professora</span>
          </blockquote>
        </div>
      </section>

      <footer id="contato" className="home-footer">
        <div className="footer-content">
          <div>
            <h4>Contato</h4>
            <ul className="contact-list">
              <li><strong>Telefone:</strong> (14) 91234-5678</li>
              <li><strong>E-mail:</strong> admin@pedbot.com.br</li>
            </ul>
          </div>
          <div>
            <h4>Endereço</h4>
            <p>Pedbot Tecnologia Ltda.<br />Av. Paulista, 1000 - Bela Vista<br />São Paulo - SP, 01310-100</p>
          </div>
          <div>
            <h4>Sobre</h4>
            <p>Plataforma de biblioteca digital desenvolvida com NestJS + React.</p>
          </div>
          <div>
            <h4>Links</h4>
            <ul className="footer-links">
              <li><a href="#features">Funcionalidades</a></li>
              <li><a href="#contato">Contato</a></li>
              <li><Link to="/login">Entrar</Link></li>
              <li><Link to="/register">Criar conta</Link></li>
            </ul>
          </div>
        </div>
        <p className="copyright">© {new Date().getFullYear()} PedBook · Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

function rotateNext() {
  const slides = document.querySelectorAll<HTMLDivElement>('.carousel .slide');
  if (slides.length === 0) return;
  const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
  const nextIndex = (activeIndex + 1) % slides.length;
  slides[activeIndex]?.classList.remove('active');
  slides[nextIndex]?.classList.add('active');
}

function rotatePrev() {
  const slides = document.querySelectorAll<HTMLDivElement>('.carousel .slide');
  if (slides.length === 0) return;
  const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
  const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
  slides[activeIndex]?.classList.remove('active');
  slides[prevIndex]?.classList.add('active');
}

export default Home;
