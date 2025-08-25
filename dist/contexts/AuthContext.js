"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.useAuth = void 0;
const react_1 = __importStar(require("react"));
const axios_1 = __importDefault(require("axios"));
const AuthContext = (0, react_1.createContext)(undefined);
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [token, setToken] = (0, react_1.useState)(localStorage.getItem('token'));
    (0, react_1.useEffect)(() => {
        if (token) {
            axios_1.default.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        else {
            delete axios_1.default.defaults.headers.common['Authorization'];
        }
    }, [token]);
    const login = async (username, password) => {
        try {
            const response = await axios_1.default.post('/api/login', { username, password });
            const userData = response.data;
            // Generate a simple token (in production, this should come from the server)
            const newToken = btoa(`${username}:${Date.now()}`);
            setUser(userData);
            setToken(newToken);
            localStorage.setItem('token', newToken);
            return true;
        }
        catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };
    const register = async (username, password) => {
        try {
            await axios_1.default.post('/api/register', { username, password });
            return true;
        }
        catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios_1.default.defaults.headers.common['Authorization'];
    };
    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
exports.AuthProvider = AuthProvider;
