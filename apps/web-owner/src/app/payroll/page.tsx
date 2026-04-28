'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MoreVertical,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PayrollPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const mockLineItems = [
    { id: '1', name: 'John Doe', role: 'Head Chef', hours: 42, gross: 2100, net: 1650, status: 'ok' },
    { id: '2', name: 'Jane Smith', role: 'Senior Server', hours: 68, gross: 1360, net: 1100, status: 'anomaly', anomalyMsg: 'Hours exceed 60h/week limit' },
    { id: '3', name: 'Mike Ross', role: 'Server', hours: 38, gross: 760, net: 600, status: 'ok' },
    { id: '4', name: 'Sarah Connor', role: 'Manager', hours: 40, gross: 1800, net: 1400, status: 'ok' },
  ];

  return (
    <div className="min-h-screen bg-gradient-animate p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Payroll Management</h1>
              <p className="text-slate-400 text-sm">Period: <span className="text-blue-400">Apr 15 - Apr 30, 2026</span></p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-glass flex items-center gap-2 text-sm">
              Reject + Comment
            </button>
            <button className="btn-primary flex items-center gap-2 text-sm shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Approve All
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Gross Pay', value: '$6,020.00', color: 'blue' },
            { label: 'Total Deductions', value: '$1,270.00', color: 'orange' },
            { label: 'Anomalies Detected', value: '1', color: 'rose', icon: AlertCircle },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 border-l-4 border-l-blue-500">
              <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.icon && <stat.icon className="w-5 h-5 text-rose-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between glass p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5 w-64">
              <Search className="w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search employee..." className="bg-transparent border-none outline-none text-xs w-full" />
            </div>
            <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-slate-400">Draft</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
              <span className="text-slate-600">Approved</span>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="glass rounded-3xl overflow-hidden border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours</th>
                <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Pay</th>
                <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Pay</th>
                <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody>
              {mockLineItems.map((item, i) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-400">{item.role}</td>
                  <td className="p-5 text-sm font-medium">{item.hours}h</td>
                  <td className="p-5 text-sm font-bold">${item.gross}</td>
                  <td className="p-5 text-sm font-bold text-emerald-400">${item.net}</td>
                  <td className="p-5">
                    {item.status === 'anomaly' ? (
                      <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full w-fit">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Anomaly</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Ready</span>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 text-slate-600 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center py-6">
          <p className="text-slate-500 text-xs italic">Review all line items before final approval. Anomalies must be resolved.</p>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">Total Pay for Period</p>
                <p className="text-2xl font-bold text-emerald-400">$4,750.00</p>
             </div>
             <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2">
                Submit for Disbursement <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

      </div>

    </div>
  );
}
