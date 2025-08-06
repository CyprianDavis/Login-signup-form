import React, { useState } from 'react';
import axios from 'axios';

// LoginForm component handles both login and registration functionality
const LoginForm = () => {
  // State to toggle between login and registration forms
  const [isLogin, setIsLogin] = useState(true);
  
  // State to manage form data (name, username, password)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  
  // State to handle error messages
  const [error, setError] = useState('');
  
  // State to manage loading state during API calls
  const [loading, setLoading] = useState(false);

  // Handler for form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update form data while preserving other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Set loading state
    setError(''); // Clear previous errors

    try {
      // Determine API endpoint based on login/registration mode
      const endpoint = isLogin ? '/auth' : '/auth/register';
      
      // Prepare payload - different fields for login vs registration
      const payload = isLogin 
        ? { 
            userName: formData.username, // Login only needs username and password
            password: formData.password 
          } 
        : formData; // Registration uses all form fields

      // Make API request to authentication endpoint
      const response = await axios.post(
        `http://localhost:8080/api/users${endpoint}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json' // Set content type header
          }
        }
      );
      
      // Debugging logs (can be removed in production)
      console.log('Sending request to:', `http://localhost:8080/api/users${endpoint}`);
      console.log('Request payload:', payload);

      // Handle token from both possible locations (header or body)
      const token = response.data?.token || 
                   response.headers['authorization']?.replace('Bearer ', '');

      // Validate we received a token
      if (!token) {
        throw new Error('No authentication token received');
      }

      // Store token in localStorage for future authenticated requests
      localStorage.setItem('jwtToken', token);
      console.log('Authentication successful');
      console.log('Token', token);

      // Note: Currently commented out - would redirect to dashboard
      // navigate('/dashboard');
      
    } catch (err) {
      // Default error message
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        // Network or other errors
        errorMessage = err.message;
      }
      
      // Set error message for display
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      // Reset loading state regardless of success/failure
      setLoading(false);
    }
  };

  // Render the component UI
  return (
    <div className="login-container">
      {/* Welcome section */}
      <div className="welcome-back">
        <h1>Welcome Back!</h1>
        <p>To keep connected with us please login with your personal info</p>
      </div>

      {/* Form section */}
      <div className="form-container">
        {/* Conditional rendering based on login/registration mode */}
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

        {/* Error message display */}
        {error && (
          <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>
            {error}
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit}>
          {/* Name field only shown during registration */}
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
          
          {/* Username field */}
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
          
          {/* Password field */}
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
          
          {/* Submit button with loading state */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>

        {/* Toggle between login and registration */}
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