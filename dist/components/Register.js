"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Register = () => {
    const [username, setUsername] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [success, setSuccess] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { register } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 3) {
            setError('Password must be at least 3 characters long');
            return;
        }
        setLoading(true);
        try {
            const success = await register(username, password);
            if (success) {
                setSuccess('Registration successful! You can now login.');
                setTimeout(() => navigate('/'), 2000);
            }
            else {
                setError('Registration failed. Username may already exist.');
            }
        }
        catch (err) {
            setError('Registration failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "login-container", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Register - Library System" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), success && (0, jsx_runtime_1.jsx)("div", { className: "success-message", children: success }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", children: "Username:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "username", value: username, onChange: (e) => setUsername(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "password", children: "Password:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "confirmPassword", children: "Confirm Password:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "confirmPassword", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Registering...' : 'Register' })] }), (0, jsx_runtime_1.jsxs)("p", { style: { textAlign: 'center', marginTop: '20px' }, children: ["Already have an account? ", (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", children: "Login here" })] })] }));
};
exports.default = Register;
