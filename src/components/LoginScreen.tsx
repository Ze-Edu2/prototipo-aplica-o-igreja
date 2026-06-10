import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Key, Mail, Shield, Users } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Standard credential matching
    if (email === 'admin@igreja.com' && password === '123456') {
      onLogin({
        id: 'u-admin',
        email: 'admin@igreja.com',
        name: 'Pastor Carlos (ADM)',
        role: 'ADM'
      });
    } else if (email === 'membro@igreja.com' && password === '123456') {
      onLogin({
        id: 'u-membro',
        email: 'membro@igreja.com',
        name: 'Ana Silva',
        role: 'Membro'
      });
    } else {
      setError('E-mail ou senha incorretos. Utilize as contas de demonstração rápida abaixo!');
    }
  };

  const handleShortcutLogin = (role: UserRole) => {
    if (role === 'ADM') {
      onLogin({
        id: 'u-admin',
        email: 'admin@igreja.com',
        name: 'Pastor Carlos (ADM)',
        role: 'ADM'
      });
    } else {
      onLogin({
        id: 'u-membro',
        email: 'membro@igreja.com',
        name: 'Ana Silva',
        role: 'Membro'
      });
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3.5 rounded-2xl shadow-md border border-blue-500/10">
            {/* Elegant SVG Cross Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-9 w-9 text-white">
              <path d="M12 2v20M8 8h8" />
            </svg>
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Portal da Igreja
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 max-w-xs mx-auto">
          Comunhão, Gestão e Palavra ao seu alcance de forma simples e segura
        </p>
      </div>

      <div id="login-card" className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-8 shadow-sm rounded-xl border border-slate-200">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {error && (
              <div className="text-xs bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 flex items-center gap-2 font-medium">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Endereço de E-mail
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="exemplo@igreja.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Senha
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="******"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors cursor-pointer"
              >
                Acessar Portal
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] text-slate-400 uppercase">
                <span className="bg-white px-2.5 font-bold">Acesso de Demonstração Rápida</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleShortcutLogin('ADM')}
                className="inline-flex justify-center items-center py-2 px-3 border border-slate-200 rounded-lg shadow-sm bg-blue-50/50 text-[11px] font-bold text-blue-700 hover:bg-blue-100/70 focus:outline-none transition-colors cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 mr-1" />
                Papel ADM
              </button>

              <button
                type="button"
                onClick={() => handleShortcutLogin('Membro')}
                className="inline-flex justify-center items-center py-2 px-3 border border-slate-200 rounded-lg shadow-sm bg-amber-50/50 text-[11px] font-bold text-amber-700 hover:bg-amber-100/70 focus:outline-none transition-colors cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 mr-1" />
                Papel Membro
              </button>
            </div>
            <p className="mt-3.5 text-center text-slate-400 text-[10px] leading-relaxed">
              Credenciais de teste padrão:<br />
              <strong className="text-slate-500 font-mono">admin@igreja.com</strong> / <strong className="text-slate-500 font-mono">123456</strong> ou <strong className="text-slate-500 font-mono">membro@igreja.com</strong> / <strong className="text-slate-500 font-mono">123456</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
