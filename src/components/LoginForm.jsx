import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth' : '/auth/register';
      const payload = isLogin 
        ? { 
            userName: formData.username, 
            password: formData.password 
          } 
        : formData;

      const response = await axios.post(
        `http://localhost:8080/api/users${endpoint}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Sending request to:', `http://localhost:8080/api/users${endpoint}`);
      console.log('Request payload:', payload);

      // Handle token from both header and body
      const token = response.data?.token || 
                   response.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        throw new Error('No authentication token received');
      }

      // Store token and user info
      localStorage.setItem('jwtToken', token);
      console.log('Authentication successful');
      console.log('Token', token);

      
      // Redirect to dashboard
      //navigate('/dashboard');
      
    } catch (err) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="welcome-back">
        <h1>Welcome Back!</h1>
        <p>To keep connected with us please login with your personal info</p>
      </div>

      <div className="form-container">
        {isLogin ? (
          <>
            <h2>SIGN IN</h2>
            <div className="social-login">
              <button type="button" className="social-btn facebook">f</button>
              <button type="button" className="social-btn google">G+ in</button>
            </div>
            <p className="or-divider">or use your username for registration:</p>
          </>
        ) : (
          <>
            <h2>Create Account</h2>
            <div className="social-login">
              <button type="button" className="social-btn facebook">f</button>
              <button type="button" className="social-btn google">G+ in</button>
            </div>
            <p className="or-divider">or use your username for registration:</p>
          </>
        )}

        {error && (
          <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>
          )}
          <div className="form-group">
            <input
              type="text" 
              name="username"
              placeholder="Username"  
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>

        <p className="toggle-form">
          {isLogin ? (
            <>Don't have an account? <span onClick={() => setIsLogin(false)}>Create Account</span></>
          ) : (
            <>Already have an account? <span onClick={() => setIsLogin(true)}>Sign In</span></>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginForm;