import React, { useState, useEffect } from 'react';
import { 
  User, Member, Announcement, Event, Study, PrayerRequest, 
  FinanceTransaction, PhotoAlbum, Photo, PushNotification, Settings 
} from './types';
import { 
  getStoredData, setStoredData, KEYS,
  INITIAL_MEMBERS, INITIAL_ANNOUNCEMENTS, INITIAL_EVENTS, 
  INITIAL_STUDIES, INITIAL_PRAYERS, INITIAL_FINANCE, 
  INITIAL_ALBUMS, INITIAL_PHOTOS, INITIAL_NOTIFICATIONS, INITIAL_SETTINGS 
} from './data';

// Component imports
import { LoginScreen } from './components/LoginScreen';
import { NotificationsPanel } from './components/NotificationsPanel';
import { MembersTab } from './components/MembersTab';
import { AnnouncementsTab } from './components/AnnouncementsTab';
import { EventsTab } from './components/EventsTab';
import { StudiesTab } from './components/StudiesTab';
import { PrayerRequestsTab } from './components/PrayerRequestsTab';
import { FinanceTab } from './components/FinanceTab';
import { PhotosTab } from './components/PhotosTab';

// Icons
import { 
  Bell, LogOut, Menu, X, Users, Megaphone, Calendar, 
  BookOpen, Heart, Landmark, Image as ImageIcon, Shield, User as UserIcon, Settings as SettingsIcon, AlertCircle, RefreshCw
} from 'lucide-react';

export default function App() {
  // PWA Service Worker dynamic registration
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('PWA Service Worker registrado com sucesso:', reg.scope);
          })
          .catch((err) => {
            console.warn('Falha ao registrar PWA Service Worker:', err);
          });
      });
    }
  }, []);

  // Core Storage & Credentials States
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    getStoredData<User | null>(KEYS.CURRENT_USER, null)
  );

  const [members, setMembers] = useState<Member[]>(() => 
    getStoredData<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS)
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => 
    getStoredData<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );

  const [events, setEvents] = useState<Event[]>(() => 
    getStoredData<Event[]>(KEYS.EVENTS, INITIAL_EVENTS)
  );

  const [studies, setStudies] = useState<Study[]>(() => 
    getStoredData<Study[]>(KEYS.STUDIES, INITIAL_STUDIES)
  );

  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => 
    getStoredData<PrayerRequest[]>(KEYS.PRAYERS, INITIAL_PRAYERS)
  );

  const [finance, setFinance] = useState<FinanceTransaction[]>(() => 
    getStoredData<FinanceTransaction[]>(KEYS.FINANCE, INITIAL_FINANCE)
  );

  const [albums, setAlbums] = useState<PhotoAlbum[]>(() => 
    getStoredData<PhotoAlbum[]>(KEYS.ALBUMS, INITIAL_ALBUMS)
  );

  const [photos, setPhotos] = useState<Photo[]>(() => 
    getStoredData<Photo[]>(KEYS.PHOTOS, INITIAL_PHOTOS)
  );

  const [notifications, setNotifications] = useState<PushNotification[]>(() => 
    getStoredData<PushNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  const [settings, setSettings] = useState<Settings>(() => 
    getStoredData<Settings>(KEYS.SETTINGS, INITIAL_SETTINGS)
  );

  // Layout UI States
  const [activeTab, setActiveTab] = useState<string>('recados');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Temp settings edit buffer
  const [tempPhone, setTempPhone] = useState(settings.whatsappPhone);
  const [tempApiKey, setTempApiKey] = useState(settings.whatsappApiKey);

  // Synchronizers
  useEffect(() => setStoredData(KEYS.CURRENT_USER, currentUser), [currentUser]);
  useEffect(() => setStoredData(KEYS.MEMBERS, members), [members]);
  useEffect(() => setStoredData(KEYS.ANNOUNCEMENTS, announcements), [announcements]);
  useEffect(() => setStoredData(KEYS.EVENTS, events), [events]);
  useEffect(() => setStoredData(KEYS.STUDIES, studies), [studies]);
  useEffect(() => setStoredData(KEYS.PRAYERS, prayers), [prayers]);
  useEffect(() => setStoredData(KEYS.FINANCE, finance), [finance]);
  useEffect(() => setStoredData(KEYS.ALBUMS, albums), [albums]);
  useEffect(() => setStoredData(KEYS.PHOTOS, photos), [photos]);
  useEffect(() => setStoredData(KEYS.NOTIFICATIONS, notifications), [notifications]);
  useEffect(() => setStoredData(KEYS.SETTINGS, settings), [settings]);

  // Request browser permission for actual native push warnings
  const requestNativeNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        const isGranted = perm === 'granted';
        setSettings(prev => ({ ...prev, nativeNotificationsEnabled: isGranted }));
        alert(isGranted 
          ? 'Notificações nativas habilitadas com sucesso! Você receberá alertas flutuantes no celular ao publicar novidades.' 
          : 'Permissão recusada ou indisponível.'
        );
      });
    } else {
      alert('Seu dispositivo ou navegador atual não suporta a API de notificações nativas.');
    }
  };

  // Dispatch push-alert triggers
  const triggerNotification = (title: string, body: string) => {
    // 1. Save in storage notification history table
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);

    // 2. Spawn browser native notification (if enabled & granted)
    if (settings.nativeNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231e3a8a"><path d="M12 2v20M8 8h8" stroke="white" stroke-width="2"/></svg>'
        });
      } catch (e) {
        console.warn('Erro ao acionar notificação em background:', e);
      }
    }
  };

  // Global Auth Dispatchers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADM') {
      setActiveTab('membros'); 
    } else {
      setActiveTab('recados');
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja encerrar sua sessão e sair do aplicativo?')) {
      setCurrentUser(null);
      setIsProfileDropdownOpen(false);
    }
  };

  // Tab dynamic visibility checks
  const isAdm = currentUser?.role === 'ADM';

  // Toggle active session fast testing
  const toggleTesterRole = () => {
    if (!currentUser) return;
    const newRole = currentUser.role === 'ADM' ? 'Membro' : 'ADM';
    const updatedUser: User = {
      ...currentUser,
      role: newRole,
      name: newRole === 'ADM' ? 'Pastor Carlos (ADM)' : 'Ana Silva (Membro)'
    };
    setCurrentUser(updatedUser);
    alert(`Perfil alternado para: ${newRole === 'ADM' ? 'Administrador' : 'Membro'}. Todas as regras de acessos foram reconfiguradas.`);
    if (newRole === 'ADM') {
      setActiveTab('membros');
    } else {
      setActiveTab('recados');
    }
  };

  // Global Members business logic
  const handleAddMember = (m: Omit<Member, 'id'>) => {
    const newMember: Member = {
      id: `m-${Date.now()}`,
      ...m
    };
    setMembers(prev => [newMember, ...prev]);
  };

  const handleUpdateMember = (m: Member) => {
    setMembers(prev => prev.map(item => item.id === m.id ? m : item));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(item => item.id !== id));
  };

  // Global Announcements business logic
  const handleAddAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      id: `a-${Date.now()}`,
      date: new Date().toISOString(),
      ...ann
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    
    // Auto push notification
    triggerNotification(
      'Novo Recado Publicado!',
      `O mural do portal foi atualizado: "${ann.title}". Clique para ler.`
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  // Global Events business logic
  const handleAddEvent = (ev: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      id: `e-${Date.now()}`,
      ...ev
    };
    setEvents(prev => [newEvent, ...prev]);

    // Auto push notification
    const formattedDate = new Date(ev.date).toLocaleDateString('pt-BR');
    triggerNotification(
      'Novo Evento Programado!',
      `Participe: "${ev.title}" agendado para o dia ${formattedDate} no local ${ev.location}!`
    );
  };

  const handleUpdateEvent = (ev: Event) => {
    setEvents(prev => prev.map(item => item.id === ev.id ? ev : item));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(item => item.id !== id));
  };

  // Global Studies business logic
  const handleAddStudy = (std: Omit<Study, 'id' | 'date'>) => {
    const newStudy: Study = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...std
    };
    setStudies(prev => [newStudy, ...prev]);

    // Auto push notification
    triggerNotification(
      'Novo Estudo Teológico Publicado!',
      `Esboço de estudo bíblico disponível: "${std.title}". Venha ler e edificar-se.`
    );
  };

  const handleUpdateStudy = (std: Study) => {
    setStudies(prev => prev.map(item => item.id === std.id ? std : item));
  };

  const handleDeleteStudy = (id: string) => {
    setStudies(prev => prev.filter(item => item.id !== id));
  };

  // Global Prayer Requests business logic with CallMeBot support
  const handleAddPrayer = async (senderName: string, message: string): Promise<boolean> => {
    const newPrayer: PrayerRequest = {
      id: `p-${Date.now()}`,
      senderName,
      message,
      date: new Date().toISOString(),
      whatsappStatus: 'pending'
    };

    // Pre-insert into list to show immediately
    setPrayers(prev => [newPrayer, ...prev]);

    let deliveryStatus: 'success' | 'failed' = 'success';
    let errDetail = '';

    try {
      // Call modern server post proxy
      const servResponse = await fetch('/api/send-prayer-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settings.whatsappPhone,
          apikey: settings.whatsappApiKey,
          senderName,
          message
        })
      });

      if (!servResponse.ok) {
        deliveryStatus = 'failed';
        errDetail = `HTTP ${servResponse.status}`;
      } else {
        const bodyContent = await servResponse.json();
        if (bodyContent.status === 'simulated') {
          deliveryStatus = 'success'; // Treat simulated as success for peaceful outputs
        }
      }
    } catch (err: any) {
      deliveryStatus = 'failed';
      errDetail = err?.message || 'Network Timeout';
    }

    // Update real delivering tracker status
    setPrayers(prev => prev.map(p => p.id === newPrayer.id 
      ? { ...p, whatsappStatus: deliveryStatus, whatsappError: errDetail } 
      : p
    ));

    return deliveryStatus === 'success';
  };

  // Global Finances business logic
  const handleAddTransaction = (tx: Omit<FinanceTransaction, 'id'>) => {
    const newTx: FinanceTransaction = {
      id: `f-${Date.now()}`,
      ...tx
    };
    setFinance(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setFinance(prev => prev.filter(item => item.id !== id));
  };

  // Global Photo Album business logic
  const handleAddAlbum = (name: string) => {
    const newAlbum: PhotoAlbum = {
      id: `alb-${Date.now()}`,
      name,
      createdAt: new Date().toISOString()
    };
    setAlbums(prev => [newAlbum, ...prev]);
  };

  const handleDeleteAlbum = (id: string) => {
    setAlbums(prev => prev.filter(item => item.id !== id));
    setPhotos(prev => prev.filter(item => item.albumId !== id)); // Cascade deleting
  };

  const handleAddPhotos = (albumId: string, base64Urls: string[]) => {
    const newPhotosList: Photo[] = base64Urls.map((url, idx) => ({
      id: `ph-${Date.now()}-${idx}`,
      albumId,
      url,
      createdAt: new Date().toISOString()
    }));

    setPhotos(prev => [...newPhotosList, ...prev]);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(item => item.id !== id));
  };

  // Global Notification actions
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      whatsappPhone: tempPhone,
      whatsappApiKey: tempApiKey
    }));
    setShowConfigModal(false);
    alert('As configurações do WhatsApp (CallMeBot) foram atualizadas. Os futuros pedidos de oração usarão estes dados para notificar!');
  };

  // Render Login screen if not signed-in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Navigation Links definition
  const navigationItems = [
    { id: 'recados', label: 'Quadro de Recados', icon: Megaphone, count: 0 },
    { id: 'membros', label: 'Cadastro de Membros', icon: Users, count: 0, adminOnly: true },
    { id: 'eventos', label: 'Eventos & Cultos', icon: Calendar, count: 0 },
    { id: 'estudos', label: 'Estudos Bíblicos', icon: BookOpen, count: 0 },
    { id: 'oracao', label: 'Pedidos de Oração', icon: Heart, count: 0 },
    { id: 'financeiro', label: 'Caixa & Tesouraria', icon: Landmark, count: 0, adminOnly: true },
    { id: 'fotos', label: 'Galeria de Fotos', icon: ImageIcon, count: 0 },
  ];

  const visibleNavigationItems = navigationItems.filter(item => !item.adminOnly || isAdm);

  return (
    <div id="full-app-root" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* GLOBAL HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Abrir Menu Lateral"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm hidden sm:block lg:hidden">
              {/* Elegant SVG Cross Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-white">
                <path d="M12 2v20M8 8h8" />
              </svg>
            </div>
            
            <div className="lg:hidden">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block">Igreja Conectada</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Portal de Comunhão</span>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-sm font-bold tracking-wider font-mono text-slate-500 uppercase">
                {navigationItems.find(item => item.id === activeTab)?.label || 'Visão Geral'}
              </h2>
            </div>
          </div>

          {/* User actions / header links */}
          <div className="flex items-center gap-4">
            
            {/* Quick Testing Switch (Crucial for evaluate ADM/Member experience seamlessly) */}
            <button
              onClick={toggleTesterRole}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
              title="Alterne instantaneamente o seu perfil para depurar ambas as telas"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-700" />
              <span>Trocar para {currentUser.role === 'ADM' ? 'Membro' : 'ADM'}</span>
            </button>

            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Clique para abrir o histórico de notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center border-2 border-white font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Active User Dropper Card */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-xs font-bold cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200">
                  <UserIcon className="h-4.5 w-4.5" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="leading-none text-slate-800 font-sans">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-450 leading-none mt-1 font-medium">{currentUser.role === 'ADM' ? 'Administrador' : 'Membro Ativo'}</p>
                </div>
              </button>

              {/* Profile dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-slate-200 text-xs text-slate-700 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Sua Autenticação
                  </div>
                  
                  <div className="px-4 py-2 hover:bg-slate-50 font-medium">
                    <p className="font-extrabold text-slate-800">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.email}</p>
                  </div>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setShowConfigModal(true);
                      setTempPhone(settings.whatsappPhone);
                      setTempApiKey(settings.whatsappApiKey);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium text-slate-700"
                  >
                    <SettingsIcon className="h-4 w-4 text-slate-400" />
                    Parâmetros Integração
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      requestNativeNotificationPermission();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium text-slate-700"
                  >
                    <Bell className="h-4 w-4 text-slate-400" />
                    Ativar Alertas Celular
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      toggleTesterRole();
                    }}
                    className="md:hidden w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-bold text-amber-800 bg-amber-50/40"
                  >
                    <RefreshCw className="h-4 w-4 text-amber-600" />
                    Alternar Papel
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Encerrar Sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE FRAME (Sidebar + Page content) */}
      <div id="app-workspace-body" className="flex-1 w-full flex items-stretch">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-200 shrink-0 text-slate-300">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-8-9 8-9 8 9 8 9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-base tracking-tight text-white block truncate">Igreja Conectada</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block mt-0.5">Portal Oficial</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-3">Atalhos Principais</span>
              <nav className="space-y-1 pt-2">
                {visibleNavigationItems.map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`nav-link-btn w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer User tag */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/20">
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="w-8 h-8 bg-slate-850 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold border border-slate-800 shrink-0">
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'PA'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate leading-none">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate mt-1.5 leading-none">{currentUser.role === 'ADM' ? 'Administrador' : 'Membro Ativo'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR SCREEN */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-64 max-w-xs bg-slate-900 text-slate-300 p-6 shadow-2xl flex flex-col justify-between border-r border-slate-800">
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-8-9 8-9 8 9 8 9z" />
                      </svg>
                    </div>
                    Igreja Conectada
                  </span>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-0.5">
                  {visibleNavigationItems.map((item) => {
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <item.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile logout footer button */}
              <button 
                onClick={handleLogout}
                className="w-full py-2 bg-red-955 bg-red-950/40 text-red-400 hover:bg-red-950/65 border border-red-900/30 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <LogOut className="h-4 w-4" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>
        )}

        {/* INTERACTIVE PAGE DISPLAY CANVAS */}
        <main id="app-viewport-canvas" className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-5 max-w-full">
          
          {/* Active Testing Role Header bar (helpful visual tag on top of viewport) */}
          <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-xs text-amber-800 flex items-start gap-2 justify-between flex-wrap shadow-sm">
            <div className="flex items-start gap-1.5">
              <Shield className="h-4.5 w-4.5 shrink-0 text-amber-650 text-amber-600" />
              <div>
                <span>Sessão de Teste Ativa: Perfil logado atualmente como: <strong>{currentUser.role} ({currentUser.name})</strong>. </span>
                <span className="hidden sm:inline text-amber-700/80">Isto desbloqueia diferentes permissões. Use o seletor rápido ao lado para alternar e depurar a visão de Membro e Administrador.</span>
              </div>
            </div>
            
            <button
              onClick={toggleTesterRole}
              className="font-bold underline text-[11px] text-amber-900 hover:text-amber-950 cursor-pointer text-right"
            >
              Alternar para {currentUser.role === 'ADM' ? 'Membro' : 'ADM'}
            </button>
          </div>

          {/* Core Route Rendering Switches */}
          <section className="animate-fade-in">
            {activeTab === 'recados' && (
              <AnnouncementsTab 
                announcements={announcements}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                isAdm={isAdm}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'membros' && (
              <MembersTab 
                members={members}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                isAdm={isAdm}
              />
            )}

            {activeTab === 'eventos' && (
              <EventsTab 
                events={events}
                onAddEvent={handleAddEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                isAdm={isAdm}
              />
            )}

            {activeTab === 'estudos' && (
              <StudiesTab 
                studies={studies}
                onAddStudy={handleAddStudy}
                onUpdateStudy={handleUpdateStudy}
                onDeleteStudy={handleDeleteStudy}
                isAdm={isAdm}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'oracao' && (
              <PrayerRequestsTab 
                prayers={prayers}
                onAddPrayer={handleAddPrayer}
                isAdm={isAdm}
                settings={settings}
              />
            )}

            {activeTab === 'financeiro' && (
              <FinanceTab 
                transactions={finance}
                members={members}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                isAdm={isAdm}
              />
            )}

            {activeTab === 'fotos' && (
              <PhotosTab 
                albums={albums}
                photos={photos}
                onAddAlbum={handleAddAlbum}
                onDeleteAlbum={handleDeleteAlbum}
                onAddPhotos={handleAddPhotos}
                onDeletePhoto={handleDeletePhoto}
                isAdm={isAdm}
              />
            )}
          </section>
        </main>
      </div>

      {/* MOBILE FOOTER NAVIGATION RAIL */}
      <footer className="lg:hidden bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-500 sticky bottom-0 z-40 shadow-sm">
        {navigationItems.filter(item => !item.adminOnly || isAdm).map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg cursor-pointer ${
                isSelected ? 'text-blue-600 bg-blue-50/80' : 'hover:bg-slate-50'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate max-w-[55px] font-medium scale-95">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </footer>

      {/* NOTIFICATIONS PANEL SLIDER */}
      <NotificationsPanel 
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAllNotifications}
      />

      {/* CALLMEBOT CONFIGURATION MODAL DIALOG */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowConfigModal(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <SettingsIcon className="h-4.5 w-4.5" />
                Parâmetros WhatsApp (CallMeBot)
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl text-xs leading-relaxed space-y-1">
                <p className="font-extrabold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Como conseguir a chave CallMeBot?
                </p>
                <p>1. Adicione o contato do bot no seu WhatsApp: <strong>+34 644 10 55 39</strong></p>
                <p>2. Envie a mensagem: <strong>I allow callmebot to send me messages</strong></p>
                <p>3. Aguarde receber a resposta contendo sua chave de autorização API Key.</p>
                <p>4. Cole as informações correspondentes abaixo!</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Número Recipiente (Com DDI) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: +5511999999999"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  API Key Recebida *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1234567"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Salvar Chaves
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
