'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/auth/signup` : 'http://localhost:3001/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, organizationName, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push('/login?message=Account created! Please sign in.');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* Left Column: Branding / Marketing */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-blue-950/30 border-r border-blue-900/30 items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-8">
              <Sparkles className="w-4 h-4" /> The Future of Restaurant Ops
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Scale your restaurant empire with AI.
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Join thousands of owners who have automated their payroll, scheduling, and analytics using RestroOps.
            </p>
            
            <div className="space-y-6">
              {[
                'Automated Payroll & Accounting Integration',
                'AI-Powered Predictive Scheduling',
                'Real-time Multi-location Analytics'
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-slate-300 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] to-[#0f1524] z-0"></div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-slate-400">Get started with a 14-day free trial. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm">
              <p className="font-bold mb-1">Error creating account</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Organization Name</label>
              <div className="relative group">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Acme Hospitality Group" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Your Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:border-blue-500 focus:bg-white/10 transition-all outline-none appearance-none"
              >
                <option value="owner">Restaurant Owner</option>
                <option value="manager">Restaurant Manager</option>
                <option value="advisor">Financial Advisor</option>
                <option value="ops_manager">Operations Manager</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-6 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              {loading ? 'Creating Account...' : 'Sign Up Free'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-medium hover:text-blue-400 transition-colors">
              Log in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
