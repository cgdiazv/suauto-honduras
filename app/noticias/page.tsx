// app/noticias/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NoticiasComingSoonPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { t } = useLanguage();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      // Reutilizamos el endpoint de contacto o creamos un flujo rápido simulado
      const response = await fetch('/api/send-contact-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: t.news?.subscriberName || 'Suscriptor de Noticias',
          email: email,
          message: t.news?.subscriberMessage || 'Deseo recibir notificaciones automáticas cuando el portal de noticias de Su Auto Honduras esté activo.'
        })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-cover bg-center px-4 py-12 text-white overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)), url('/hero-suauto.png')` 
      }}
    >
      {/* Elementos decorativos de fondo abstractos */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 bg-slate-900/40 p-8 sm:p-12 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl">
        
        {/* Badge Informativo */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse mx-auto">
          {t.news?.badge || '📢 Portal en Desarrollo'}
        </div>

        {/* Encabezado Principal */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t.news?.title || 'Próximamente'}
          </h1>
          <p className="text-base text-slate-300 max-w-lg mx-auto font-medium">
            {t.news?.description || 'Estamos construyendo el rincón automotriz definitivo. Muy pronto podrás leer reseñas exclusivas, consejos mecánicos y lanzamientos de vehículos en Honduras.'}
          </p>
        </div>

        <hr className="border-slate-800 max-w-xs mx-auto" />

        {/* Formulario de Captación de Leads */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.news?.prompt || '¿Quieres ser el primero en enterarte?'}
          </p>

          {status === 'success' ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold max-w-md mx-auto">
              {t.news?.successMsg || '🎉 ¡Registro exitoso! Te enviaremos una notificación en cuanto encendamos los motores del blog.'}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email"
                required
                disabled={status === 'loading'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.news?.emailPlaceholder || "Ingresa tu correo electrónico"}
                className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-white placeholder-slate-500 transition"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {status === 'loading' ? (t.news?.processing || 'Procesando...') : (t.news?.notifyBtn || 'Notificarme')}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-xs text-rose-400 font-semibold">
              {t.news?.errorMsg || '❌ No se pudo procesar el registro. Inténtalo de nuevo más tarde.'}
            </p>
          )}
        </div>

        {/* Enlace de retorno */}
        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> 
            {t.news?.backHome || 'Volver al Inventario Principal'}
          </Link>
        </div>

      </div>
    </div>
  );
}