'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  Globe, 
  Server, 
  Users, 
  Database,
  Search,
  Bell,
  Settings,
  Zap,
  LayoutDashboard,
  Building2,
  Lock,
  ChevronRight,
  Plus,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-admin-animate flex text-slate-200">
      
      {/* Admin Sidebar */}
      <aside className="w-72 glass border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Restro<span className="text-purple-400">Admin</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { icon: LayoutDashboard, label: 'Overview' },
            { icon: Building2, label: 'Organizations' },
            { icon: Users, label: 'Platform Users' },
            { icon: Lock, label: 'Policy Center' },
            { icon: Activity, label: 'System Logs' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.label ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">System Healthy</span>
          </div>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gradient-purple">{activeTab}</h1>
            <p className="text-slate-400 text-sm mt-1">Platform-wide oversight and operations management.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-xs font-semibold text-slate-400">
              <Server className="w-4 h-4" /> v1.0.4-stable
            </div>
            <button className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Overview' && <OverviewTab />}
            {activeTab === 'Organizations' && <OrganizationsTab />}
            {activeTab === 'Platform Users' && <UsersTab />}
            {activeTab === 'Policy Center' && <PolicyTab />}
            {activeTab === 'System Logs' && <LogsTab />}
          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Revenue', value: '$1.2M', trend: '+14%', icon: Globe, color: 'blue' },
          { label: 'Active Orgs', value: '142', trend: '+8', icon: Building2, color: 'purple' },
          { label: 'AI Agent Calls', value: '45.2k', trend: '+112%', icon: Zap, color: 'orange' },
          { label: 'DB Health', value: '99.9%', trend: 'Stable', icon: Database, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="glass-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-purple-500/10 text-purple-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500">{stat.trend}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold">Recent Organizations</h3>
            <button className="text-xs text-purple-400 font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-white/5">
             {[
              { name: 'The Gourmet Kitchen', owner: 'Nischay', status: 'active' },
              { name: 'Sushi Zen Central', owner: 'M. Chen', status: 'active' },
              { name: 'Pasta Palace', owner: 'G. Rossi', status: 'pending' },
            ].map((org, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">{org.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold">{org.name}</p>
                    <p className="text-[10px] text-slate-500">{org.owner}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${org.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  {org.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            System Exceptions
          </h3>
          <div className="space-y-4">
             {[
              { msg: 'Plaid Sync Failure: Gourmet Kitchen', time: '2m ago' },
              { msg: 'Stripe Webhook Mismatch', time: '14m ago' },
            ].map((err, i) => (
              <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold">{err.msg}</p>
                  <p className="text-[10px] text-slate-500">{err.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function OrganizationsTab() {
  return (
    <div className="glass-card p-0">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold">Managed Organizations</h3>
        <button className="btn-admin text-xs py-2 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Organization
        </button>
      </div>
      <div className="p-12 text-center text-slate-500">
        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-sm">Connect a new organization to start monitoring.</p>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="glass-card">
      <h3 className="font-bold mb-6">Platform Access Control</h3>
      <p className="text-sm text-slate-500">Manage super-admins and cross-tenant support staff.</p>
    </div>
  );
}

function PolicyTab() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold">Legal Documents & Policies</h3>
          <button className="btn-admin text-xs py-2 px-4">New Version</button>
        </div>
        <div className="space-y-4">
          {[
            { title: 'Terms of Service', version: 'v2.4', updated: '2025-01-20' },
            { title: 'Privacy Policy', version: 'v1.8', updated: '2024-12-15' },
            { title: 'Data Processing Agreement', version: 'v2.1', updated: '2025-01-05' },
          ].map((doc, i) => (
            <div key={i} className="p-4 glass rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{doc.title}</p>
                  <p className="text-[10px] text-slate-500">Last updated: {doc.updated}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-lg">{doc.version}</span>
                <button className="text-xs font-bold text-purple-400 hover:underline">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogsTab() {
  return (
    <div className="glass-card">
      <h3 className="font-bold mb-6">Audit Logs</h3>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-3 text-[10px] font-mono bg-black/20 rounded-lg text-slate-500">
            [2025-01-28 14:22:0{i}] <span className="text-purple-400">INFO</span> - User {i}442 logged in from IP 192.168.1.1
          </div>
        ))}
      </div>
    </div>
  );
}
