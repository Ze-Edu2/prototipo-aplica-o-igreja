import { PushNotification } from '../types';
import { Bell, Check, Trash2, X, AlertOctagon } from 'lucide-react';

interface NotificationsPanelProps {
  notifications: PushNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationsPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearAll
}: NotificationsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 shadow-2xl">
            <div className="flex h-full flex-col bg-white">
              <div className="px-4.5 py-3 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-4.5 w-4.5 text-amber-400 fill-amber-400/20" />
                  <h2 className="text-xs font-bold uppercase tracking-wider" id="slide-over-title">Histórico de Notificações</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded p-1 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Utility buttons */}
              {notifications.length > 0 && (
                <div className="px-4.5 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[10px]">
                  <button 
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1.5 text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    Marcar todas como lidas
                  </button>
                  <button 
                    onClick={onClearAll}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Limpar histórico
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-2.5">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center mx-auto">
                      <Bell className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-medium">Nenhuma notificação por aqui.</p>
                    <p className="text-[10px] text-slate-400">Recados, eventos e estudos novos aparecerão aqui automaticamente.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-lg border transition-all ${
                        notif.read 
                          ? 'bg-white border-slate-200 shadow-xs' 
                          : 'bg-blue-50/20 border-blue-150 ring-1 ring-blue-100/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h3 className={`text-xs ${notif.read ? 'text-slate-700 font-semibold' : 'text-slate-900 font-extrabold'}`}>
                            {notif.title}
                          </h3>
                          <p className="text-[11px] text-slate-600 leading-relaxed break-words">
                            {notif.body}
                          </p>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded p-0.5 transition-colors shrink-0 cursor-pointer"
                            title="Marcar como lida"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-400">
                        <span>{new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {!notif.read && (
                          <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-bold ring-1 ring-blue-100">
                            Nova
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mini Manual / Tip */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-600">
                <div className="flex gap-1.5">
                  <AlertOctagon className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-700">Dica:</strong> Se as permissões nativas estiverem liberadas em seu perfil, essas notificações acionam alertas do próprio sistema do celular!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
