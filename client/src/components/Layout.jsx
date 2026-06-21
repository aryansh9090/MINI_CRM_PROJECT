import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import LeadModal from './LeadModal';
import { 
  LayoutDashboard, Users, BarChart3, BrainCircuit,
  Plus, LogOut, Search, Bell, Activity, Mail, Phone, Kanban as KanbanIcon, Clock, Dna, Info
} from 'lucide-react';
import api from '../api';

const Layout = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [hasGoldenHours, setHasGoldenHours] = useState(false);
  const [hasConversionDna, setHasConversionDna] = useState(false);

  React.useEffect(() => {
    api.get('/leads').then(res => {
      const now = new Date();
      const needsWarning = res.data.some(lead => {
        if (lead.status === 'New') {
          const dateStr = lead.last_contacted_at || lead.created_at;
          const daysSince = dateStr ? Math.floor((now - new Date(dateStr)) / (1000 * 60 * 60 * 24)) : 0;
          return daysSince > 3;
        }
        return false;
      });
      setHasWarnings(needsWarning);
    }).catch(console.error);

    api.get('/goldenhour/best-times').then(res => {
      if (res.data && res.data.topHours && res.data.topHours.length > 0) {
        setHasGoldenHours(true);
      }
    }).catch(console.error);

    api.get('/conversiondna/profile').then(res => {
      if (res.data && res.data.hasData) {
        setHasConversionDna(true);
      }
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: KanbanIcon, label: 'Kanban', path: '/kanban' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: BrainCircuit, label: 'AI Insights', path: '/ai-insights' },
    { icon: Activity, label: 'Cross Insights', path: '/cross-insights' },
    { icon: Clock, label: 'Golden Hour', path: '/golden-hour' },
    { icon: Dna, label: 'Conversion DNA', path: '/conversion-dna' },
  ];

  return (
    <div className="flex h-screen bg-dark-bg font-sans overflow-hidden text-gray-300">
      
      {/* ───────── LEFT SIDEBAR ───────── */}
      <aside className="w-60 bg-dark-sidebar border-r border-dark-border flex flex-col shrink-0 relative z-20">
        
        {/* Profile */}
        <div className="p-5 flex items-center gap-3 border-b border-dark-border">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent text-accent font-bold">
            AH
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Admin User</h3>
            <p className="text-xs text-gray-500">Mini CRM Admin</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-dark-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-dark-bg border border-dark-border rounded-md pl-9 pr-8 py-1.5 text-sm outline-none focus:border-accent text-gray-300 transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-dark-hover px-1.5 py-0.5 rounded text-gray-500 border border-dark-border">⌘K</span>
          </div>
        </div>
        
        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboards</h4>
            <nav className="space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-accent/15 text-accent shadow-[inset_2px_0_0_0_#84CC16]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <div className="relative flex shrink-0">
                    <item.icon size={18} />
                    {item.label === 'Cross Insights' && hasWarnings && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse-dot shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-dark-sidebar" />
                    )}
                    {item.label === 'Golden Hour' && hasGoldenHours && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse-dot shadow-[0_0_8px_rgba(132,204,22,0.8)] border border-dark-sidebar" />
                    )}
                    {item.label === 'Conversion DNA' && hasConversionDna && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse-dot shadow-[0_0_8px_rgba(132,204,22,0.8)] border border-dark-sidebar" />
                    )}
                  </div>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Settings</h4>
            <nav className="space-y-1">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/15 text-accent shadow-[inset_2px_0_0_0_#84CC16]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <Info size={18} /> About
              </NavLink>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Plus size={18} /> Add Lead
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* ───────── MAIN CONTENT ───────── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <Outlet />
      </main>

      {/* ───────── RIGHT PANEL ───────── */}
      <aside className="w-72 bg-dark-sidebar border-l border-dark-border flex flex-col shrink-0 overflow-y-auto">
        
        {/* Notifications */}
        <div className="p-5 border-b border-dark-border">
          <h3 className="text-sm font-semibold text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <Users size={14} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-300">5 New leads registered.</p>
                <p className="text-xs text-gray-500 mt-0.5">Just now</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <BarChart3 size={14} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Conversion rate up 12%.</p>
                <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Bell size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">3 Unread messages.</p>
                <p className="text-xs text-gray-500 mt-0.5">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities */}
        <div className="p-5 border-b border-dark-border">
          <h3 className="text-sm font-semibold text-white mb-4">Activities</h3>
          <div className="relative border-l border-dark-border ml-4 space-y-6">
            <div className="relative pl-5">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-dark-sidebar" />
              <p className="text-sm text-gray-300">Status changed to Contacted.</p>
              <p className="text-xs text-gray-500 mt-0.5">Just now</p>
            </div>
            <div className="relative pl-5">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-red-400 ring-4 ring-dark-sidebar" />
              <p className="text-sm text-gray-300">1 Lead marked as Lost.</p>
              <p className="text-xs text-gray-500 mt-0.5">45 Minutes ago</p>
            </div>
            <div className="relative pl-5">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-dark-sidebar" />
              <p className="text-sm text-gray-300">Exported weekly report.</p>
              <p className="text-xs text-gray-500 mt-0.5">2 Days ago</p>
            </div>
          </div>
        </div>

        {/* Quick Contacts */}
        <div className="p-5 flex-1">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Contacts</h3>
          <div className="space-y-4">
            {[
              { name: 'Nayan Kumar', email: 'nayan@example.com' },
              { name: 'Ishan Singh', email: 'ishan@example.com' },
              { name: 'Rahul Dev', email: 'rahul@example.com' }
            ].map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-emerald-400 text-white flex items-center justify-center text-xs font-bold">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{contact.name}</p>
                    <p className="text-[10px] text-gray-500 truncate w-24">{contact.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-md hover:bg-accent/20 text-accent transition-colors cursor-pointer"><Mail size={14} /></button>
                  <button className="p-1.5 rounded-md hover:bg-accent/20 text-accent transition-colors cursor-pointer"><Phone size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Add Lead Modal handled via existing component, passed empty lead */}
      <LeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        lead={null}
        onSave={async (leadData) => {
          try {
            await api.post('/leads', leadData);
            setIsAddModalOpen(false);
            // In a real app we might use context or swr to trigger a re-fetch
            // But since this triggers inside Layout, navigating to /leads or refreshing might be needed.
            // For simplicity, we just reload the page or navigate to trigger loader.
            window.location.reload();
          } catch (err) { console.error(err); alert('Failed to save lead'); }
        }} 
      />

    </div>
  );
};

export default Layout;
