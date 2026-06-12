'use client';

import { useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto bilingüe
import Link from 'next/link';

const ADMIN_EMAIL = "contacto@suautohonduras.com"; 

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage(); // 🔤 Consumimos las traducciones del contexto
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next') || searchParams.get('returnUrl');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Guard para evitar errores de Hydration Mismatch por la detección de OS del cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSuccessfulRedirect = useCallback((userEmail: string | null) => {
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (userEmail === ADMIN_EMAIL) {
      router.push('/panel-admin');
    } else {
      router.push('/cliente');
    }
  }, [router, redirectUrl]);

  // Si el usuario ya está logueado, lo redirigimos automáticamente según su rol
  useEffect(() => {
    if (!loading && user) {
      handleSuccessfulRedirect(user.email);
    }
  }, [user, loading, handleSuccessfulRedirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      handleSuccessfulRedirect(loggedInUser.email);
    } catch (err) {
      setLoginError(t.authLogin.errorCredentials);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoggingIn(true);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const loggedInUser = userCredential.user;

      handleSuccessfulRedirect(loggedInUser.email);
    } catch (error) {
      const err = error as any;
      if (err?.code !== 'auth/popup-closed-by-user') {
        setLoginError((t.authLogin as any).errorGoogleLogin || (language === 'en' ? 'Error logging in with Google' : 'Error al iniciar sesión con Google'));
      }
    } finally {
      setIsGoogleLoggingIn(false);
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

        <div className="mt-8 space-y-6">
          {loginError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {loginError}
            </div>
          )}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || isGoogleLoggingIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            {isGoogleLoggingIn ? t.authLogin.submittingBtn : ((t.authLogin as any).googleBtn || (language === 'en' ? 'Continue with Google' : 'Continuar con Google'))}
          </button>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-slate-500">{language === 'en' ? 'OR' : 'O'}</span>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
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
            disabled={isLoggingIn || isGoogleLoggingIn} 
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