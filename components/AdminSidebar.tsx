'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CarFront, Key, Users, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'vehiculos' | 'rentas' | 'clientes' | 'ajustes') => void;
  setShowAddForm: (show: boolean) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, setShowAddForm }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <aside className="w-16 md:w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 flex-shrink-0 transition-all duration-300">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-950 flex justify-center h-16 items-center">
          <Link href="/" className="relative w-full h-8 flex justify-center">
            <div className="hidden md:block">
              <Image src="/logo-white.png" alt="Su Auto" width={140} height={35} className="h-8 w-auto object-contain" priority />
            </div>
            <div className="block md:hidden text-lg font-black tracking-wider text-blue-500">SA</div>
          </Link>
        </div>

        {/* Menú Vertical */}
        <nav className="p-2 md:p-4 space-y-2">
          <button onClick={() => setActiveTab('vehiculos')} className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'vehiculos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <CarFront className="w-5 h-5" /> <span className="hidden md:inline">{t.admin?.sidebar?.inventory || 'Inventario Stock'}</span>
          </button>
          <button onClick={() => { setActiveTab('rentas'); setShowAddForm(false); }} className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'rentas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Key className="w-5 h-5" /> <span className="hidden md:inline">{t.admin?.sidebar?.rentals || 'Ver Rentas'}</span>
          </button>
          <button onClick={() => { setActiveTab('clientes'); setShowAddForm(false); }} className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'clientes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Users className="w-5 h-5" /> <span className="hidden md:inline">{t.admin?.sidebar?.customers || 'Clientes / Leads'}</span>
          </button>
          <button onClick={() => { setActiveTab('ajustes'); setShowAddForm(false); }} className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'ajustes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Settings className="w-5 h-5" /> <span className="hidden md:inline">{t.admin?.sidebar?.settings || 'Ajustes'}</span>
          </button>
        </nav>
      </div>

      {/* Footer del Sidebar */}
      <div className="p-2 md:p-4 border-t border-slate-800 bg-slate-950/40 text-center md:text-left">
        <div className="hidden md:block text-[10px] text-slate-500 mb-2 truncate px-2">{t.admin?.sidebar?.session || 'Sesión:'} {user.email}</div>
        <button 
          onClick={async () => { await logout(); router.push('/login'); }} 
          className="w-full flex items-center justify-center space-x-0 md:space-x-2 p-2.5 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-red-900 hover:text-white transition"
        >
          <LogOut className="w-4 h-4" /> <span className="hidden md:inline">{t.admin?.sidebar?.logout || 'Salir'}</span>
        </button>
      </div>
    </aside>
  );
}