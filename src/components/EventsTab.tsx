import React, { useState } from 'react';
import { Event } from '../types';
import { Calendar, Plus, Trash2, Edit, X, MapPin, Clock, Info } from 'lucide-react';

interface EventsTabProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  isAdm: boolean;
}

export function EventsTab({ events, onAddEvent, onUpdateEvent, onDeleteEvent, isAdm }: EventsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  // Sort events by date ascending
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const openAddModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('Templo Principal');
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setLocation(event.location);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const data = { title, description, date, location };

    if (editingEvent) {
      onUpdateEvent({ ...editingEvent, ...data });
    } else {
      onAddEvent(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Controls */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-xs">Calendário de Eventos</h3>
            <p className="text-[10px] text-slate-500">Confira a data de cada culto, festa, assembleia e congresso</p>
          </div>
        </div>

        {isAdm && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-transparent rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Criar Evento</span>
          </button>
        )}
      </div>

      {/* Events Timeline */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-400 space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <Calendar className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-xs">Nenhum evento agendado ou programado.</p>
          </div>
        ) : (
          sortedEvents.map((event) => {
            const evDate = new Date(event.date);
            const isPast = evDate.getTime() < Date.now();
            
            return (
              <div 
                key={event.id}
                className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-stretch relative ${
                  isPast ? 'opacity-65 border-slate-200 bg-slate-50/55' : 'border-slate-200'
                }`}
              >
                {/* Date Highlight Box */}
                <div className="flex md:flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-lg p-3 min-w-[75px] shrink-0 text-center gap-1.5 md:gap-0.5 shadow-sm">
                  <span className="text-xl font-black font-sans leading-none">
                    {evDate.getDate().toString().padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider pt-0.5 opacity-90">
                    {evDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-[9px] opacity-75 hidden md:block pt-0.5 font-mono">
                    {evDate.getFullYear()}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug">{event.title}</h4>
                      {isPast && (
                        <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Encerrado
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{event.description}</p>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5 text-slate-500 text-xs">
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 font-sans text-[10px] font-medium">
                      <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      {evDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'h'}
                    </span>

                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 text-[10px] font-medium">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* ADM Controls Overlay */}
                {isAdm && (
                  <div className="flex md:flex-col justify-end gap-1.5 shrink-0 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0 md:pl-3.5 md:border-l items-center md:justify-center">
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-1 px-2 border border-slate-200 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o evento "${event.title}"?`)) {
                          onDeleteEvent(event.id);
                        }
                      }}
                      className="p-1 px-2 border border-red-100 rounded text-red-500 hover:text-white hover:bg-red-500 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Apagar
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CRUD Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {editingEvent ? 'Editar Evento Ministrado' : 'Criar Novo Evento'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-550 text-slate-600 uppercase tracking-wider mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto da Vitória"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-650 text-slate-650 mb-1 tracking-wider uppercase">
                  Descrição / Detalhes
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções, quem prega, cantores ou propósitos do culto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-35 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Data e Hora do Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Localização / Sala
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Templo Principal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[10px] text-blue-900 flex gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Criar esse evento notificará todos os irmãos da igreja com alertas e guardará o registro no cabeçalho do portal!</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  {editingEvent ? 'Atualizar' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
