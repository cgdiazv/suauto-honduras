// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

// Define aquí el correo o correos que tendrán superpoderes de Admin
const ADMIN_EMAIL = "admin@suautohonduras.com"; 

export default function LoginPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      // Redirección inteligente basada en el rol del correo
      if (loggedInUser.email === ADMIN_EMAIL) {
        // Si es Admin, lo dejamos aquí mismo o lo mandamos a una subruta si lo prefieres
        router.push('/login'); 
      } else {
        // Si es Cliente, lo mandamos a su panel exclusivo de seguimiento
        router.push('/cliente');
      }
    } catch (err) {
      setLoginError('Credenciales incorrectas. Verifique su correo y contraseña.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ================= CASO 1: YA ESTÁ LOGUEADO COMO ADMIN =================
  if (user && user.email === ADMIN_EMAIL) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Panel de Administración</h1>
            <p className="text-sm text-emerald-600 font-medium mt-1">Nivel de acceso: Administrador Master</p>
          </div>
          <button onClick={() => logout()} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
            Cerrar Sesión
          </button>
        </div>
        {/* Aquí va la tabla de inventario y el formulario CRUD que creamos en el paso anterior */}
        <div className="bg-white p-6 rounded-xl border text-center text-slate-500">
          [Aquí se despliega el control de inventario de vehículos de Su Auto]
        </div>
      </div>
    );
  }

  // ================= CASO 2: YA ESTÁ LOGUEADO PERO ES UN CLIENTE =================
  // Si por alguna razón entra a /login estando logueado como cliente, lo despachamos a su sección
  if (user && user.email !== ADMIN_EMAIL) {
    if (typeof window !== 'undefined') {
      router.push('/cliente');
    }
    return null;
  }

  // ================= CASO 3: FORMULARIO DE INGRESO PÚBLICO =================
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500" 
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500" 
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoggingIn} 
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {isLoggingIn ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 border-t pt-4 mt-4">
          ¿Cliente nuevo?{' '}
          <Link href="/registro" className="font-semibold text-blue-600 hover:underline">
            Regístrese aquí para abrir su cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}