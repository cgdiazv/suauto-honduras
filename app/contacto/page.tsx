'use client';

import { useState } from 'react';

export default function ContactoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send-contact-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 text-slate-700">
      
      {/* 👑 Título Principal de la Página */}
      <div className="text-center mb-12 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Ponte en Contacto
        </h1>
        <p className="text-base text-slate-500 max-w-xl mx-auto">
          ¿Tienes dudas sobre nuestro inventario o servicios? Estamos listos para ayudarte en San Pedro Sula.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start bg-white p-8 md:p-12 rounded-2xl border border-slate-100 shadow-xs">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN DE LA EMPRESA */}
        <div className="space-y-8">
          <div>
            {/* 📍 Subtítulo de Información corporativa */}
            <h2 className="text-xs font-black tracking-wider text-blue-900 uppercase border-b border-slate-100 pb-2 mb-4">
              Información Corporativa
            </h2>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Su Auto Honduras</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">📍</span>
                <span>2 Cll 8 y 9 Ave Guamilito, San Pedro Sula</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">📞</span>
                <span>(504) 2570-0962</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">✉️</span>
                <a href="mailto:contacto@suautohonduras.com" className="hover:underline text-blue-600 font-medium">
                  contacto@suautohonduras.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">📠</span>
                <span>Fax: (504) 2570-0962</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            {/* ⏰ Subtítulo de Horarios */}
            <h2 className="text-xs font-black tracking-wider text-blue-900 uppercase border-b border-slate-100 pb-2 mb-4">
              Horarios de Atención
            </h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="italic">Lun – Vie: <span className="font-medium text-slate-900">8AM – 6PM</span></p>
              <p className="italic">Sab: <span className="font-medium text-slate-900">8AM – 6PM</span></p>
              <p className="italic">Dom: <span className="font-bold text-red-600">CERRADO</span></p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO DE MENSAJE */}
        <div className="space-y-4">
          {/* ✉️ Subtítulo del Formulario */}
          <h2 className="text-xs font-black tracking-wider text-blue-900 uppercase border-b border-slate-100 pb-2 mb-4">
            Escríbenos un Mensaje
          </h2>

          {submitStatus === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg text-center">
              ✓ ¡Mensaje enviado con éxito! Nos comunicaremos con usted muy pronto.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg text-center">
              ❌ Ocurrió un inconveniente al enviar el formulario. Intente de nuevo.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Nombre" 
                className="w-full bg-slate-100/70 p-3 text-sm border-0 rounded-md focus:ring-2 focus:ring-blue-900 placeholder-slate-400"
              />
            </div>

            <div>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email" 
                className="w-full bg-slate-100/70 p-3 text-sm border-0 rounded-md focus:ring-2 focus:ring-blue-900 placeholder-slate-400"
              />
            </div>

            <div>
              <textarea 
                name="message" 
                required 
                rows={5} 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Mensaje" 
                className="w-full bg-slate-100/70 p-3 text-sm border-0 rounded-md focus:ring-2 focus:ring-blue-900 placeholder-slate-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold py-3.5 px-4 rounded-md text-sm uppercase tracking-wider transition shadow-md disabled:bg-slate-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSending ? '⏳ Enviando Mensaje...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}