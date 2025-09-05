import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase.js';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/profile', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    console.log('Auth attempt:', { email, isLogin, passwordLength: password.length });

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        console.log('Login response:', { data, error });
        
        if (error) {
          // More specific error handling
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          } else {
            throw error;
          }
        }
        
        // Track login session
        if (data.user) {
          try {
            await supabase.from('user_sessions').insert({
              user_id: data.user.id,
              ip_address: '192.168.18.68', // In production, get real IP
              user_agent: navigator.userAgent
            });
          } catch (sessionError) {
            console.log('Session tracking failed (non-critical):', sessionError);
          }
        }
        
        setMessage('Login successful! Redirecting...');
        // Let the auth state change in App.jsx handle the redirect
        // No manual navigation needed here
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          setMessage('Please check your email for verification link!');
        } else {
          setMessage('Account created successfully! Redirecting...');
          // Let the auth state change in App.jsx handle the redirect
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setMessage('');
            }}
            className="btn-link"
            disabled={loading}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
