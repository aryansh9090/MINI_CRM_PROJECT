import React, { useState, useEffect } from 'react';
import api from '../api';
import { Target, RefreshCw, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import ScoreBadge from '../components/ScoreBadge';

const CrossInsights = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const now = new Date();

  // Computations
  const getDaysSince = (dateStr) => {
    if (!dateStr) return 0;
    return Math.floor((now - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  };

  // Section A: Warning Alerts
  const warnings = leads.map(lead => {
    const daysSince = getDaysSince(lead.last_contacted_at || lead.created_at);
    if (lead.status === 'New' && daysSince > 3) {
      return { ...lead, warningType: 'red', daysStuck: daysSince };
    }
    if (lead.status === 'Contacted' && daysSince > 5) {
      return { ...lead, warningType: 'amber', daysStuck: daysSince };
    }
    return null;
  }).filter(Boolean);

  // Section C: Action Text
  const getActionText = (score, status) => {
    if (status === 'New' && score < 20) return "⚠️ Cold lead — contact immediately";
    if (status === 'Contacted' && score >= 20 && score <= 40) return "📞 Follow up — lead going cold";
    if (status === 'Qualified' && score >= 40 && score <= 60) return "📋 Send proposal now";
    if (status === 'Converted' && score >= 60) return "✅ Retain — ask for referral";
    // Fallbacks
    if (status === 'New') return "✉️ Send intro email or make first call";
    if (status === 'Contacted') return "📞 Continue follow-ups";
    if (status === 'Qualified') return "📋 Prepare for closing";
    if (status === 'Lost') return "❌ Review loss reasons";
    return "✅ Retain relationship";
  };

  // Section B: Pipeline Steps
  const PIPELINE_STEPS = ['New', 'Contacted', 'Qualified', 'Converted'];
  
  const getJourneySuggestion = (status) => {
    switch (status) {
      case 'New': return "Send intro email or make first call";
      case 'Contacted': return "Schedule a demo or send proposal to move to Qualified";
      case 'Qualified': return "Send pricing, close the deal to Convert";
      case 'Converted': return "Send onboarding email, ask for referral to retain";
      default: return "Review lead status";
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading insights...</div>;

  return (
    <div className={`p-8 max-w-[1400px] mx-auto space-y-10 ${refreshing ? 'opacity-50 transition-opacity' : 'opacity-100 transition-opacity duration-500'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Activity className="text-accent" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white animate-fade-in">Cross Insights</h1>
          </div>
          <p className="text-gray-500 max-w-2xl text-sm animate-fade-in">Actionable intelligence to move your pipeline forward.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-dark-card border border-dark-border hover:bg-dark-hover text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer animate-fade-in"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* SECTION A: Warning Alerts */}
      {warnings.length > 0 && (
        <section className="space-y-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" /> Warning Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warnings.map(w => (
              <div 
                key={w.id} 
                className={`p-5 rounded-xl border flex flex-col justify-between min-h-[140px] animate-slow-pulse ${
                  w.warningType === 'red' 
                    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                    : 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                }`}
              >
                <div>
                  <h3 className="font-bold text-white mb-1">{w.name}</h3>
                  <p className={`text-sm ${w.warningType === 'red' ? 'text-red-300' : 'text-amber-300'}`}>
                    Stuck in {w.status} for {w.daysStuck} days
                  </p>
                </div>
                <button className={`mt-4 self-start px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  w.warningType === 'red' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-dark-bg'
                }`}>
                  Take Action
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION B: Journey Suggestions */}
      <section className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Journey Suggestions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.filter(l => l.status !== 'Lost').slice(0, 6).map((lead) => {
            const currentIndex = PIPELINE_STEPS.indexOf(lead.status);
            return (
              <div key={lead.id} className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-dark-border hover:bg-dark-hover/50 transition-colors">
                <h3 className="font-bold text-white mb-4">{lead.name}</h3>
                
                {/* Pipeline visual */}
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-dark-border z-0" />
                  {PIPELINE_STEPS.map((step, idx) => {
                    const isPassed = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-1 bg-dark-card/80 px-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isCurrent ? 'border-accent bg-accent shadow-[0_0_10px_rgba(132,204,22,0.5)]' :
                          isPassed ? 'border-accent bg-accent' :
                          'border-dark-border bg-dark-bg'
                        }`} />
                        <span className={`text-[10px] font-bold ${isCurrent ? 'text-accent' : isPassed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-dark-bg border border-dark-border p-3 rounded-lg flex items-start gap-2">
                  <ChevronRight size={16} className="text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-300">{getJourneySuggestion(lead.status)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION C: Real-time Score + Action Panel */}
      <section className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Target size={16} className="text-accent" /> Real-time Score & Action
        </h2>
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-dark-border bg-dark-hover/30">
                  <th className="px-5 py-4">Lead</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Live Score</th>
                  <th className="px-5 py-4">Smart Action Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {leads.filter(l => l.status !== 'Lost').map((lead) => (
                  <tr key={lead.id} className="border-b border-dark-border last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-200">{lead.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-dark-hover text-gray-300 border-dark-border">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-300">{getActionText(lead.score, lead.status)}</p>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No leads found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CrossInsights;
