import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import ScoreBadge from '../components/ScoreBadge';
import LastTouchedBadge from '../components/LastTouchedBadge';
import { Inbox, Edit2, Trash2 } from 'lucide-react';

const COLUMNS = [
  { id: 'New', title: 'New', color: 'border-blue-500', text: 'text-blue-500' },
  { id: 'Contacted', title: 'Contacted', color: 'border-amber-500', text: 'text-amber-500' },
  { id: 'Qualified', title: 'Qualified', color: 'border-purple-500', text: 'text-purple-500' },
  { id: 'Converted', title: 'Converted', color: 'border-accent', text: 'text-accent' },
  { id: 'Lost', title: 'Lost', color: 'border-red-500', text: 'text-red-500' }
];

const Kanban = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load leads', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Optimistic Update
    const previousLeads = [...leads];
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));

    try {
      const leadToUpdate = leads.find(l => l.id === leadId);
      await api.put(`/leads/${leadId}`, { ...leadToUpdate, status: newStatus });
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      setLeads(previousLeads);
      showToast('Failed to update status', true);
    }
  };

  if (loading) {
    return (
      <div className="p-8 h-full flex flex-col gap-6 max-w-[1500px] mx-auto overflow-hidden">
        <div>
          <div className="h-8 w-48 bg-dark-card rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-dark-card rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-[280px] shrink-0 bg-dark-card/50 rounded-xl border border-dark-border animate-pulse h-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col gap-6 max-w-[1500px] mx-auto overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 right-8 z-50 px-4 py-2 rounded-md shadow-xl text-sm font-medium animate-fade-in transition-colors ${
          toast.isError ? 'bg-red-500/90 text-white' : 'bg-accent text-dark-bg'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Kanban Board</h1>
        <p className="text-sm text-gray-500">Drag and drop leads to update their status.</p>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full items-start pb-4">
            
            {COLUMNS.map(col => {
              const columnLeads = leads.filter(l => l.status === col.id);
              
              return (
                <div key={col.id} className="w-[280px] shrink-0 flex flex-col max-h-full">
                  {/* Column Header */}
                  <div className={`bg-dark-card border border-dark-border rounded-t-xl border-t-4 ${col.color} p-4 flex items-center justify-between`}>
                    <h3 className="font-semibold text-white">{col.title}</h3>
                    <span className="bg-dark-bg text-gray-400 text-xs font-bold px-2 py-1 rounded-full border border-dark-border">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 bg-dark-card/50 border-x border-b border-dark-border rounded-b-xl p-3 overflow-y-auto min-h-[150px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-dark-hover/30' : ''
                        }`}
                      >
                        {columnLeads.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-24 flex flex-col items-center justify-center text-gray-600">
                            <Inbox size={24} className="mb-2 opacity-50" />
                            <span className="text-xs">No leads here</span>
                          </div>
                        )}
                        
                        {columnLeads.map((lead, index) => (
                          <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-dark-bg border p-4 rounded-xl mb-3 group cursor-grab active:cursor-grabbing transition-all ${
                                  snapshot.isDragging 
                                    ? 'border-accent shadow-lg shadow-accent/10 scale-105 opacity-90' 
                                    : 'border-dark-border hover:border-accent/50 hover:-translate-y-0.5 shadow-sm'
                                }`}
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-dark-hover flex items-center justify-center shrink-0 border border-dark-border text-xs font-bold text-gray-300">
                                    {lead.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-gray-200 truncate">{lead.name}</h4>
                                    <p className="text-[11px] text-gray-500 truncate">{lead.email}</p>
                                  </div>
                                  <div className="shrink-0">
                                    <ScoreBadge score={lead.score} />
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <span className="text-[10px] bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">
                                    {lead.source}
                                  </span>
                                </div>
                                
                                {lead.notes && (
                                  <p className="text-xs text-gray-400 truncate mb-3 border-l-2 border-dark-border pl-2">
                                    {lead.notes}
                                  </p>
                                )}

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-border/50">
                                  <LastTouchedBadge date={lead.last_contacted_at} variant="short" />
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 text-gray-400 hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Edit (Coming soon)">
                                      <Edit2 size={12} />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete (Coming soon)">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Kanban;
