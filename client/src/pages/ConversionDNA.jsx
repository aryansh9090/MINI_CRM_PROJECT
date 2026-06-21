import React, { useState, useEffect } from 'react';
import { Dna, Zap, TrendingUp, Target, CheckCircle, XCircle, RefreshCw, Clock, Globe } from 'lucide-react';
import api from '../api';

const ConversionDNA = () => {
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const [allScores, setAllScores] = useState([]);

  const fetchDnaProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/conversiondna/profile');
      setProfile(res.data);
      
      const leadsRes = await api.get('/leads');
      const leadsList = leadsRes.data || [];
      setLeads(leadsList);

      if (res.data && res.data.hasData) {
        // Fetch all scores
        const scores = await Promise.all(
          leadsList.map(async (lead) => {
            try {
              const scoreRes = await api.get('/conversiondna/score/' + lead.id);
              return { lead, result: scoreRes.data };
            } catch (e) {
              return { lead, result: { score: 0, verdict: 'Needs Nurturing' } };
            }
          })
        );
        scores.sort((a, b) => b.result.score - a.result.score);
        setAllScores(scores);
      } else {
        setAllScores([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDnaProfile();
  }, []);

  const handleScanLead = async (leadId) => {
    setSelectedLeadId(leadId);
    if (!leadId) {
      setScanResult(null);
      return;
    }
    setIsScanning(true);
    try {
      const res = await api.get('/conversiondna/score/' + leadId);
      setScanResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'High Match') return 'text-accent border-accent/20 bg-accent/10 shadow-[0_0_15px_rgba(132,204,22,0.2)]';
    if (verdict === 'Possible Convert') return 'text-amber-500 border-amber-500/20 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    return 'text-red-400 border-red-500/20 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
  };

  // SVG Circle calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = scanResult ? circumference - (scanResult.score / 100) * circumference : circumference;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in relative pb-32 text-gray-300">
      
      {/* SECTION A - Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Dna className="text-accent animate-[slow-pulse_3s_ease-in-out_infinite]" size={32} />
            Conversion DNA
          </h1>
          <p className="text-gray-400 mt-2">
            Understand what makes your leads convert — and replicate it
          </p>
        </div>
        <button 
          onClick={fetchDnaProfile}
          disabled={isLoading}
          className="p-3 bg-dark-card border border-dark-border rounded-xl hover:bg-dark-hover transition-colors text-gray-400 hover:text-white"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {!profile || !profile.hasData ? (
        <div className="p-12 border border-dark-border bg-dark-card rounded-2xl text-center flex flex-col items-center gap-4 animate-slide-up">
          <Target size={48} className="text-gray-600" />
          <h3 className="text-xl font-bold text-white">No conversions yet</h3>
          <p className="text-gray-500 max-w-md">Start closing deals to unlock your Conversion DNA. The more you convert, the smarter the insights become.</p>
        </div>
      ) : (
        <>
          {/* SECTION B - DNA Profile Card */}
          <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-dark-card border border-accent/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(132,204,22,0.15)] flex flex-col md:flex-row items-center gap-12">
              <div className="flex flex-col items-center gap-2">
                <p className="text-gray-400 font-medium">Conversion Rate</p>
                <div className="text-6xl font-bold text-white flex items-baseline">
                  {profile.conversion_rate}<span className="text-3xl text-accent">%</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-dark-bg border border-dark-border p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg text-accent"><Globe size={20}/></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Top Source</p>
                    <p className="text-lg font-bold text-white">{profile.most_common_source}</p>
                  </div>
                </div>
                <div className="bg-dark-bg border border-dark-border p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg text-accent"><Clock size={20}/></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg Time</p>
                    <p className="text-lg font-bold text-white">{profile.avg_days_to_convert} Days</p>
                  </div>
                </div>
                <div className="bg-dark-bg border border-dark-border p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg text-accent"><TrendingUp size={20}/></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Notes Impact</p>
                    <p className="text-lg font-bold text-white">{profile.notes_pattern}%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION C - Winning Traits */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Your Winning Pattern</h2>
              <div className="space-y-4">
                {profile.winning_traits.map((trait, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-dark-card border border-accent/20 rounded-xl hover:shadow-[0_0_15px_rgba(132,204,22,0.1)] transition-all animate-slide-up"
                    style={{ animationDelay: (200 + (idx * 100)) + 'ms' }}
                  >
                    <CheckCircle className="text-accent shrink-0" size={24} />
                    <p className="text-gray-200">{trait}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION D - Top Keywords */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Words That Close Deals</h2>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-[calc(100%-44px)] flex flex-col justify-center items-center animate-slide-up" style={{ animationDelay: '400ms' }}>
                <p className="text-sm text-gray-400 mb-8 text-center">These words appear most in your converted leads' notes</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {profile.top_keywords && profile.top_keywords.map((word, idx) => {
                    const sizes = ['text-2xl px-6 py-3', 'text-xl px-5 py-2.5', 'text-lg px-4 py-2', 'text-base px-3 py-1.5', 'text-sm px-3 py-1.5'];
                    return (
                      <div key={idx} className={"bg-accent text-dark-bg font-bold rounded-full shadow-[0_0_15px_rgba(132,204,22,0.3)] flex items-center justify-center " + sizes[idx]}>
                        #{word}
                      </div>
                    )
                  })}
                  {profile.top_keywords.length === 0 && <span className="text-gray-600 italic">No notes data yet</span>}
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION E - Lead DNA Match Scanner */}
            <section className="space-y-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <h2 className="text-xl font-semibold text-white">Scan a Lead</h2>
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-[calc(100%-44px)]">
                <select 
                  className="dark-input w-full appearance-none bg-dark-input border-dark-border focus:border-accent mb-8"
                  value={selectedLeadId}
                  onChange={(e) => handleScanLead(e.target.value)}
                >
                  <option value="">-- Choose a Lead --</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.name}</option>
                  ))}
                </select>

                {isScanning ? (
                  <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-accent" size={32} /></div>
                ) : scanResult ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-800" />
                        <circle 
                          cx="80" cy="80" r={radius} 
                          stroke="currentColor" 
                          strokeWidth="12" 
                          fill="transparent" 
                          className="text-accent transition-all duration-1000 ease-out"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{scanResult.score}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Match</span>
                      </div>
                    </div>
                    
                    <div className={"px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border " + getVerdictColor(scanResult.verdict)}>
                      {scanResult.verdict}
                    </div>

                    <div className="w-full space-y-3">
                      {scanResult.breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border">
                          <div className="flex items-center gap-3">
                            {item.met ? <CheckCircle size={16} className="text-accent" /> : <XCircle size={16} className="text-gray-600" />}
                            <span className={item.met ? "text-gray-200 text-sm" : "text-gray-500 text-sm"}>{item.criteria}</span>
                          </div>
                          <span className={item.met ? "font-bold text-accent" : "font-bold text-gray-600"}>+{item.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-600 flex flex-col items-center gap-2">
                    <Target size={32} />
                    <p>Select a lead to view their DNA match</p>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION F - All Leads DNA Scores */}
            <section className="space-y-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
              <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
              <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden h-[calc(100%-44px)] flex flex-col">
                <div className="p-4 border-b border-dark-border bg-dark-bg flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ranked Leads</span>
                </div>
                <div className="divide-y divide-dark-border overflow-y-auto flex-1">
                  {allScores.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading scores...</div>
                  ) : (
                    allScores.map((item, idx) => (
                      <div key={item.lead.id} className="p-4 flex flex-col gap-3 hover:bg-dark-hover transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-gray-300 font-bold shrink-0 text-sm relative">
                              {idx === 0 && <span className="absolute -top-2 -left-2 text-[16px]">🏆</span>}
                              {item.lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm flex items-center gap-2">
                                {item.lead.name}
                                <span className="px-2 py-0.5 rounded text-[10px] bg-dark-bg border border-dark-border text-gray-400">
                                  {item.lead.status}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className={"px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border " + getVerdictColor(item.result.verdict)}>
                            {item.result.score} - {item.result.verdict}
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent transition-all duration-1000" 
                            style={{ width: item.result.score + '%' }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversionDNA;
