import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import LeadModal from '../components/LeadModal';
import ScoreBadge from '../components/ScoreBadge';
import LastTouchedBadge from '../components/LastTouchedBadge';
import { Search, Inbox, Edit2, Trash2, Plus } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchLeads(); }, []);

  const openEditModal = (lead) => { setCurrentLead(lead); setIsModalOpen(true); };

  const handleSaveLead = async (leadData) => {
    try {
      if (currentLead) {
        await api.put(`/leads/${currentLead.id}`, leadData);
      } else {
        await api.post('/leads', leadData);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) { console.error(err); alert('Failed to save lead'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try { await api.delete(`/leads/${id}`); fetchLeads(); }
      catch (err) { console.error(err); alert('Failed to delete lead'); }
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      showToast("No leads to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Status", "Source", "Notes", "Date Added"];
    
    const rows = filteredLeads.map(lead => {
      const escape = (str) => {
        if (!str) return "-";
        const cleanStr = String(str);
        if (cleanStr.includes(",")) {
          return `"${cleanStr.replace(/"/g, '""')}"`;
        }
        return cleanStr;
      };

      const dateAdded = lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "-";

      return [
        escape(lead.name),
        escape(lead.email),
        escape(lead.phone),
        escape(lead.status),
        escape(lead.source),
        escape(lead.notes),
        escape(dateAdded)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${formattedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-gray-500">Loading leads...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 relative">
      
      {toastMessage && (
        <div className="absolute top-0 right-8 z-50 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-md shadow-xl text-sm font-medium animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Lead Management</h1>
          <p className="text-sm text-gray-500">Manage all your customer contacts and pipelines.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="border border-accent text-accent hover:bg-accent hover:text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          ⬇ Export CSV
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-dark-border flex flex-col sm:flex-row gap-3 justify-between items-center bg-dark-hover/30">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-input border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 bg-dark-input border border-dark-border rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-accent appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-dark-border bg-dark-hover/10">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Score</th>
                <th className="px-5 py-4">Last Touched</th>
                <th className="px-5 py-4">Notes</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-dark-hover rounded-full flex items-center justify-center mb-4 border border-dark-border">
                        <Inbox size={32} className="text-gray-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-300 mb-1">No leads found</h3>
                      <p className="text-sm text-gray-600">Try adjusting your search or filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-dark-border last:border-b-0 hover:bg-white/[0.02] group">
                    <td className="px-5 py-4 text-sm font-medium text-gray-200">{lead.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{lead.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{lead.source}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
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
                    <td className="px-5 py-4">
                      <LastTouchedBadge date={lead.last_contacted_at} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 truncate max-w-[220px]">{lead.notes || '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(lead)}
                          className="p-2 text-accent border border-accent/20 hover:bg-accent/10 rounded-md transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-red-400 border border-red-400/20 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lead={currentLead} 
        onSave={handleSaveLead} 
      />
    </div>
  );
};

export default Leads;
