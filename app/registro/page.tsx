// src/app/registro/page.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';

export default function RegistroPage() {
  const router = useRouter();

  // Estados del Formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('San Pedro Sula');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de Control
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas en el cliente
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Guardar el perfil extendido en Firestore usando el UID del auth
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone,
        city,
        role: 'client',
        createdAt: Date.now()
      });

      // 3. Redirigir automáticamente al espacio de cliente
      router.push('/cliente');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else {
        setError('Ocurrió un error al crear la cuenta. Intente de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-blue-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Regístrese para gestionar rentas de vehículos y citas en el taller
          </p>
        </div>

        <form className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={handleRegister}>
          {error && (
            <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. 9999-1234"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ciudad</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="San Pedro Sula">San Pedro Sula</option>
              <option value="Tegucigalpa">Tegucigalpa</option>
              <option value="Progreso">El Progreso</option>
              <option value="La Ceiba">La Ceiba</option>
              <option value="Choloma">Choloma</option>
            </select>
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Contraseña</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isSubmitting ? 'Registrando Cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-500 border-t pt-4">
          ¿Ya tiene una cuenta?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Inicie sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}