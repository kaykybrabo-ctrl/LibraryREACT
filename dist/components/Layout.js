"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Layout = ({ children, title }) => {
    const { logout } = (0, AuthContext_1.useAuth)();
    const location = (0, react_router_dom_1.useLocation)();
    const handleLogout = () => {
        logout();
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("h1", { children: title }), (0, jsx_runtime_1.jsx)("button", { id: "logout-button", onClick: handleLogout, children: "Logout" })] }), (0, jsx_runtime_1.jsxs)("nav", { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/books", className: location.pathname === '/books' ? 'active' : '', children: "Books" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/authors", className: location.pathname === '/authors' ? 'active' : '', children: "Authors" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/profile", className: location.pathname === '/profile' ? 'active' : '', children: "Profile" })] }), (0, jsx_runtime_1.jsx)("main", { children: children }), (0, jsx_runtime_1.jsx)("footer", { children: (0, jsx_runtime_1.jsx)("p", { children: "\u00A9 2025 Library System" }) })] }));
};
exports.default = Layout;
