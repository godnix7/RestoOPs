'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function LogSaleModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Manual Entry');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/dashboard/transactions', {
        amount: parseFloat(amount),
        type: 'revenue',
        category: 'Manual',
        description: `Manual entry: ${source}`,
        restaurantId: 'temp-restaurant-id' // In real app, get from context
      });
      onClose();
    } catch (err) {
      alert('Error logging sale');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg glass-card p-8 border border-white/10">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
          
          <h2 className="text-2xl font-bold mb-6">Log Manual Sale</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Sale Amount (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Revenue Source</label>
              <select 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none focus:border-blue-500/50 appearance-none"
              >
                <option>Manual Entry</option>
                <option>Catering</option>
                <option>Events</option>
                <option>Gift Cards</option>
              </select>
            </div>

            <button 
              disabled={loading}
              className="w-full btn-primary py-4 font-bold flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Confirm Transaction'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
