import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EmailDetails from "./pages/EmailDetails";

function App() {
    return (
        <div>
            {/* Navigation Bar */}
            <nav>
                <Link to="/">Home</Link> |  
                <Link to="/login">Login</Link> |  
                <Link to="/register">Register</Link> |  
                <Link to="/dashboard">Dashboard</Link>
            </nav>

            {/* Page Routes */}
            <Routes>
                <Route path="/" element={<h1>Welcome to SafeInbox</h1>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/email/:id" element={<EmailDetails/>} />
            </Routes>
        </div>
    );
}

export default App;
