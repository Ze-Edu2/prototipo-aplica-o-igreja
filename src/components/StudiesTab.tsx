import React, { useState } from 'react';
import { Study } from '../types';
import { BookOpen, Plus, Trash2, Edit, ChevronDown, ChevronUp, User, Calendar, BookOpenCheck, X } from 'lucide-react';

interface StudiesTabProps {
  studies: Study[];
  onAddStudy: (study: Omit<Study, 'id' | 'date'>) => void;
  onUpdateStudy: (study: Study) => void;
  onDeleteStudy: (id: string) => void;
  isAdm: boolean;
  currentUser: { name: string };
}

export function StudiesTab({ studies, onAddStudy, onUpdateStudy, onDeleteStudy, isAdm, currentUser }: StudiesTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>("s-1"); // Open first study by default
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openAddModal = () => {
    setEditingStudy(null);
    setTitle('');
    setAuthor(currentUser.name);
    setCategory('Esboço de Pregação');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (study: Study) => {
    setEditingStudy(study);
    setTitle(study.title);
    setAuthor(study.author);
    setCategory(study.category);
    setContent(study.content);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const data = { title, author, category, content };

    if (editingStudy) {
      onUpdateStudy({ ...editingStudy, ...data });
    } else {
      onAddStudy(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-xs">Estudos & Esboços Teológicos</h3>
            <p className="text-[10px] text-slate-500">Desenvolva sua jornada de conhecimento bíblico semanal</p>
          </div>
        </div>

        {isAdm && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-transparent rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Estudo</span>
          </button>
        )}
      </div>

      {/* Studies Collapsible Accordion Grid */}
      <div className="space-y-3">
        {studies.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-400 space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <BookOpen className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-xs">Nenhum estudo publicado.</p>
          </div>
        ) : (
          studies.map((study) => {
            const isExpanded = expandedId === study.id;
            
            return (
              <div 
                key={study.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-blue-500/30 ring-1 ring-blue-500/10 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Accordion Trigger Header */}
                <div 
                  onClick={() => toggleExpand(study.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-blue-50 text-blue-700 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">
                        {study.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-mono">
                        <Calendar className="h-3 w-3" />
                        {new Date(study.date ? study.date + 'T00:00:00' : '').toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                      {study.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-450 text-slate-400" />
                      <span>Autor: <strong className="text-slate-600">{study.author}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* ADM buttons inside trigger container (stop propagation on click to avoid accordion expansion) */}
                    {isAdm && (
                      <div className="flex items-center gap-1 mr-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(study)}
                          className="p-1 px-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-600 transition-colors inline-flex items-center gap-0.5 text-[10px] font-semibold cursor-pointer"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir estudo "${study.title}"?`)) {
                              onDeleteStudy(study.id);
                            }
                          }}
                          className="p-1 px-1.5 border border-red-100 bg-white hover:bg-red-500 hover:text-white text-red-500 rounded transition-colors inline-flex items-center gap-0.5 text-[10px] font-semibold cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    )}

                    <div className="p-1 bg-slate-100 text-slate-500 rounded shrink-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Accordion Expandable Content Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-white transition-opacity duration-300">
                    <div className="prose max-w-none text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {study.content}
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        <BookOpenCheck className="h-3.5 w-3.5" />
                        Estudo disponível offline no celular
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CRUD Modal Dialogue */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {editingStudy ? 'Editar Estudo Bíblico' : 'Publicar Novo Estudo Bíblico'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Título do Estudo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Resumo de Romanos 8"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Categoria ou Tema *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
                  >
                    <option value="Escola Bíblica Dom.">Escola Bíblica Dom.</option>
                    <option value="Teologia Prática">Teologia Prática</option>
                    <option value="Crescimento Espiritual">Crescimento Espiritual</option>
                    <option value="Mordomia Cristã">Mordomia Cristã</option>
                    <option value="Esboço de Pregação">Esboço de Pregação</option>
                    <option value="Estudo de Família">Estudo de Família</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Autor / Pregador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pastor Carlos"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Conteúdo do Estudo *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Divida o estudo em parágrafos ou utilize pontos estruturados: e.g. 1. Introdução, 2. Desenvolvimento, 3. Conclusão..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-sans whitespace-pre-wrap leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-705 text-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  {editingStudy ? 'Gravar' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
