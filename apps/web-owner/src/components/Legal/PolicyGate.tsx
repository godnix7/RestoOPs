'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, ArrowRight } from 'lucide-react';

export default function PolicyGate() {
  const [show, setShow] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we need to show the gate by calling a light health check or specific endpoint
    const checkPolicies = async () => {
      const res = await fetch('http://localhost:3001/policies/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 403) {
        const data = await res.json();
        if (data.code === 'POLICIES_NOT_ACCEPTED') {
          // Fetch policy contents
          const pRes = await fetch('http://localhost:3001/policies/latest');
          const pData = await pRes.json();
          setPolicies(pData);
          setShow(true);
        }
      }
    };
    
    if (localStorage.getItem('token')) {
      checkPolicies();
    }
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await Promise.all(policies.map(p => 
        fetch('http://localhost:3001/policies/accept', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ policyId: p.id })
        })
      ));
      setShow(false);
    } catch (err) {
      alert('Error accepting policies');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const allAccepted = policies.length > 0 && policies.every(p => accepted[p.id]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-2xl glass-card p-8 border border-blue-500/20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Legal Agreement Update</h2>
              <p className="text-slate-400 text-sm">Please review and accept our updated terms to continue using RestroOps.</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-8 custom-scrollbar">
            {policies.map(policy => (
              <div key={policy.id} className="p-4 glass rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wider">{policy.title}</h3>
                  <button 
                    onClick={() => setAccepted(prev => ({ ...prev, [policy.id]: !prev[policy.id] }))}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${accepted[policy.id] ? 'bg-blue-600 border-blue-500' : 'border-white/10 hover:border-white/20'}`}
                  >
                    {accepted[policy.id] && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{policy.content}</p>
                <button className="text-[10px] font-bold text-blue-400 mt-2 uppercase tracking-widest hover:text-blue-300">Read Full Document</button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 max-w-xs">By clicking "Accept All", you agree to the Terms of Service, Privacy Policy, and DPA version {policies[0]?.version}.</p>
            <button 
              disabled={!allAccepted || loading}
              onClick={handleAccept}
              className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? 'Processing...' : 'Accept All & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
