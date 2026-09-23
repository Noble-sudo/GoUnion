import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Plus, X } from 'lucide-react';
import { api } from '../../services/api';
import { useConfirm } from '../ui/ConfirmProvider';

export const EventsTab = ({ groupId, isAdmin }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', startTime: '' });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['group_events', groupId],
    queryFn: () => api.groups.getEvents(groupId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.groups.createEvent(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['group_events', groupId]);
      setIsModalOpen(false);
      setNewEvent({ title: '', description: '', location: '', startTime: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId) => api.groups.deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries(['group_events', groupId])
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ eventId, status }) => api.groups.rsvpEvent(eventId, status),
    onSuccess: () => queryClient.invalidateQueries(['group_events', groupId])
  });

  if (isLoading) {
    return <div className="py-24 text-center text-white/50">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition"
          >
            <Plus size={16} /> Create Event
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-24 text-center">
          <Calendar className="mx-auto mb-4 text-white/20" size={32} />
          <h3 className="text-lg font-bold text-white mb-2">No upcoming events</h3>
          <p className="text-white/40 text-sm">Events for this community will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((ev) => (
            <div key={ev.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-serif text-xl font-bold text-white">{ev.title}</h4>
                {isAdmin && (
                  <button
                    onClick={() => {
                      confirm({ title: 'Delete Event', message: 'Are you sure you want to delete this event?', isDanger: true }).then(yes => { if (yes) deleteMutation.mutate(ev.id); })
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-white/30 hover:text-red-400 transition"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm text-white/60 mb-4 flex-1">{ev.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Calendar size={14} />
                  {new Date(ev.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                {ev.location && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <MapPin size={14} />
                    {ev.location}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Users size={14} />
                  {ev.attendees?.length || 0} attending
                </div>
              </div>

              <button
                onClick={() => rsvpMutation.mutate({ eventId: ev.id, status: ev.isAttending ? 'not_going' : 'going' })}
                disabled={rsvpMutation.isPending}
                className={`w-full rounded-xl py-2.5 text-sm font-bold transition \${
                  ev.isAttending 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-[var(--rc-go)]/10 text-[var(--rc-go)] border border-[var(--rc-go)]/20 hover:bg-[var(--rc-go)]/20'
                }`}
              >
                {ev.isAttending ? 'Attending (Click to Cancel)' : "RSVP (I'm Going)"}
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-[#111113] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Event Title</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-white/20 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
                <textarea 
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-white/20 mt-1 min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Location</label>
                <input 
                  type="text" 
                  value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-white/20 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={newEvent.startTime}
                  onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-white/20 mt-1"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <button 
                onClick={() => createMutation.mutate(newEvent)}
                disabled={!newEvent.title || !newEvent.startTime || createMutation.isPending}
                className="w-full mt-4 rounded-xl bg-white text-black py-3 font-bold disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
