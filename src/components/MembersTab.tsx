import React, { useState } from 'react';
import { Member } from '../types';
import { Download, Edit2, Plus, Search, Trash2, X, Users, Phone, Mail, Calendar, Award } from 'lucide-react';

interface MembersTabProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  isAdm: boolean;
}

export function MembersTab({ members, onAddMember, onUpdateMember, onDeleteMember, isAdm }: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [baptismDate, setBaptismDate] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRole('Membro');
    setPhone('');
    setEmail('');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setBaptismDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setEmail(member.email);
    setJoinDate(member.joinDate);
    setBaptismDate(member.baptismDate);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, role, phone, email, joinDate, baptismDate };

    if (editingMember) {
      onUpdateMember({ ...editingMember, ...data });
    } else {
      onAddMember(data);
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = ['Nome', 'Cargo', 'Telefone', 'E-mail', 'Data de Ingresso', 'Data de Batismo'];
    
    // CSV Content Rows
    const rows = members.map(m => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.role.replace(/"/g, '""')}"`,
      `"${m.phone}"`,
      `"${m.email}"`,
      `"${m.joinDate}"`,
      `"${m.baptismDate || 'Não Batizado'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `membros_igreja_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar membros por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs"
          />
        </div>

        <div className="flex gap-2">
          {isAdm && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-750 text-slate-700 text-[11px] font-bold cursor-pointer"
                title="Exportar Lista de Membros para Excel/Sheets"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-1 px-3 py-1.5 border border-transparent rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Cadastrar Membro</span>
              </button>
            </>
          )}
        </div>
      </div>
      {/* Member Lists / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <Users className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-xs">Nenhum membro encontrado.</p>
            <p className="text-[10px] text-slate-500">Tente buscar por termos diferentes ou cadastre de novos membros.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50 text-slate-650 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3">Nome completo</th>
                    <th scope="col" className="px-5 py-3">Cargo / Função</th>
                    <th scope="col" className="px-5 py-3">Telefone</th>
                    <th scope="col" className="px-5 py-3">E-mail</th>
                    <th scope="col" className="px-5 py-3 text-center">Ingresso</th>
                    <th scope="col" className="px-5 py-3 text-center">Batismo</th>
                    {isAdm && <th scope="col" className="px-5 py-3 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-900">{member.name}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                          {member.role || 'Membro'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[10px]">{member.phone || '-'}</td>
                      <td className="px-5 py-3 text-slate-500 text-[11px]">{member.email || '-'}</td>
                      <td className="px-5 py-3 text-center text-[10px] text-slate-500 font-mono">
                        {member.joinDate ? new Date(member.joinDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {member.baptismDate ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100/50 font-mono">
                            {new Date(member.baptismDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Não Informado</span>
                        )}
                      </td>
                      {isAdm && (
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-1 px-1.5 border border-slate-200 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                              title="Editar Membro"
                            >
                              <Edit2 className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o membro "${member.name}"?`)) {
                                  onDeleteMember(member.id);
                                }
                              }}
                              className="p-1 px-1.5 border border-red-100 rounded text-red-500 hover:text-white hover:bg-red-550 hover:bg-red-500 transition-colors inline-flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                              title="Excluir Membro"
                            >
                              <Trash2 className="h-3 w-3" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card Grid */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{member.name}</h4>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700">
                          {member.role || 'Membro'}
                        </span>
                      </div>
                    </div>
                    {isAdm && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1 border border-slate-200 rounded text-slate-650 text-slate-600 bg-slate-55 bg-slate-50 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir membro "${member.name}"?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-1 border border-red-100 rounded text-red-500 bg-red-50/50 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-[10px] truncate">{member.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>Ingresso: <strong className="font-mono text-[10px]">{member.joinDate ? new Date(member.joinDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>Batismo: <strong className="font-mono text-[10px]">{member.baptismDate ? new Date(member.baptismDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não'}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {editingMember ? 'Editar Membro da Igreja' : 'Cadastrar Novo Membro'}
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
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Cargo / Função Ministerial
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
                  >
                    <option value="Pastor Presidente">Pastor Presidente</option>
                    <option value="Pastor Auxiliar">Pastor Auxiliar</option>
                    <option value="Evangelista">Evangelista</option>
                    <option value="Missionária">Missionária</option>
                    <option value="Presbítero">Presbítero</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Líder de Louvor">Líder de Louvor</option>
                    <option value="Membro Ativo">Membro Ativo</option>
                    <option value="Membro em Formação">Membro em Formação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  E-mail institucional / pessoal
                </label>
                <input
                  type="email"
                  placeholder="Ex: joao.santos@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Data de Ingresso *
                  </label>
                  <input
                    type="date"
                    required
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Data de Batismo
                  </label>
                  <input
                    type="date"
                    value={baptismDate}
                    onChange={(e) => setBaptismDate(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1">Deixe em branco caso não tenha sido batizado ainda nesta denominação.</span>
                </div>
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
                  {editingMember ? 'Atualizar' : 'Gravar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
