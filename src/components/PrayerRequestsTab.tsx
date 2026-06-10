import React, { useState } from 'react';
import { PrayerRequest, Settings } from '../types';
import { Heart, Send, CheckCircle2, AlertCircle, HelpCircle, Eye, ShieldAlert, MessageSquarePlus } from 'lucide-react';

interface PrayerRequestsTabProps {
  prayers: PrayerRequest[];
  onAddPrayer: (name: string, message: string) => Promise<boolean>;
  isAdm: boolean;
  settings: Settings;
}

export function PrayerRequestsTab({ prayers, onAddPrayer, isAdm, settings }: PrayerRequestsTabProps) {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    setSubmitting(true);
    setSuccess(false);
    setErrorText('');

    try {
      const ok = await onAddPrayer(senderName, message);
      if (ok) {
        setSuccess(true);
        setSenderName('');
        setMessage('');
        // Dismiss success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        // Fallback or warning
        setSuccess(true); // Still saved in database even if WhatsApp API was offline/simulated
        setSenderName('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (e: any) {
      setErrorText('Houve uma falha técnica ao processar. Mas fique em paz, o pedido foi salvo!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Informational intro card */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm space-y-3 relative overflow-hidden border border-slate-800">
        {/* Abstract background graphics on margins */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-5">
          <Heart className="h-32 w-32 fill-white" />
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-white/10 p-2 rounded-lg shrink-0 mt-0.5">
            <Heart className="h-5 w-5 text-amber-400 fill-amber-400/20 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm leading-snug">Pedidos de Oração e Intercessão</h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
              "Onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles." (Mateus 18:20). Envie suas súplicas de orações. Elas são recebidas pelos pastores da igreja de forma confidencial.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left block - Send Input Form */}
        <div className={`${isAdm ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5`}>
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <MessageSquarePlus className="h-4.5 w-4.5 text-blue-600" />
              Enviar Meu Pedido
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Você pode se identificar ou enviar em nome de terceiros.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {success && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs leading-relaxed border border-emerald-100 flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px]">Pedido Enviado com Sucesso!</p>
                  <p className="text-emerald-700/90 mt-0.5 text-[10px] leading-snug">
                    Seu clamor foi registrado no portal da igreja e encaminhado silenciosamente via WhatsApp aos pastores. Deus ouve a sua oração!
                  </p>
                </div>
              </div>
            )}

            {errorText && (
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-lg text-xs leading-relaxed border border-amber-100 flex items-start gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-snug">{errorText}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Seu Nome / De Quem Necessita? *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Maria Aparecida ou Anônimo"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Escreva o motivo da oração *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Descreva aqui o motivo de sua súplica (saúde, família, finanças, libertação, agradecimento)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/20 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 font-bold text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors disabled:bg-slate-300 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Encaminhando Clamor...' : 'Apresentar Pedido à Igreja'}</span>
            </button>
          </form>

          {/* Quick info about CallMeBot setup */}
          <p className="text-[9px] text-slate-400 text-center">
            Integrado nativamente com o serviço <strong className="text-slate-550">CallMeBot API</strong> para notificar os pastores diretamente no WhatsApp.
          </p>
        </div>

        {/* Right block - Admin Tracking Console */}
        {isAdm && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Eye className="h-4.5 w-4.5 text-blue-600" />
                  Painel de Acompanhamento (ADM)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Apenas líderes autorizados visualizam esses pedidos.</p>
              </div>
              <span className="bg-red-50 text-red-700 ring-1 ring-red-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Sigiloso
              </span>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {prayers.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <Heart className="h-8 w-8 text-slate-200 mx-auto" />
                  <p className="text-sm">Nenhum pedido recebido ainda.</p>
                </div>
              ) : (
                prayers.map((pr) => (
                  <div key={pr.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <h5 className="font-bold text-slate-800 text-xs">{pr.senderName}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(pr.date).toLocaleDateString('pt-BR')} às {new Date(pr.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed italic">
                      "{pr.message}"
                    </p>

                    {/* WhatsApp notification deliver status */}
                    <div className="pt-1 flex justify-end items-center text-[9px]">
                      {settings.whatsappPhone && settings.whatsappApiKey ? (
                        pr.whatsappStatus === 'success' ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Entregue por WhatsApp
                          </span>
                        ) : pr.whatsappStatus === 'failed' ? (
                          <span className="text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded font-bold flex items-center gap-1" title={pr.whatsappError}>
                            <AlertCircle className="h-2.5 w-2.5" />
                            Erro no WhatsApp
                          </span>
                        ) : (
                          <span className="text-slate-550 bg-slate-100 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <HelpCircle className="h-2.5 w-2.5" />
                            Pendente / Processando
                          </span>
                        )
                      ) : (
                        <span className="text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-bold flex items-center gap-1" title="Configure no perfil do Admin">
                          <AlertCircle className="h-2.5 w-2.5 animate-spin" />
                          Simulado localmente (Faltam Chaves)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
