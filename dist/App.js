"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("./contexts/AuthContext");
const ProtectedRoute_1 = __importDefault(require("./components/ProtectedRoute"));
const Login_1 = __importDefault(require("./components/Login"));
const Register_1 = __importDefault(require("./components/Register"));
const Books_1 = __importDefault(require("./components/Books"));
const Authors_1 = __importDefault(require("./components/Authors"));
const BookDetail_1 = __importDefault(require("./components/BookDetail"));
const AuthorDetail_1 = __importDefault(require("./components/AuthorDetail"));
const UserProfile_1 = __importDefault(require("./components/UserProfile"));
require("./index.css");
function App() {
    return ((0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/register", element: (0, jsx_runtime_1.jsx)(Register_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/books", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(Books_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/authors", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(Authors_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/books/:id", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(BookDetail_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/authors/:id", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(AuthorDetail_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/profile", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(UserProfile_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/", replace: true }) })] }) }) }));
}
exports.default = App;
