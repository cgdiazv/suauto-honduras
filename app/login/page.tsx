// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const ADMIN_EMAIL = "contacto@suautohonduras.com"; 

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Si el usuario ya está logueado, lo redirigimos automáticamente según su rol
  useEffect(() => {
    if (!loading && user) {
      if (user.email === ADMIN_EMAIL) {
        router.push('/panel-admin');
      } else {
        router.push('/cliente');
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      if (loggedInUser.email === ADMIN_EMAIL) {
        router.push('/panel-admin'); // <-- Redirección al nuevo panel
      } else {
        router.push('/cliente');
      }
    } catch (err) {
      setLoginError('Credenciales incorrectas. Verifique su correo y contraseña.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading || user) {
    return <div className="p-12 text-center text-slate-500 text-sm">Verificando sesión...</div>;
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-blue-900">Ingresar</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {loginError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {loginError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden" 
                placeholder="nombre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden" 
                placeholder="•••••••••••••••"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoggingIn} 
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            {isLoggingIn ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 border-t pt-4 mt-4">
          ¿Cliente nuevo?{' '}
          <Link href="/registro" className="font-semibold text-blue-600 hover:underline">
            Regístrese aquí
          </Link>
        </div>
      </div>
    </div>
  );
}