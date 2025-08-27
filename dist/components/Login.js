"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Login = () => {
    const [username, setUsername] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { login } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const success = await login(username, password);
            if (success) {
                navigate('/books');
            }
            else {
                setError('Invalid username or password');
            }
        }
        catch (err) {
            setError('Login failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "login-container", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Library System" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", children: "Username:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "username", value: username, onChange: (e) => setUsername(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "password", children: "Password:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Logging in...' : 'Login' })] }), (0, jsx_runtime_1.jsxs)("p", { style: { textAlign: 'center', marginTop: '20px' }, children: ["Don't have an account? ", (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/register", children: "Register here" })] })] }));
};
exports.default = Login;
