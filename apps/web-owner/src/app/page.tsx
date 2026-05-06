'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Receipt, 
  Users, 
  Sparkles, 
  LayoutDashboard, 
  Settings, 
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import StatCard from '@/components/Dashboard/StatCard';
import AiAgentPanel from '@/components/AI/AiAgentPanel';
import PlaidLink from '@/components/Integrations/PlaidLink';
import PolicyGate from '@/components/Legal/PolicyGate';
import LogSaleModal from '@/components/Dashboard/LogSaleModal';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [scrolled, setScrolled] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLogSaleOpen, setIsLogSaleOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);
  
  const router = useRouter();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      // In a real app, restaurantId would come from user context
      const res = await api.get('/dashboard/summary', {
        params: { restaurantId: '123e4567-e89b-12d3-a456-426614174000' } // Example UUID
      });
      return res.data.data;
    },
    refetchInterval: 60000, // Refetch every 60 seconds as per system.md 6.2
  });

  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    if (dashboardData?.insights) {
      setInsights(dashboardData.insights);
    }
  }, [dashboardData]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-rose-500 mb-4 text-4xl">⚠</div>
          <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
          <p className="text-slate-400 mb-6">Failed to fetch real-time dashboard data. Please check your connection.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-8"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-animate flex">
      
      {/* Sidebar - Same as before */}
      <aside className="w-64 glass border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Restro<span className="text-blue-400">Ops</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { icon: LayoutDashboard, label: 'Overview', path: '/' },
            { icon: BarChart3, label: 'Accounting', path: '/accounting' },
            { icon: Users, label: 'Payroll', path: '/payroll' },
            { icon: Receipt, label: 'Invoices', path: '/invoices' },
            { icon: MessageSquare, label: 'AI Agent', action: () => setIsAiOpen(true) },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.path ? router.push(item.path) : item.action?.()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.label ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => router.push('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header - Same as before */}
        <header className={`sticky top-0 z-30 px-8 py-4 flex items-center justify-between transition-all ${scrolled ? 'glass border-b border-white/5 py-3' : ''}`}>
          <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-4 py-2 border border-white/5 w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search insights, transactions..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500" />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/20 cursor-pointer" onClick={() => router.push('/profile')}></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome back, Nischay</h1>
              <p className="text-slate-400 text-sm">Here's what's happening with <span className="text-blue-400 font-medium">The Gourmet Kitchen</span> today.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn-glass flex items-center gap-2 text-sm py-2.5" onClick={() => setIsLogSaleOpen(true)}>
                <Plus className="w-4 h-4" /> Log Sale
              </button>
              <button className="btn-primary flex items-center gap-2 text-sm py-2.5" onClick={() => setIsAiOpen(true)}>
                <Sparkles className="w-4 h-4" /> Ask AI Agent
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass h-32 rounded-3xl animate-pulse-slow bg-white/5"></div>
              ))

            ) : (
              <>
                <StatCard 
                  title="Weekly P&L" 
                  value={`$${dashboardData?.weeklyPnL?.net?.toLocaleString() || '0.00'}`} 
                  trend={dashboardData?.weeklyPnL?.period} 
                  trendUp={dashboardData?.weeklyPnL?.net > 0} 
                  icon={TrendingUp} 
                  color="green"
                />
                <StatCard 
                  title="Payroll Status" 
                  value={dashboardData?.payrollStatus?.status?.replace('_', ' ') || 'None'} 
                  trend={`$${dashboardData?.payrollStatus?.totalGross?.toLocaleString() || '0'}`} 
                  icon={Users} 
                  color="blue"
                />
                <StatCard 
                  title="Cash Flow" 
                  value={`$${(dashboardData?.cashFlow?.[dashboardData.cashFlow.length - 1]?.amount || 0).toLocaleString()}`} 
                  trend="Last update" 
                  icon={CreditCard} 
                  color="orange"
                />
                <StatCard 
                  title="Vendor Dues" 
                  value="$0.00" 
                  icon={Receipt} 
                  color="purple"
                />
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* AI Insights Widget */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  AI Intelligence Center
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All Insights</button>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="glass h-24 rounded-3xl animate-pulse bg-white/5"></div>
                  ))
                ) : insights.length > 0 ? (
                  <AnimatePresence>
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass p-5 rounded-3xl flex gap-4 items-start border-l-4 border-l-blue-500/50"
                      >
                        <div className={`p-2 rounded-xl ${insight.severity === 'warning' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{insight.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setAiPrompt(`Explain this insight: ${insight.title}`);
                              setIsAiOpen(true);
                            }}
                            className="text-xs px-3 py-1.5 glass hover:bg-white/5 rounded-lg transition-all"
                          >
                            Explain
                          </button>
                          <button 
                            onClick={() => setInsights(prev => prev.filter(i => i.id !== insight.id))}
                            className="text-xs px-3 py-1.5 glass hover:bg-rose-500/10 text-rose-400 border-rose-500/20 rounded-lg transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="glass p-12 rounded-3xl text-center">
                    <p className="text-slate-500">No active AI insights at this time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Chart Placeholder - Still static but visually consistent */}
            <div className="glass-card">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Revenue Trend
              </h3>
              <div className="h-48 flex items-end gap-2 px-2">
                {isLoading ? (
                  Array(7).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 bg-white/5 animate-pulse rounded-t-lg h-full"></div>
                  ))
                ) : (
                  (dashboardData?.cashFlow?.length > 0 ? dashboardData.cashFlow : Array(7).fill({ amount: 0 })).map((cf: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(10, (cf.amount / 1000) * 10)}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/60 rounded-t-lg relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${cf.amount?.toLocaleString()}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="flex justify-between mt-4 px-1 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>SUN</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Floating AI Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setAiPrompt(undefined);
          setIsAiOpen(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 z-40 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent group-hover:rotate-180 transition-transform duration-700"></div>
        <Sparkles className="text-white w-7 h-7 relative z-10" />
      </motion.button>

      <AiAgentPanel 
        isOpen={isAiOpen} 
        onClose={() => {
          setIsAiOpen(false);
          setAiPrompt(undefined);
        }} 
        initialPrompt={aiPrompt}
      />
      <PolicyGate />
      <LogSaleModal isOpen={isLogSaleOpen} onClose={() => setIsLogSaleOpen(false)} />
    </div>
  );
}

