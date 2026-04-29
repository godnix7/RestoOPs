'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
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
          setTempToken(data.tempToken);
          setStep(2);
        } else {
          // Set cookies via server route
          await fetch('/api/auth/set-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminToken: data.accessToken }),
          });
          router.push('/');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: mfaCode }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminToken: data.accessToken }),
        });
        router.push('/');
      } else {
        setError(data.message || 'MFA failed');
      }
    } catch (err) {
      setError('Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-animate flex items-center justify-center p-6 text-slate-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 border border-purple-500/10 shadow-2xl shadow-purple-500/10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-purple">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-2 text-center">RestroOps Platform Infrastructure & Governance.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restroops.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Master Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-admin py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Infrastructure'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyMfa} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">MFA Authentication Code</label>
              <div className="relative group">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000" 
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm text-center tracking-[1em] font-bold"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-admin py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              Verify & Enter
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-slate-500 font-bold hover:text-slate-400 uppercase tracking-widest transition-colors">Back to Login</button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
