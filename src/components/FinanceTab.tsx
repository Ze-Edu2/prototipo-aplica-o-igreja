import React, { useState } from 'react';
import { FinanceTransaction, Member } from '../types';
import { DollarSign, Plus, Trash2, Download, TrendingUp, TrendingDown, Landmark, Users, Calendar, HelpCircle } from 'lucide-react';

interface FinanceTabProps {
  transactions: FinanceTransaction[];
  members: Member[];
  onAddTransaction: (transaction: Omit<FinanceTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  isAdm: boolean;
}

export function FinanceTab({ transactions, members, onAddTransaction, onDeleteTransaction, isAdm }: FinanceTabProps) {
  const [type, setType] = useState<'dizimo' | 'oferta' | 'despesa'>('dizimo');
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState('');

  // Process core metrics
  const totalDizimos = transactions
    .filter(t => t.type === 'dizimo')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOfertas = transactions
    .filter(t => t.type === 'oferta')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = (totalDizimos + totalOfertas) - totalDespesas;

  // Monthly Aggregate grouping for charts
  // Months of interest: "04" (Abril), "05" (Maio), "06" (Junho). We'll group dynamically
  const monthsList = [
    { key: '2026-04', label: 'Abril/26' },
    { key: '2026-05', label: 'Maio/26' },
    { key: '2026-06', label: 'Junho/26' }
  ];

  const chartData = monthsList.map(m => {
    const monthTx = transactions.filter(t => t.date.startsWith(m.key));
    const entries = monthTx
      .filter(t => t.type === 'dizimo' || t.type === 'oferta')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      label: m.label,
      entries: entries,
      expenses: expenses,
      balance: entries - expenses
    };
  });

  // SVG dimensions for pure-canvas responsive charts
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  // Chart 1: Entries (Dízimos & Ofertas)
  const maxEntriesValue = Math.max(...chartData.map(d => d.entries), 1000);
  const scaleYEntries = (val: number) => chartInnerHeight - (val / (maxEntriesValue * 1.15)) * chartInnerHeight;

  // Chart 2: Net Balance (Saldo Mensal)
  const balancesList = chartData.map(d => d.balance);
  const maxBalanceValue = Math.max(...balancesList, 1000);
  const minBalanceValue = Math.min(...balancesList, 0);
  // Establish symmetrical or zero-based scale for balances grid
  const scaleYBalance = (val: number) => {
    const range = maxBalanceValue - minBalanceValue;
    const factor = range > 0 ? range : 1000;
    const heightPercentage = (val - minBalanceValue) / factor;
    return chartInnerHeight - heightPercentage * chartInnerHeight;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    let derivedName = '';
    if (type === 'dizimo' && memberId) {
      const selected = members.find(m => m.id === memberId);
      if (selected) derivedName = selected.name;
    }

    onAddTransaction({
      type,
      memberId: type === 'dizimo' ? memberId : undefined,
      memberName: type === 'dizimo' ? derivedName : undefined,
      amount: parseFloat(amount),
      description: description || (type === 'dizimo' ? `Dízimo de ${derivedName}` : type === 'oferta' ? 'Oferta de Culto' : 'Despesa Geral'),
      date
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setMemberId('');
    
    // Toast trigger
    setToastMessage('Lançamento registrado com êxito!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Membro Vinculado', 'Valor (R$)'];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'dizimo' ? 'Dízimo' : t.type === 'oferta' ? 'Oferta' : 'Despesa',
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.memberName || '-'}"`,
      t.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financeiro_igreja_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdm) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-8 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <Landmark className="h-7 w-7 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Mural Financeiro (ADM)</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          O controle de dízimos, ofertas voluntárias e despesas administrativas da paróquia é sigiloso e restrito aos perfis de liderança e tesouraria.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 text-xs text-slate-500">
          <p className="font-bold text-slate-700">Como funciona o dízimo?</p>
          <p className="mt-1">
            Reconhecemos o dízimo como uma expressão de adoração voluntária e fidelidade. Estes recursos financiam a manutenção do templo, atividades sociais e evangelismo em larga escala.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Dízimos</span>
            <p className="text-lg font-black text-blue-600 mt-0.5 font-sans">
              R$ {totalDizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ofertas</span>
            <p className="text-lg font-black text-emerald-650 text-emerald-800 mt-0.5 font-sans">
              R$ {totalOfertas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Despesas</span>
            <p className="text-lg font-black text-red-600 mt-0.5 font-sans">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
            <TrendingDown className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Saldo Mensal</span>
            <p className="text-lg font-black mt-0.5 font-sans">
              R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 bg-white/10 text-amber-400 rounded-lg border border-white/5">
            <Landmark className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div id="finance-charts-bento" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1 SVG - Entries */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Histórico de Entradas Ativas por Mês</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Soma total de dízimos e ofertas em R$</p>
          </div>
          <div className="flex justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yVal = paddingTop + ratio * chartInnerHeight;
                const valueOfY = (maxEntriesValue * 1.15) * (1 - ratio);
                return (
                  <g key={i}>
                    <line 
                      x1={paddingLeft} 
                      y1={yVal} 
                      x2={svgWidth - paddingRight} 
                      y2={yVal} 
                      stroke="#f1f5f9" 
                      strokeWidth="1.2"
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={yVal + 3} 
                      className="text-[10px] font-mono fill-slate-400 text-right" 
                      textAnchor="end"
                    >
                      {Math.round(valueOfY).toLocaleString('pt-BR')}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((data, idx) => {
                const barSpacing = chartInnerWidth / chartData.length;
                const barWidth = 45;
                const xVal = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
                const yVal = scaleYEntries(data.entries);
                const barH = chartInnerHeight - (yVal - paddingTop);

                return (
                  <g key={idx} className="group">
                    {/* Shadow / Glow bar */}
                    <rect
                      x={xVal}
                      y={yVal}
                      width={barWidth}
                      height={Math.max(barH, 3)}
                      rx="6"
                      fill="#2563eb"
                      className="opacity-95 hover:opacity-100 transition-all cursor-pointer"
                    />
                    
                    {/* Tooltip values above the bar */}
                    <text
                      x={xVal + barWidth / 2}
                      y={yVal - 6}
                      className="text-[10px] font-bold fill-blue-600 text-center"
                      textAnchor="middle"
                    >
                      R$ {Math.round(data.entries)}
                    </text>

                    {/* X Axis Label */}
                    <text
                      x={xVal + barWidth / 2}
                      y={svgHeight - paddingBottom + 18}
                      className="text-[11px] font-bold fill-slate-705 fill-slate-700 text-center"
                      textAnchor="middle"
                    >
                      {data.label}
                    </text>
                  </g>
                );
              })}
              {/* Base line */}
              <line 
                x1={paddingLeft} 
                y1={svgHeight - paddingBottom} 
                x2={svgWidth - paddingRight} 
                y2={svgHeight - paddingBottom} 
                stroke="#cbd5e1" 
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Chart 2 SVG - Net Balance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Histórico de Saldos Líquidos por Mês</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Saldo acumulado livre (Entradas - Despesas) em R$</p>
          </div>
          <div className="flex justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yVal = paddingTop + ratio * chartInnerHeight;
                const range = maxBalanceValue - minBalanceValue;
                const valueOfY = maxBalanceValue - ratio * range;
                return (
                  <g key={i}>
                    <line 
                      x1={paddingLeft} 
                      y1={yVal} 
                      x2={svgWidth - paddingRight} 
                      y2={yVal} 
                      stroke="#f1f5f9" 
                      strokeWidth="1.2"
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={yVal + 3} 
                      className="text-[10px] font-mono fill-slate-400 text-right" 
                      textAnchor="end"
                    >
                      {Math.round(valueOfY).toLocaleString('pt-BR')}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((data, idx) => {
                const barSpacing = chartInnerWidth / chartData.length;
                const barWidth = 45;
                const xVal = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
                
                // Zero-level indicator on balance charts
                const yZero = scaleYBalance(0);
                const yVal = scaleYBalance(data.balance);
                
                let rectY = yVal;
                let rectH = Math.abs(yZero - yVal);
                if (data.balance < 0) {
                  rectY = yZero;
                }

                const isNegative = data.balance < 0;

                return (
                  <g key={idx} className="group">
                    {/* Symmetrical bar element */}
                    <rect
                      x={xVal}
                      y={rectY}
                      width={barWidth}
                      height={Math.max(rectH, 3)}
                      rx="6"
                      fill={isNegative ? "#dc2626" : "#0f766e"}
                      className="opacity-90 hover:opacity-100 transition-all cursor-pointer"
                    />
                    
                    {/* Tooltip value */}
                    <text
                      x={xVal + barWidth / 2}
                      y={isNegative ? rectY + rectH + 11 : yVal - 6}
                      className={`text-[10px] font-bold text-center ${isNegative ? 'fill-red-700' : 'fill-teal-800'}`}
                      textAnchor="middle"
                    >
                      R$ {Math.round(data.balance)}
                    </text>

                    {/* X Axis Label */}
                    <text
                      x={xVal + barWidth / 2}
                      y={svgHeight - paddingBottom + 18}
                      className="text-[11px] font-bold fill-slate-700 text-center"
                      textAnchor="middle"
                    >
                      {data.label}
                    </text>
                  </g>
                );
              })}
              {/* Base line */}
              <line 
                x1={paddingLeft} 
                y1={svgHeight - paddingBottom} 
                x2={svgWidth - paddingRight} 
                y2={svgHeight - paddingBottom} 
                stroke="#cbd5e1" 
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Form and Ledger container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Transaction Input Panel */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-extrabold text-slate-800 text-xs leading-snug">Registrar Novo Lançamento</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Tesouraria e contabilidade financeira</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            {toastMessage && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg p-1.5 text-[11px] font-bold text-center animate-pulse">
                {toastMessage}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Caixa *</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('dizimo')}
                  className={`py-1 rounded text-center text-[10px] font-bold transition-all cursor-pointer ${
                    type === 'dizimo' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100/75'
                  }`}
                >
                  Dízimo
                </button>
                <button
                  type="button"
                  onClick={() => setType('oferta')}
                  className={`py-1 rounded text-center text-[10px] font-bold transition-all cursor-pointer ${
                    type === 'oferta' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100/75'
                  }`}
                >
                  Oferta
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-1 rounded text-center text-[10px] font-bold transition-all cursor-pointer ${
                    type === 'despesa' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100/75'
                  }`}
                >
                  Despesa
                </button>
              </div>
            </div>

            {type === 'dizimo' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Membro Vinculado *</label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">Selecione um membro...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor do Lançamento (R$) *</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs font-bold">R$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição / Observação</label>
              <input
                type="text"
                placeholder="Ex: Pagamento internet / Dízimo de Fulano"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full justify-center py-2 px-3 shadow-sm text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-755 hover:bg-blue-700 focus:outline-none transition-colors border border-transparent flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Concluir Lançamento</span>
            </button>
          </form>
        </div>

        {/* ledger table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Livro Razão / Histórico Geral</h4>
              <p className="text-xs text-slate-400 mt-0.5">Visualização de todas as atividades financeiras</p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
              title="Exportar planilhas fiscais em CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar XLS / CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Nenhum lançamento contábil registrado ainda.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3">Lançamento</th>
                    <th scope="col" className="px-4 py-3">Ref/Tipo</th>
                    <th scope="col" className="px-4 py-3 text-right">Valor (R$)</th>
                    <th scope="col" className="px-4 py-3 text-center">Data</th>
                    <th scope="col" className="px-4 py-3 text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-sans">
                  {[...transactions]
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((t) => {
                      const isEntry = t.type === 'dizimo' || t.type === 'oferta';
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 max-w-[140px] truncate">
                            <div>
                              <p className="font-bold text-slate-900">{t.description}</p>
                              {t.memberName && (
                                <p className="text-[9px] text-slate-400 truncate">Sócio: {t.memberName}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              t.type === 'dizimo' 
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' 
                                : t.type === 'oferta' 
                                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' 
                                : 'bg-red-50 text-red-700 ring-1 ring-red-100'
                            }`}>
                              {t.type === 'dizimo' ? 'Dízimo' : t.type === 'oferta' ? 'Oferta' : 'Despesa'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold font-mono ${isEntry ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isEntry ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-400 font-mono text-[10px]">
                            {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Deseja remover essa transação "${t.description}"?`)) {
                                  onDeleteTransaction(t.id);
                                }
                              }}
                              className="p-1 border border-red-50 text-red-500 hover:text-white hover:bg-red-600 rounded transition-colors cursor-pointer"
                              title="Remover movimentação"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
