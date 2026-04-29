'use client';

import { motion } from 'framer-motion';
import { Receipt, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Invoices</h1>
          <p className="text-slate-400 text-sm">Manage vendor billing and accounts payable.</p>
        </div>
        <Link href="/" className="btn-glass px-6 py-2.5 text-sm font-bold">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending', value: '12', icon: Clock, color: 'text-orange-400' },
          { label: 'Paid (30d)', value: '45', icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Overdue', value: '2', icon: AlertCircle, color: 'text-rose-400' },
          { label: 'Total Volume', value: '$8.4k', icon: Receipt, color: 'text-blue-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-white/5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-white/5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
        <h3 className="font-bold text-lg">Recent Invoices</h3>
        <div className="space-y-3">
          {[
            { vendor: 'Sysco Food Services', amount: '$1,240.50', date: 'Oct 12', status: 'Pending' },
            { vendor: 'Baldor Specialty Foods', amount: '$850.20', date: 'Oct 11', status: 'Paid' },
            { vendor: 'Empire Merchants', amount: '$2,100.00', date: 'Oct 10', status: 'Overdue' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 font-bold">
                  {inv.vendor[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{inv.vendor}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{inv.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{inv.amount}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${inv.status === 'Paid' ? 'text-emerald-400' : inv.status === 'Overdue' ? 'text-rose-400' : 'text-orange-400'}`}>
                  {inv.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
