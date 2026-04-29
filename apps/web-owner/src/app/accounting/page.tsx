'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AccountingPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Accounting</h1>
          <p className="text-slate-400 text-sm">Financial health and ledger management.</p>
        </div>
        <Link href="/" className="btn-glass px-6 py-2.5 text-sm font-bold">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Revenue YTD', value: '$452,000', trend: '+12%', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Expenses YTD', value: '$310,000', trend: '+5%', icon: ArrowUpRight, color: 'text-rose-400' },
          { label: 'Net Profit', value: '$142,000', trend: '+18%', icon: BarChart3, color: 'text-blue-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-white/5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-xl text-slate-400">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.trend}</span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-3xl border border-white/5 h-[400px] flex items-center justify-center text-slate-500 font-medium italic">
        General Ledger & P&L Reports coming soon in the next update.
      </div>
    </div>
  );
}
