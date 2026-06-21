import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LeadModal = ({ isOpen, onClose, lead, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    source: 'Website',
    status: 'New',
    notes: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        source: lead.source || 'Website',
        status: lead.status || 'New',
        notes: lead.notes || ''
      });
    } else {
      setFormData({ name: '', email: '', source: 'Website', status: 'New', notes: '' });
    }
  }, [lead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="animate-slide-up bg-dark-card border border-dark-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-dark-border">
          <h3 className="text-lg font-bold text-white">
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h3>
          <button 
            onClick={onClose} 
            type="button"
            className="text-gray-500 hover:text-gray-300 hover:bg-white/5 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="dark-input" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="dark-input" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Source</label>
              <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. Website" className="dark-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="dark-input cursor-pointer">
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="dark-input resize-none" />
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 border border-dark-border rounded-lg hover:bg-white/5 hover:text-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg shadow-lg shadow-accent/20 transition-all cursor-pointer"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
