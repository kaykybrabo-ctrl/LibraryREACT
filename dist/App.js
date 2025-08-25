"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("./contexts/AuthContext");
const Login_1 = __importDefault(require("./components/Login"));
const Register_1 = __importDefault(require("./components/Register"));
const Books_1 = __importDefault(require("./components/Books"));
const Authors_1 = __importDefault(require("./components/Authors"));
const BookDetail_1 = __importDefault(require("./components/BookDetail"));
const AuthorDetail_1 = __importDefault(require("./components/AuthorDetail"));
const UserProfile_1 = __importDefault(require("./components/UserProfile"));
const ProtectedRoute_1 = __importDefault(require("./components/ProtectedRoute"));
function App() {
    return (<AuthContext_1.AuthProvider>
      <react_router_dom_1.BrowserRouter>
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/" element={<Login_1.default />}/>
          <react_router_dom_1.Route path="/register" element={<Register_1.default />}/>
          <react_router_dom_1.Route path="/books" element={<ProtectedRoute_1.default>
              <Books_1.default />
            </ProtectedRoute_1.default>}/>
          <react_router_dom_1.Route path="/authors" element={<ProtectedRoute_1.default>
              <Authors_1.default />
            </ProtectedRoute_1.default>}/>
          <react_router_dom_1.Route path="/books/:id" element={<ProtectedRoute_1.default>
              <BookDetail_1.default />
            </ProtectedRoute_1.default>}/>
          <react_router_dom_1.Route path="/authors/:id" element={<ProtectedRoute_1.default>
              <AuthorDetail_1.default />
            </ProtectedRoute_1.default>}/>
          <react_router_dom_1.Route path="/profile" element={<ProtectedRoute_1.default>
              <UserProfile_1.default />
            </ProtectedRoute_1.default>}/>
          <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="/" replace/>}/>
        </react_router_dom_1.Routes>
      </react_router_dom_1.BrowserRouter>
    </AuthContext_1.AuthProvider>);
}
exports.default = App;
