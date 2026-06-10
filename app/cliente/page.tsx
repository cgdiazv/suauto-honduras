// src/app/cliente/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Car, Key } from 'lucide-react';

export default function ClienteDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Protección de ruta de cliente en el cliente
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-12 text-center text-slate-500 text-sm">Cargando espacio de cliente...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Espacio Su Auto</h1>
          <p className="text-sm text-slate-500 mt-1">Bienvenido a su portal, {user.email}</p>
        </div>
        <button 
          onClick={() => { logout(); router.push('/login'); }} 
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Vista previa del espacio del cliente responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Tarjeta: Favoritos y Cotizaciones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Car className="w-5 h-5 text-slate-700" /> Mis Autos Guardados / Cotizaciones
          </h2>
          <p className="text-sm text-slate-500">
            Aquí podrá ver los vehículos que ha marcado como favoritos o los estados de sus solicitudes de financiamiento.
          </p>
        </div>
        
        {/* Tarjeta Optimizada: Detalles de las Rentas del Cliente */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-700" /> Detalles de mis Rentas
          </h2>
          <p className="text-sm text-slate-500">
            Historial de solicitudes de alquiler, fechas de recogida/devolución y el estado de validación de sus documentos en tiempo real.
          </p>
        </div>

      </div>
    </div>
  );
}