import React, { useState } from 'react';
import { Announcement } from '../types';
import { Megaphone, Plus, Trash2, X, Clock, User, MessageCircle } from 'lucide-react';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  isAdm: boolean;
  currentUser: { name: string };
}

export function AnnouncementsTab({
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  isAdm,
  currentUser
}: AnnouncementsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddAnnouncement({
      title,
      content,
      authorName: currentUser.name
    });

    setTitle('');
    setContent('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4.5 w-4.5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-xs">Quadro de Recados</h3>
            <p className="text-[10px] text-slate-500">Avisos oficiais, convocações e novidades de nossa igreja</p>
          </div>
        </div>

        {isAdm && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
          >
            {isFormOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>Novo Recado</span>
          </button>
        )}
      </div>

      {/* Add Form (Expandable) */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-md transition-all">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-extrabold text-slate-800">Publicar Novo Comunicado</h4>
            <span className="bg-amber-100 text-amber-900 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
              Dispara Notificação Push!
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Título do Recado</label>
              <input
                type="text"
                required
                placeholder="Ex: Confirmação da Escola Bíblica de Férias"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mensagem Comunicado</label>
              <textarea
                required
                rows={3}
                placeholder="Digite o teor do aviso com datas, horários e orientações gerais..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-[11px] font-bold pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              Publicar Comunicado
            </button>
          </div>
        </form>
      )}

      {/* Recados List */}
      <div id="announcement-list" className="space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-250 border-slate-200 rounded-xl text-slate-400 space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <Megaphone className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-xs">Nenhum recado disponível no momento.</p>
            {isAdm && <p className="text-[10px] text-slate-500">Seja o primeiro a publicar usando o botão acima!</p>}
          </div>
        ) : (
          announcements.map((ann) => (
            <div 
              key={ann.id} 
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5 relative hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="bg-blue-50 p-2 rounded-lg shrink-0 mt-0.5">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{ann.title}</h4>
                    <div className="mt-0.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] text-slate-400 items-center">
                      <span className="flex items-center gap-1 font-bold text-slate-500">
                        <User className="h-3 w-3" />
                        {ann.authorName}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(ann.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdm && (
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o recado "${ann.title}"?`)) {
                        onDeleteAnnouncement(ann.id);
                      }
                    }}
                    className="p-1 px-1.5 border border-red-100 text-red-500 hover:text-white hover:bg-red-500 rounded text-[10px] font-bold inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                    title="Excluir Recado"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>

              <div id="announcement-body-content" className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap pl-0 sm:pl-9">
                {ann.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
