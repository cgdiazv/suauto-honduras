'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto bilingüe
import Link from 'next/link';

const ADMIN_EMAIL = "contacto@suautohonduras.com"; 

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage(); // 🔤 Consumimos las traducciones del contexto
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Guard para evitar errores de Hydration Mismatch por la detección de OS del cliente
  useEffect(() => {
    setMounted(true);
  }, []);

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
        router.push('/panel-admin'); 
      } else {
        router.push('/cliente');
      }
    } catch (err) {
      setLoginError(t.authLogin.errorCredentials);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!mounted || loading || user) {
    return <div className="p-12 text-center text-slate-500 text-sm">{t.authLogin.verifyingSession}</div>;
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-blue-900">
            {t.authLogin.title}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {loginError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {loginError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {t.authLogin.emailLabel}
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden" 
                placeholder={t.authLogin.emailPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {t.authLogin.passwordLabel}
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden" 
                placeholder={t.authLogin.passwordPlaceholder}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoggingIn} 
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
          >
            {isLoggingIn ? t.authLogin.submittingBtn : t.authLogin.submitBtn}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 border-t pt-4 mt-4">
          {t.authLogin.newUserPrompt}{' '}
          <Link href="/registro" className="font-semibold text-blue-600 hover:underline">
            {t.authLogin.registerLink}
          </Link>
        </div>
      </div>
    </div>
  );
}