import { useState } from 'react';
import api from './api'; // Added this import[cite: 7]
import './App.css';
import Signup from './components/shared/signup';
import Dashboard from './roles/admin/dashboard';

const LoginScreen = ({ onLoginSuccess, onGoToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Replaced local fetch with the api utility[cite: 7]
      const response = await api.login({ email, password }); 
      const data = response.data;

      if (data.success) {
        onLoginSuccess(data.role, data.user); 
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      // Updated error message for better clarity[cite: 7]
      alert("Connection error. Ensure VITE_API_URL is set in Cloudflare and the backend is running.");
    }
  };

  return (
    <div className="main-container">
      <div className="header-section">
        <div className="logo-circle">
          <span className="church-icon">⛪</span>
        </div>
        <h1>Free Believers in Christ</h1>
        <h2>Fellowship Inc.</h2>
        <p className="subtitle">CHURCH MANAGEMENT SYSTEM</p>
      </div>

      <div className="login-card">
        <h3 className="welcome-text">Welcome Back</h3>
        <p className="instruction-text">Sign in to access the church dashboard</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="signin-button">Sign In</button>
        </form>

        <p className="signup-text">
          Don't have an account? 
          <button 
            onClick={onGoToSignup} 
            style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Sign up
          </button>
        </p>
      </div>

      <footer className="footer-text">
        © 2026 Free Believers in Christ Fellowship Inc. • Taguig City
      </footer>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('login');
  const [userRole, setUserRole] = useState(null); 
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (role, user) => {
    setUserRole(role);
    setUserData(user); 
    setView('dashboard');
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard':
        return (
          <Dashboard 
            role={userRole} 
            user={userData} 
            onLogout={() => {
              setView('login');
              setUserData(null);
              setUserRole(null);
            }} 
          />
        );
      case 'signup':
        return <Signup onGoToLogin={() => setView('login')} />;
      case 'login':
      default:
        return (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess} 
            onGoToSignup={() => setView('signup')} 
          />
        );
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}