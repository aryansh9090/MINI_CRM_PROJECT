import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ScoreBadge from '../components/ScoreBadge';
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get('/leads');
        setLeads(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const metrics = useMemo(() => ({
    total: leads.length,
    newLeads: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  }), [leads]);

  // Donut chart data
  const sourceData = useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {});
    
    // Ensure all categories exist even if 0
    return [
      { name: 'Website', value: counts['Website'] || 0, color: '#84CC16' },
      { name: 'Referral', value: counts['Referral'] || 0, color: '#65A30D' },
      { name: 'Social', value: counts['Social'] || 0, color: '#4D7C0F' },
      { name: 'Cold Call', value: counts['Cold Call'] || 0, color: '#365314' },
    ].filter(item => item.value > 0);
  }, [leads]);

  // Fake trend data for Area Chart
  const trendData = useMemo(() => {
    return [
      { name: 'Mon', leads: 4 },
      { name: 'Tue', leads: 7 },
      { name: 'Wed', leads: 5 },
      { name: 'Thu', leads: 11 },
      { name: 'Fri', leads: 9 },
      { name: 'Sat', leads: Math.max(metrics.total - 10, 0) },
      { name: 'Sun', leads: metrics.total },
    ];
  }, [metrics.total]);

  const recentLeads = leads.slice(-5).reverse();

  if (loading) {
    return <div className="p-8 text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-400 text-sm font-medium">Dashboards / <span className="text-white">Overview</span></div>
        <button className="bg-dark-card border border-dark-border text-gray-300 px-4 py-1.5 rounded-md text-sm hover:text-white hover:bg-dark-hover transition-colors">
          Today
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: metrics.total, trend: '+12%', up: true },
          { label: 'New Leads', value: metrics.newLeads, trend: '+5%', up: true },
          { label: 'Contacted', value: metrics.contacted, trend: '-2%', up: false },
          { label: 'Converted', value: metrics.converted, trend: '+24%', up: true },
        ].map(m => (
          <div key={m.label} className="bg-dark-card border border-dark-border p-5 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">{m.label}</p>
            <h2 className="text-3xl font-bold text-white mb-3">{m.value}</h2>
            <div className={`flex items-center gap-1 text-xs font-medium ${m.up ? 'text-accent' : 'text-red-400'}`}>
              {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{m.trend}</span>
              <span className="text-gray-600 ml-1">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales/Lead Overview (Donut) */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-xl lg:col-span-1 flex flex-col">
          <h3 className="text-white font-medium mb-6">Lead Sources Overview</h3>
          <div className="flex-1 flex flex-col justify-center relative min-h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sourceData.length ? sourceData : [{name:'Empty', value:1, color:'#1F1F1F'}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(sourceData.length ? sourceData : [{name:'Empty', value:1, color:'#1F1F1F'}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #1F1F1F', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#84CC16' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">{metrics.total}</span>
              <span className="text-xs text-gray-500">Total Leads</span>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {sourceData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Stats & Trend Area */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 flex flex-col justify-center">
            <p className="text-accent text-sm mb-1">New this week</p>
            <h2 className="text-3xl font-bold text-white">{metrics.newLeads + 3} <span className="text-xs text-accent bg-accent/20 px-1.5 py-0.5 rounded ml-2">+4%</span></h2>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-center">
            <p className="text-gray-400 text-sm mb-1">Conversion Rate</p>
            <h2 className="text-3xl font-bold text-white">
              {metrics.total ? Math.round((metrics.converted / metrics.total) * 100) : 0}% 
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded ml-2">+12%</span>
            </h2>
          </div>
          
          {/* Area Chart */}
          <div className="sm:col-span-2 bg-dark-card border border-dark-border rounded-xl p-5">
            <h3 className="text-white font-medium mb-4">Lead Trend</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84CC16" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#84CC16" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #1F1F1F', borderRadius: '8px' }}
                    itemStyle={{ color: '#84CC16' }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="#84CC16" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Leads Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-border">
          <h3 className="text-white font-medium">Recent Leads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-dark-border">
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-dark-border last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-hover flex items-center justify-center text-xs font-bold text-gray-300">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{lead.source}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                      lead.status === 'Converted' ? 'bg-accent/10 border-accent/20 text-accent' :
                      lead.status === 'New' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      lead.status === 'Lost' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-gray-500/10 border-gray-500/20 text-gray-300'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 truncate max-w-[200px]">{lead.notes || '—'}</td>
                </tr>
              ))}
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
