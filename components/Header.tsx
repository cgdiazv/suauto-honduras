'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, CircleDollarSign, Key, Newspaper, Mail, Globe } from 'lucide-react'; 
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext'; 

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage(); 

  const isAdmin = user?.email === 'contacto@suautohonduras.com';

  const toggleDrawer = () => setIsOpen(!isOpen);
  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeDrawer}>
            <Image 
              src="/logo.webp" 
              alt="Su Auto Honduras" 
              width={200} 
              height={60} 
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation (Escritorio - Traducido Dinámicamente) */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <Link href="/vender" className="hover:text-blue-600 transition">{t.nav.sell}</Link>
            <Link href="/rentar" className="hover:text-blue-600 transition">{t.nav.rent}</Link>
            <Link href="/noticias" className="hover:text-blue-600 transition">{t.nav.news}</Link>
            <Link href="/contacto" className="hover:text-blue-600 transition">{t.nav.contact}</Link>
          </nav>

          {/* Bloque de Acciones y Selectores */}
          <div className="flex items-center space-x-4">
            
            {/* SELECTOR DE IDIOMA MANUAL (Escritorio) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-bold text-slate-500">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <button 
                onClick={() => setLanguage('es')} 
                className={`px-2 py-1 rounded-md transition cursor-pointer ${language === 'es' ? 'bg-white text-blue-600 shadow-xs font-black' : 'hover:text-slate-800'}`}
              >
                ESP
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-2 py-1 rounded-md transition cursor-pointer ${language === 'en' ? 'bg-white text-blue-600 shadow-xs font-black' : 'hover:text-slate-800'}`}
              >
                ENG
              </button>
            </div>

            {user ? (
              <Link 
                href={isAdmin ? "/panel-admin" : "/cliente"} 
                className={`hidden sm:inline-block rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  isAdmin 
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100" 
                    : "bg-[#67bd45]/10 text-[#67bd45] hover:bg-[#67bd45]/20"
                }`}
                onClick={closeDrawer}
              >
                {isAdmin ? t.navAuth.adminPanel : t.nav.account}
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="hidden sm:inline-block rounded-lg bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition"
                onClick={closeDrawer}
              >
                {t.navAuth.loginBtn}
              </Link>
            ) }

            {/* ☰ Icono de Menú Hamburguesa (Solo Móvil) */}
            <button
              onClick={toggleDrawer}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden md:hidden cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 📱 DRAWER MÓVIL */}
      <div className={`relative z-50 md:hidden ${isOpen ? 'block' : 'pointer-events-none'}`} role="dialog" aria-modal="true">
        
        {/* Backdrop */}
        <div 
          onClick={closeDrawer}
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div 
            className={`w-screen max-w-xs transform bg-white p-6 shadow-2xl ring-1 ring-black/5 transition duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Cabecera interna del Drawer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <span className="font-black text-slate-900 tracking-wider text-xs uppercase">Menu</span>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <span className="sr-only">Cerrar menú</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Enlaces de Navegación Verticales Traducidos */}
            <nav className="mt-6 flex flex-col space-y-4">
              <Link 
                href="/vender" 
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <CircleDollarSign className="w-5 h-5" /> {t.nav.sell}
              </Link>
              <Link 
                href="/rentar" 
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <Key className="w-5 h-5" /> {t.nav.rent}
              </Link>
              <Link 
                href="/noticias" 
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <Newspaper className="w-5 h-5" /> {t.nav.news}
              </Link>
              <Link 
                href="/contacto" 
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <Mail className="w-5 h-5" /> {t.nav.contact}
              </Link>
              
              {/* SELECTOR DE IDIOMA EN MÓVIL */}
              <div className="flex items-center justify-between border-t border-b border-slate-100 py-3 my-2 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Idioma / Language
                </span>
                <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs font-bold">
                  <button onClick={() => setLanguage('es')} className={`px-2.5 py-1 rounded-md ${language === 'es' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}>ES</button>
                  <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-md ${language === 'en' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}>EN</button>
                </div>
              </div>

              <div className="pt-2">
                {user ? (
                  <Link 
                    href={isAdmin ? "/panel-admin" : "/cliente"} 
                    onClick={closeDrawer}
                    className={`w-full flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white shadow-xs transition ${
                      isAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-[#67bd45] hover:bg-[#5ca83e]"
                    }`}
                  >
                    {isAdmin ? t.navAuth.adminPanel : t.nav.account}
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={closeDrawer}
                    className="w-full flex items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    {t.navAuth.loginMobileBtn}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}