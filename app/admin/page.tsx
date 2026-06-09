// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear error notice after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError('Credenciales inválidas. Por favor verifique el correo y la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // IF LOGGED IN: Show a temporary placeholder dashboard 
  // (We will expand this into the vehicle upload/edit/delete CRUD panel next!)
  if (user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Panel de Administración</h1>
            <p className="text-sm text-slate-500 mt-1">Conectado como: {user.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-600 font-medium">¡Sesión iniciada correctamente!</p>
          <p className="text-sm text-slate-400 mt-1">El siguiente paso es construir el formulario CRUD para agregar, editar y eliminar vehículos.</p>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: Show the login screen
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-blue-900">
            SU AUTO<span className="text-blue-500">.hn</span>
          </h2>
          <h3 className="mt-3 text-xl font-bold text-slate-800">Control de Inventario</h3>
          <p className="mt-1 text-sm text-slate-500">Inicie sesión para gestionar los vehículos en exhibición</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50"
                placeholder="ejemplo@suautohonduras.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}