import { useState } from 'react';
import api from '../../api';
const Signup = ({ onGoToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

// Change this:
const handleSignup = async (e) => {
  e.preventDefault();
  try {
    const response = await api.register(formData); // Use your helper!
    if (response.status === 201) {
      alert("Verification code sent to your email!");
      setStep('otp'); // Switch to OTP input view
    }
  } catch (err) {
    alert(err.response?.data?.error || "Signup failed");
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
        <h3 className="welcome-text">Create Account</h3>
        <p className="instruction-text">Sign up to join the church community</p>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Full Name</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="input-wrapper" style={{flex: 1}}>
                <span className="input-icon">👤</span>
                <input style={{paddingLeft: '35px'}} name="firstName" placeholder="First Name" onChange={handleChange} required />
              </div>
              <div className="input-wrapper" style={{flex: 1}}>
                <span className="input-icon">👤</span>
                <input style={{paddingLeft: '35px'}} name="lastName" placeholder="Last Name" onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input type="email" name="email" placeholder="example@fbcf.org" onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input type="password" name="password" placeholder="Min. 6 characters" onChange={handleChange} required />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="agreeTerms" style={{accentColor: '#1e40af'}} onChange={handleChange} required />
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
              I agree to the <span style={{ color: '#60a5fa', textDecoration: 'underline' }}>Terms & Conditions</span>
            </span>
          </div>

          <button type="submit" className="signin-button">Create Account</button>
        </form>

        <p className="signup-text">
          Already have an account? 
          <button 
            onClick={onGoToLogin} 
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', padding: '0 5px' }}
          >
            Log in
          </button>
        </p>
      </div>

      <footer className="footer-text">
        © 2026 Free Believers in Christ Fellowship Inc. • Taguig City
      </footer>
    </div>
  );
};

export default Signup;