"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (!isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/", replace: true });
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
};
exports.default = ProtectedRoute;
