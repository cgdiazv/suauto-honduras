// src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  // Estado para controlar la apertura del Drawer móvil
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Navigation (Escritorio - Oculto en Móvil) */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <Link href="/vender" className="hover:text-blue-600 transition">Vender Vehículo</Link>
            <Link href="/rentar" className="hover:text-blue-600 transition">Rentar Vehículo</Link>
            <Link href="/noticias" className="hover:text-blue-600 transition">Noticias</Link>
            <Link href="/contacto" className="hover:text-blue-600 transition">Contáctenos</Link>
          </nav>

          {/* Botón de Entrada (Escritorio) y Hamburguesa (Móvil) */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="hidden sm:inline-block rounded-lg bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition"
              onClick={closeDrawer}
            >
              Ingresar
            </Link>

            {/* ☰ Icono de Menú Hamburguesa (Solo Móvil) */}
            <button
              onClick={toggleDrawer}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden md:hidden cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 📱 DRAWER MÓVIL (DESLIZABLE DESDE LA DERECHA HACIA LA IZQUIERDA) */}
      <div className={`relative z-50 md:hidden ${isOpen ? 'block' : 'pointer-events-none'}`} role="dialog" aria-modal="true">
        
        {/* Fondo oscurecido (Backdrop) */}
        <div 
          onClick={closeDrawer}
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          {/* Contenedor del Panel del Drawer */}
          <div 
            className={`w-screen max-w-xs transform bg-white p-6 shadow-2xl ring-1 ring-black/5 transition duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Cabecera interna del Drawer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <span className="font-black text-slate-900 tracking-wider text-sm uppercase">Menú de Opciones</span>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <span className="sr-only">Cerrar menú</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Enlaces de Navegación Verticales */}
            <nav className="mt-6 flex flex-col space-y-4">
              <Link 
                href="/vender" 
                onClick={closeDrawer}
                className="flex items-center rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                💰 Vender Vehículo
              </Link>
              <Link 
                href="/rentar" 
                onClick={closeDrawer}
                className="flex items-center rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                🔑 Rentar Vehículo
              </Link>
              <Link 
                href="/noticias" 
                onClick={closeDrawer}
                className="flex items-center rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                📰 Noticias
              </Link>
              <Link 
                href="/contacto" 
                onClick={closeDrawer}
                className="flex items-center rounded-xl p-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                ✉️ Contáctenos
              </Link>
              
              <div className="pt-4 border-t border-slate-100">
                <Link 
                  href="/login" 
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  Ingresar al Sistema
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}