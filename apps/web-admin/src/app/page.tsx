'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
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
            <button 
              onClick={() => alert('Settings module coming soon!')}
              className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all"
            >
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
            {activeTab === 'Overview' && <OverviewTab onNavigate={setActiveTab} />}
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

function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [recentOrgs, setRecentOrgs] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      Promise.all([
        apiClient.get('/admin/stats').then(res => res.json()),
        apiClient.get('/admin/recent-organizations').then(res => res.json()),
        apiClient.get('/admin/system-exceptions').then(res => res.json())
      ]).then(([statsRes, orgsRes, exceptionsRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (orgsRes.success) setRecentOrgs(orgsRes.data);
        if (exceptionsRes.success) setExceptions(exceptionsRes.data);
      }).catch(err => {
        console.error('Fetch error:', err);
      }).finally(() => setLoading(false));

    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: 'Total Revenue', value: stats?.totalRevenue ? `$${Number(stats.totalRevenue).toLocaleString()}` : '$0', trend: '+14%', icon: Globe, color: 'blue' },
    { label: 'Active Orgs', value: stats?.activeOrgs || '0', trend: '+8', icon: Building2, color: 'purple' },
    { label: 'AI Agent Calls', value: stats?.aiAgentCalls || '0', trend: '+112%', icon: Zap, color: 'orange' },
    { label: 'DB Health', value: stats?.dbHealth || '99.9%', trend: 'Stable', icon: Database, color: 'emerald' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statItems.map((stat, i) => (
          <div key={i} className="glass-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-purple-500/10 text-purple-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500">{stat.trend}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold">Recent Organizations</h3>
            <button 
              onClick={() => onNavigate('Organizations')}
              className="text-xs text-purple-400 font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-white/5">
             {loading ? (
               <div className="p-12 text-center text-slate-500 animate-pulse">Loading data...</div>
             ) : recentOrgs.length > 0 ? recentOrgs.map((org, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">{org.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold">{org.name}</p>
                    <p className="text-[10px] text-slate-500">Created: {new Date(org.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400`}>
                  {org.tier || 'Starter'}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-xs italic">No organizations yet.</div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            System Exceptions
          </h3>
          <div className="space-y-4">
             {loading ? (
               <div className="p-4 text-center text-slate-500 animate-pulse">Checking logs...</div>
             ) : exceptions.length > 0 ? exceptions.map((err, i) => (
              <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold">{err.description}</p>
                  <p className="text-[10px] text-slate-500">{new Date(err.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-slate-500 text-[10px] italic">System clear. No exceptions found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OrganizationsTab() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = () => {
    setLoading(true);
    apiClient.get('/admin/organizations')
      .then(res => res.json())
      .then(res => {
        if (res.success) setOrgs(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleAddOrg = async () => {
    const name = prompt('Enter organization name:');
    if (!name) return;

    try {
      const res = await apiClient.post('/admin/organizations', { name });
      const response = await res.json();
      if (response.success) {
        alert('Organization added successfully!');
        fetchOrgs();
      } else {
        alert(response.message || 'Failed to add organization.');
      }
    } catch (err) {
      alert('Error adding organization.');
    }
  };

  return (
    <div className="glass-card p-0">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold">Managed Organizations</h3>
        <button 
          onClick={handleAddOrg}
          className="btn-admin text-xs py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Organization
        </button>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Loading organizations...</div>
      ) : orgs.length > 0 ? (
        <div className="divide-y divide-white/5">
          {orgs.map((org, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400 text-lg border border-purple-500/20">{org.name[0]}</div>
                <div>
                  <p className="font-bold">{org.name}</p>
                  <p className="text-xs text-slate-500">Subscription: {org.tier || 'Starter'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Status</p>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 uppercase">Active</span>
                </div>
                <button 
                  onClick={() => alert(`Details for ${org.name} coming soon!`)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">No organizations found.</p>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/platform-users')
      .then(res => res.json())
      .then(res => {
        if (res.success) setUsers(res.data);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="glass-card p-0">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold">Platform Access Control</h3>
        <span className="text-[10px] text-slate-500">Manage super-admins and support staff</span>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Loading users...</div>
      ) : users.length > 0 ? (
        <div className="divide-y divide-white/5">
          {users.map((user, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-white/5">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{user.email}</p>
                  <p className="text-[10px] text-slate-500">Role: {user.role}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${user.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 italic text-xs">No platform users found.</div>
      )}
    </div>
  );
}

function PolicyTab() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/policies')
      .then(res => res.json())
      .then(res => {
        if (res.success) setPolicies(res.data);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="space-y-6">
      <div className="glass-card p-0">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold">Legal Documents & Policies</h3>
          <button 
            onClick={() => alert('Policy creation module coming soon!')}
            className="btn-admin text-xs py-2 px-4"
          >
            New Version
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">Loading policies...</div>
        ) : policies.length > 0 ? (
          <div className="divide-y divide-white/5">
            {policies.map((doc, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">{doc.type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-slate-500">Last updated: {new Date(doc.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10">{doc.version}</span>
                  <button 
                    onClick={() => alert(`Editing ${doc.type}...`)}
                    className="text-xs font-bold text-purple-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 italic text-xs">No policies published.</div>
        )}
      </div>
    </div>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = () => {
      apiClient.get('/admin/system-logs')
        .then(res => res.json())
        .then(res => {
          if (res.success) setLogs(res.data);
        })
        .finally(() => setLoading(false));
    };


    fetchLogs();
    const interval = setInterval(fetchLogs, 15000); // Logs refresh faster
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card">
      <h3 className="font-bold mb-6 flex items-center justify-between">
        Audit Logs
        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">Real-time Feed</span>
      </h3>
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="text-center py-8 text-slate-500 italic text-xs">Accessing infrastructure logs...</div>
        ) : logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={i} className="p-3 text-[10px] font-mono bg-black/40 rounded-lg border border-white/5 text-slate-400 flex gap-4">
              <span className="text-purple-500/50 shrink-0">[{new Date(log.created_at).toISOString()}]</span>
              <span className={`font-bold shrink-0 ${log.action.includes('error') ? 'text-rose-500' : 'text-purple-400'}`}>{log.action.toUpperCase()}</span>
              <span className="text-slate-300">User:{log.user_id} - {log.details}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 italic text-xs">No logs recorded.</div>
        )}
      </div>
    </div>
  );
}
