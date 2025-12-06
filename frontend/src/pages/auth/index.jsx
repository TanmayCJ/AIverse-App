import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  
  // Determine mode based on URL path
  const [mode, setMode] = useState(
    location.pathname === '/register' || location.pathname === '/auth' ? 'register' : 'login'
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile-integration');
    }
  }, [isAuthenticated, navigate]);

  // Update mode when URL changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        // Login with email and password
        if (!formData.email || !formData.password) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }
        
        await login(formData.email, formData.password);
        // Navigate will happen via useEffect when isAuthenticated changes
      } else {
        // Register
        if (!formData.username || !formData.email || !formData.password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        if (formData.password !== formData.password2) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        const result = await register(formData.username, formData.email, formData.password);
        
        if (result.needsEmailVerification) {
          setSuccess('✅ Registration successful! Please check your email to verify your account before logging in.');
          setFormData({ username: '', email: '', password: '', password2: '' });
          // Switch to login mode after 3 seconds
          setTimeout(() => {
            setMode('login');
            setSuccess('');
          }, 3000);
        } else {
          // If email verification is disabled, navigate immediately
          navigate('/profile-integration');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || err.error_description || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setError('');
    setSuccess('');
    setFormData({ username: '', email: '', password: '', password2: '' });
    navigate(newMode === 'login' ? '/login' : '/register');
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{mode === 'login' ? 'Login' : 'Sign Up'} - AIverse</title>
        <meta name="description" content="Login or register to access AIverse features" />
      </Helmet>

      <Header />

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Info Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block"
              >
                {mode === 'login' ? (
                  <div className="space-y-6">
                    <h1 className="text-5xl font-bold text-text-primary">
                      Welcome Back!
                    </h1>
                    <p className="text-xl text-text-secondary">
                      Continue your journey in the AIverse ecosystem
                    </p>
                    
                    <div className="space-y-4 mt-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                          <Icon name="TrendingUp" size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">Track Your Progress</h3>
                          <p className="text-text-secondary">Monitor your GitHub repos and LeetCode solutions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0">
                          <Icon name="Trophy" size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">Compete & Win</h3>
                          <p className="text-text-secondary">Climb the leaderboard and earn points</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                          <Icon name="Users" size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">Join the Community</h3>
                          <p className="text-text-secondary">Connect with fellow developers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
                      Join AIverse
                    </h1>
                    <p className="text-xl text-text-secondary">
                      Start your competitive coding journey today
                    </p>
                    
                    <div className="glass rounded-2xl p-6 border border-border space-y-4">
                      <h3 className="text-lg font-semibold text-text-primary">What you'll get:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center space-x-3">
                          <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0" />
                          <span className="text-text-secondary">GitHub repository tracking</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0" />
                          <span className="text-text-secondary">LeetCode submission monitoring</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0" />
                          <span className="text-text-secondary">Real-time leaderboard ranking</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0" />
                          <span className="text-text-secondary">Achievement badges & rewards</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0" />
                          <span className="text-text-secondary">Weekly coding challenges</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Right Side - Auth Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className={`glass rounded-2xl border ${mode === 'login' ? 'border-purple-500/20' : 'border-orange-500/20'} p-8 md:p-10`}>
                  {/* Mobile Title */}
                  <div className="md:hidden text-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                      {mode === 'login' ? 'Welcome Back!' : 'Join AIverse'}
                    </h1>
                  </div>

                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${
                      mode === 'login' ? 'from-purple-500 to-purple-700' : 'from-orange-500 to-orange-700'
                    } mb-4`}>
                      <Icon name={mode === 'login' ? 'LogIn' : 'UserPlus'} size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                      {mode === 'login' ? 'Login to Your Account' : 'Create Your Account'}
                    </h2>
                    <p className="text-text-secondary">
                      {mode === 'login' 
                        ? 'Enter your credentials to continue'
                        : 'Fill in your details to get started'}
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20"
                    >
                      <div className="flex items-center text-error">
                        <Icon name="AlertCircle" size={20} className="mr-2 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20"
                    >
                      <div className="flex items-center text-success">
                        <Icon name="CheckCircle" size={20} className="mr-2 flex-shrink-0" />
                        <span className="text-sm">{success}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Username *
                        </label>
                        <Input
                          type="text"
                          name="username"
                          placeholder="Choose a unique username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full"
                        />
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Password *
                      </label>
                      <Input
                        type="password"
                        name="password"
                        placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full"
                      />
                    </div>

                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Confirm Password *
                        </label>
                        <Input
                          type="password"
                          name="password2"
                          placeholder="Re-enter your password"
                          value={formData.password2}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full"
                        />
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={loading}
                      className={`mt-6 ${mode === 'login' ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-700 hover:bg-gray-800'}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Icon name="Loader" size={20} className="animate-spin mr-2" />
                          Processing...
                        </span>
                      ) : (
                        mode === 'login' ? 'Login' : 'Create Account'
                      )}
                    </Button>
                  </form>

                  {/* Toggle Mode */}
                  <div className="mt-8 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-surface text-text-secondary">
                          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={switchMode}
                      className={`mt-4 text-sm font-medium ${
                        mode === 'login' ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-200'
                      } transition-colors`}
                      disabled={loading}
                    >
                      {mode === 'login' ? 'Create a new account →' : '← Back to login'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
