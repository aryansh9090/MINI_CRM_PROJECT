import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import {
  BrainCircuit, RefreshCw, Zap, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Users, ArrowRight
} from 'lucide-react';

const AiInsights = () => {
  const [leads, setLeads] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leadsLoading, setLeadsLoading] = useState(true);

  useEffect(() => {
    api.get('/leads')
      .then(res => { setLeads(res.data); setLeadsLoading(false); })
      .catch(err => { console.error(err); setLeadsLoading(false); });
  }, []);

  // ─── Smart local summary (no API needed) ────────
  const summary = useMemo(() => {
    if (leads.length === 0) return null;

    const byStatus = {};
    leads.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });

    const converted = byStatus['Converted'] || 0;
    const contacted = byStatus['Contacted'] || 0;
    const newLeads = byStatus['New'] || 0;
    const qualified = byStatus['Qualified'] || 0;
    const lost = byStatus['Lost'] || 0;
    const conversionRate = Math.round((converted / leads.length) * 100) || 0;
    const stuckCount = contacted + newLeads;

    let untouchedCount = 0;
    const now = new Date();
    leads.forEach(l => {
      if (!l.last_contacted_at) {
        untouchedCount++;
      } else {
        const diffDays = Math.floor((now - new Date(l.last_contacted_at)) / (1000 * 60 * 60 * 24));
        if (diffDays > 5) untouchedCount++;
      }
    });

    // Best source
    const srcMap = {};
    leads.forEach(l => { srcMap[l.source] = (srcMap[l.source] || 0) + 1; });
    const bestSource = Object.entries(srcMap).sort((a, b) => b[1] - a[1])[0];

    // Actionable tips
    const tips = [];
    if (stuckCount > 0) {
      tips.push(`${stuckCount} lead${stuckCount > 1 ? 's are' : ' is'} stuck at New/Contacted — follow up with them this week to move them forward.`);
    }
    if (untouchedCount > 0) {
      tips.push(`${untouchedCount} lead${untouchedCount > 1 ? 's' : ''} haven't been touched in 5+ days — follow up now.`);
    }
    if (lost > 0) {
      tips.push(`You've lost ${lost} lead${lost > 1 ? 's' : ''}. Review rejection reasons and consider a re-engagement email campaign.`);
    }
    if (conversionRate < 30 && leads.length >= 3) {
      tips.push(`Your conversion rate is ${conversionRate}% — aim for 30%+ by qualifying leads faster and following up within 24 hours.`);
    }
    if (bestSource) {
      tips.push(`"${bestSource[0]}" is your top source with ${bestSource[1]} leads. Double down on this channel for best ROI.`);
    }
    if (qualified > 0) {
      tips.push(`${qualified} qualified lead${qualified > 1 ? 's are' : ' is'} ready to close. Prioritize sending proposals this week.`);
    }

    return {
      total: leads.length,
      converted,
      contacted,
      newLeads,
      qualified,
      lost,
      conversionRate,
      stuckCount,
      bestSource,
      tips: tips.slice(0, 5),
    };
  }, [leads]);

  // ─── Claude Deep Analysis (via secure backend) ───────────────────────
  const generateInsights = async () => {
    setLoading(true);
    setError('');

    try {
      // API key stays on the server — this call is safe
      const res = await api.post('/aiinsights/analyze', { leads });
      setInsights(res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to generate insights.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 5) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  if (leadsLoading) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto space-y-6">
        <div className="h-8 w-48 bg-dark-card rounded animate-pulse" />
        <div className="h-40 bg-dark-card rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <BrainCircuit className="text-accent" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          </div>
          <p className="text-gray-500 max-w-2xl text-sm">Instant pipeline intelligence + deep analysis powered by Claude.</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading || leads.length === 0}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-accent/25 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Deep Analysis (Claude AI)'}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 1: INSTANT LOCAL INSIGHTS (no API)
         ═══════════════════════════════════════════════ */}
      {summary && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Instant Pipeline Summary</h2>

          {/* Quick Stats Banner */}
          <div className="bg-gradient-to-r from-dark-card via-dark-hover/50 to-dark-card border border-dark-border rounded-xl p-6">
            <p className="text-gray-200 text-base leading-relaxed">
              You have <span className="text-white font-bold">{summary.total} leads</span> total —{' '}
              <span className="text-accent font-semibold">{summary.converted} converted</span>,{' '}
              <span className="text-amber-400 font-semibold">{summary.contacted} contacted</span>,{' '}
              <span className="text-blue-400 font-semibold">{summary.newLeads} new</span>,{' '}
              <span className="text-purple-400 font-semibold">{summary.qualified} qualified</span>, and{' '}
              <span className="text-red-400 font-semibold">{summary.lost} lost</span>.
              {summary.stuckCount > 0 && (
                <span className="text-amber-300"> ⚠ {summary.stuckCount} lead{summary.stuckCount > 1 ? 's are' : ' is'} stuck and need{summary.stuckCount === 1 ? 's' : ''} follow-up!</span>
              )}
            </p>
            <div className="mt-3 flex items-center gap-6 text-sm">
              <span className="text-gray-500">Conversion Rate: <span className={`font-bold ${summary.conversionRate >= 30 ? 'text-accent' : 'text-amber-400'}`}>{summary.conversionRate}%</span></span>
              {summary.bestSource && (
                <span className="text-gray-500">Best Source: <span className="font-bold text-accent">{summary.bestSource[0]}</span></span>
              )}
            </div>
          </div>

          {/* Actionable Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-dark-card border border-dark-border rounded-xl p-4 hover:bg-dark-hover/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight size={12} className="text-accent" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {leads.length === 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-16 flex flex-col items-center text-center">
          <Users size={48} className="text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-300 mb-2">No leads yet</h2>
          <p className="text-gray-500 max-w-md">Add some leads first to unlock AI-powered insights.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          SECTION 2: CLAUDE DEEP ANALYSIS (on button click)
         ═══════════════════════════════════════════════ */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!insights && !loading && leads.length > 0 && (
        <div className="bg-dark-card border border-dashed border-dark-border rounded-xl p-10 flex flex-col items-center text-center">
          <Zap size={40} className="text-gray-600 mb-3" />
          <h2 className="text-base font-bold text-gray-300 mb-1">Want deeper analysis?</h2>
          <p className="text-gray-500 text-sm max-w-md">Click "Deep Analysis" above to let Claude AI evaluate each lead's health score, suggest next actions, and build a customized follow-up plan.</p>
        </div>
      )}

      {insights && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pt-2 border-t border-dark-border">Claude AI Deep Analysis</h2>

          {/* Pipeline Health + Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-dark-card to-dark-hover border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-accent" />
                <h3 className="text-white font-semibold">Pipeline Health</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{insights.pipelineHealth}</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-accent" />
                <h3 className="text-white font-semibold">Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {insights.recommendations?.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Individual Leads Analysis */}
          <h3 className="text-white font-semibold pt-4 border-t border-dark-border">Lead-by-Lead Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {insights.leadsAnalysis?.map((analysis) => {
              const lead = leads.find(l => l.id == analysis.id);
              if (!lead) return null;

              return (
                <div key={analysis.id} className="bg-dark-card border border-dark-border rounded-xl p-5 hover:bg-dark-hover transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-medium text-sm">{lead.name}</h4>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                    </div>
                    <div className={`px-2 py-1 border rounded-md font-bold text-sm ${getHealthColor(analysis.healthScore)}`}>
                      {analysis.healthScore}/10
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Behavior</p>
                      <p className="text-gray-300">{analysis.behaviorSummary}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> Follow Up</p>
                      <p className="text-gray-300">{analysis.bestTimeToFollowUp}</p>
                    </div>
                    {analysis.suggestedAction && (
                      <div className="pt-2 border-t border-dark-border/50">
                        <p className="text-xs text-accent font-semibold flex items-center gap-1"><ArrowRight size={12}/> {analysis.suggestedAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default AiInsights;
