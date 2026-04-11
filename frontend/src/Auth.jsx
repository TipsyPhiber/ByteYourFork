// src/Auth.jsx
import React, { useState } from 'react';
import axios from 'axios';

function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const res = await axios.post('http://localhost:5000/api/login', {
          email: formData.email,
          password: formData.password
        });
        
        // Save the token to localStorage and update App state
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        // --- SIGNUP FLOW ---
        const res = await axios.post('http://localhost:5000/api/signup', formData);
        alert(res.data.message + " You can now log in.");
        setIsLogin(true); // Switch back to login view
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Join Byte Your Fork'}</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
              <input type="text" name="surname" placeholder="Last Name" onChange={handleChange} required />
              <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
            </>
          )}
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          
          <button type="submit" className="primary-button">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Sign up here.' : 'Log in here.'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
