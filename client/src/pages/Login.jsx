import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Lock, Zap } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden font-sans">
      {/* Background gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="animate-fade-in w-full max-w-md mx-4 relative z-10">
        {/* Glassmorphism card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-accent/30 mb-5">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mini CRM</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Sign in to your admin dashboard</p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter your username"
                  className="dark-input pl-10"
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  className="dark-input pl-10"
                  required 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg shadow-lg shadow-accent/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
