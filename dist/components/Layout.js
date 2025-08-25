"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Layout = ({ children, title }) => {
    const { logout } = (0, AuthContext_1.useAuth)();
    const location = (0, react_router_dom_1.useLocation)();
    const handleLogout = () => {
        logout();
    };
    return (<>
      <header>
        <h1>{title}</h1>
        <button id="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav>
        <react_router_dom_1.Link to="/books" className={location.pathname === '/books' ? 'active' : ''}>
          Books
        </react_router_dom_1.Link>
        <react_router_dom_1.Link to="/authors" className={location.pathname === '/authors' ? 'active' : ''}>
          Authors
        </react_router_dom_1.Link>
        <react_router_dom_1.Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
          Profile
        </react_router_dom_1.Link>
      </nav>

      <main>{children}</main>

      <footer>
        <p>&copy; 2025 Library System</p>
      </footer>
    </>);
};
exports.default = Layout;
