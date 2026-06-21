import React, { useState, useEffect } from 'react';
import { Clock, Zap, TrendingUp, Sun, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';

const formatHour = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

const formatTimeRange = (hour) => {
  const nextHour = (hour + 1) % 24;
  return `${formatHour(hour)} - ${formatHour(nextHour)}`;
};

const GoldenHour = () => {
  const [topHours, setTopHours] = useState([]);
  const [allHoursData, setAllHoursData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadBestTimes, setLeadBestTimes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchGoldenHourData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/goldenhour/best-times');
      setTopHours(res.data.topHours || []);
      
      // Prepare 24h data
      const hoursMap = new Map();
      (res.data.allHours || []).forEach(item => {
        hoursMap.set(item.hour_of_day, item.success_count);
      });
      
      const chartData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        label: formatHour(i),
        successes: hoursMap.get(i) || 0
      }));
      setAllHoursData(chartData);

      // Fetch leads for the form and the per-lead section
      const leadsRes = await api.get('/leads');
      const leadsList = leadsRes.data || [];
      setLeads(leadsList);

      // Fetch best time for each lead
      const bestTimes = {};
      await Promise.all(
        leadsList.map(async (lead) => {
          try {
            const leadTimeRes = await api.get(`/goldenhour/lead/${lead.id}`);
            if (leadTimeRes.data && leadTimeRes.data.hour_of_day !== undefined) {
              bestTimes[lead.id] = formatTimeRange(leadTimeRes.data.hour_of_day);
            }
          } catch (e) {
            console.error(e);
          }
        })
      );
      setLeadBestTimes(bestTimes);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldenHourData();
  }, []);

  const handleLogAttempt = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    setIsSubmitting(true);
    try {
      await api.post('/goldenhour/log', {
        lead_id: parseInt(selectedLeadId),
        success: isSuccess
      });
      setToastMsg('Contact attempt logged!');
      setTimeout(() => setToastMsg(''), 3000);
      setSelectedLeadId('');
      setIsSuccess(true);
      fetchGoldenHourData(); // refresh data
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tick marks for x-axis
  const customTicks = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in relative pb-32">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 bg-accent text-dark-bg px-6 py-3 rounded-lg shadow-lg font-medium flex items-center gap-2 animate-slide-up z-50">
          <CheckCircle size={18} />
          {toastMsg}
        </div>
      )}

      {/* SECTION A - Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sun className="text-amber-500 animate-[slow-pulse_3s_ease-in-out_infinite]" size={32} />
            Golden Hour Predictor
          </h1>
          <p className="text-gray-400 mt-2">
            Discover the best times to contact your leads based on past success patterns
          </p>
        </div>
        <button 
          onClick={fetchGoldenHourData}
          disabled={isLoading}
          className="p-3 bg-dark-card border border-dark-border rounded-xl hover:bg-dark-hover transition-colors text-gray-400 hover:text-white"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* SECTION B - Best Hours Overview */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Zap className="text-amber-500" size={20} />
          Top 3 Best Hours
        </h2>
        
        {topHours.length === 0 ? (
          <div className="p-8 border border-dark-border bg-dark-card rounded-2xl text-center text-gray-500">
            Start contacting leads to unlock your golden hours.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topHours.map((th, idx) => (
              <div 
                key={idx} 
                className="bg-dark-card border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center gap-2 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-amber-500/80 mb-2">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {formatTimeRange(th.hour_of_day)}
                </h3>
                <p className="text-sm text-gray-400">
                  {th.success_count} successful {th.success_count === 1 ? 'contact' : 'contacts'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION C - 24 Hour Heatmap */}
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Clock className="text-accent" size={20} />
          24 Hour Heatmap
        </h2>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allHoursData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="hour" 
                ticks={customTicks}
                tickFormatter={formatHour}
                stroke="#3f3f46" 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#3f3f46" 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#1f2937' }}
                contentStyle={{ backgroundColor: '#141414', borderColor: '#1F1F1F', borderRadius: '8px', color: '#fff' }}
                formatter={(value, name, props) => [
                  `${value} successes`, 
                  `${props.payload.label}`
                ]}
                labelStyle={{ display: 'none' }}
              />
              <Bar dataKey="successes" radius={[4, 4, 0, 0]}>
                {allHoursData.map((entry, index) => {
                  let color = '#2c2c2c'; // dark gray for 0
                  if (entry.successes >= 3) {
                    color = '#84CC16'; // bright lime green
                  } else if (entry.successes >= 1) {
                    color = '#f59e0b'; // amber
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SECTION D - Per Lead Best Time */}
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold text-white">Individual Lead Patterns</h2>
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No leads available.</div>
          ) : (
            <div className="divide-y divide-dark-border max-h-[400px] overflow-y-auto">
              {leads.map((lead, idx) => {
                const bestTime = leadBestTimes[lead.id];
                return (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-dark-hover transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-dark-border flex items-center justify-center text-gray-300 font-bold shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${bestTime ? 'bg-accent/10 text-accent border-accent/20' : 'bg-gray-800/30 text-gray-500 border-gray-800'}`}>
                      {bestTime ? `Best time: ${bestTime}` : 'No data yet'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION E - Log Contact Attempt */}
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-xl font-semibold text-white">Log Contact Attempt</h2>
        <form onSubmit={handleLogAttempt} className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-end">
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Lead</label>
            <select 
              className="dark-input w-full appearance-none bg-dark-input border-dark-border focus:border-accent"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose a Lead --</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>{lead.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto h-[42px]">
            <button
              type="button"
              onClick={() => setIsSuccess(true)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isSuccess ? 'bg-accent/20 border-accent text-accent' : 'bg-dark-input border-dark-border text-gray-500 hover:text-gray-300'}`}
            >
              <CheckCircle size={16} /> Successful
            </button>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${!isSuccess ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-dark-input border-dark-border text-gray-500 hover:text-gray-300'}`}
            >
              <XCircle size={16} /> Unsuccessful
            </button>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !selectedLeadId}
            className="w-full md:w-auto px-6 h-[42px] bg-accent hover:bg-accent-hover text-dark-bg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? 'Logging...' : 'Log Attempt'}
          </button>
        </form>
      </section>

    </div>
  );
};

export default GoldenHour;
