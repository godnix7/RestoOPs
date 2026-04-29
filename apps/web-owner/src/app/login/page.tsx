'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.mfaRequired) {
          // TODO: Handle MFA in UI
          setError('MFA required - feature coming soon');
          return;
        }
        
        // Set cookies via server route
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.accessToken, refreshToken: data.refreshToken }),
        });
        
        router.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animate flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 border border-white/10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-2 text-center">Enter your credentials to access your <span className="text-blue-400">RestroOps</span> command center.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <Link href="#" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">Forgot?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] bg-white/5 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Or continue with</span>
            <div className="h-[1px] bg-white/5 flex-1"></div>
          </div>

          <button className="w-full glass py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
            <Globe className="w-5 h-5" />
            <span className="text-sm font-semibold">SSO Login</span>
          </button>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account? <Link href="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Get started</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
