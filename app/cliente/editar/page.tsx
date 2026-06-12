'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { User, Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function EditarCuentaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();

  // Estados de Información Personal
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState({ type: '', text: '' });

  // Estados de Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Estados de Eliminar Cuenta
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
          setCity(data.city || 'San Pedro Sula');
          setAddress(data.address || ''); 
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    }
    loadUserData();
  }, [user]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingInfo(true);
    setInfoMessage({ type: '', text: '' });

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        fullName,
        phone,
        city,
        address
      });
      setInfoMessage({ type: 'success', text: t.editAccount?.infoSuccess || 'Información actualizada correctamente.' });
    } catch (error) {
      console.error(error);
      setInfoMessage({ type: 'error', text: t.editAccount?.infoError || 'Error al actualizar la información.' });
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t.editAccount?.passwordMatchError || 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t.editAccount?.passwordLengthError || 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // 1. Reautenticar al usuario
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Actualizar contraseña
      await updatePassword(user, newPassword);
      
      setPasswordMessage({ type: 'success', text: t.editAccount?.passwordSuccess || 'Contraseña actualizada exitosamente.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setPasswordMessage({ type: 'error', text: t.editAccount?.passwordWrongError || 'La contraseña actual es incorrecta.' });
      } else {
        setPasswordMessage({ type: 'error', text: t.editAccount?.passwordGeneralError || 'Error al actualizar la contraseña. Re-autenticación podría ser necesaria.' });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    
    setIsDeleting(true);
    setDeleteMessage({ type: '', text: '' });

    try {
      // 1. Reautenticar al usuario por seguridad antes de eliminar
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Eliminar datos del usuario en Firestore
      const docRef = doc(db, 'users', user.uid);
      await deleteDoc(docRef);

      // 3. Eliminar usuario de Firebase Auth
      await deleteUser(user);

      // 4. Redirigir al inicio o página de login (AuthContext debería manejar la sesión)
      router.push('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setDeleteMessage({ type: 'error', text: t.editAccount?.deleteWrongPassword || 'La contraseña es incorrecta.' });
      } else {
        setDeleteMessage({ type: 'error', text: t.editAccount?.deleteGeneralError || 'Error al eliminar la cuenta. Por favor intente nuevamente.' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="p-12 text-center text-slate-500 text-sm">{t.accountDashboard?.loadingSpace || 'Cargando...'}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Cabecera */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        <Link href="/cliente" className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t.editAccount?.pageTitle || 'Editar Cuenta'}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.editAccount?.pageSub || 'Gestione su información personal y de seguridad'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Formulario de Información Personal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-blue-600" /> {t.editAccount?.personalInfoTitle || 'Información Personal'}
          </h2>

          {infoMessage.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${infoMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {infoMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.fullNameLabel || 'Nombre Completo'}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.phoneLabel || 'Teléfono / WhatsApp'}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.cityLabel || 'Ciudad'}</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="San Pedro Sula">{t.editAccount?.cities?.sps || 'San Pedro Sula'}</option>
                <option value="Tegucigalpa">{t.editAccount?.cities?.tegucigalpa || 'Tegucigalpa'}</option>
                <option value="Progreso">{t.editAccount?.cities?.progreso || 'El Progreso'}</option>
                <option value="La Ceiba">{t.editAccount?.cities?.laCeiba || 'La Ceiba'}</option>
                <option value="Choloma">{t.editAccount?.cities?.choloma || 'Choloma'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.addressLabel || 'Dirección Completa'}</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={t.editAccount?.addressPlaceholder || "Ej. Colonia Universidad, 3ra calle, casa #12"}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingInfo}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:bg-blue-400"
              >
                {isUpdatingInfo ? (t.editAccount?.savingChanges || 'Guardando...') : (t.editAccount?.saveChangesBtn || 'Guardar Cambios')}
              </button>
            </div>
          </form>
        </div>

        {/* Formulario de Seguridad (Contraseña) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-emerald-600" /> {t.editAccount?.securityTitle || 'Seguridad'}
          </h2>

          {passwordMessage.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.currentPasswordLabel || 'Contraseña Actual'}</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.newPasswordLabel || 'Nueva Contraseña'}</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t.editAccount?.confirmPasswordLabel || 'Confirmar Nueva Contraseña'}</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:bg-emerald-400"
              >
                {isUpdatingPassword ? (t.editAccount?.updatingPassword || 'Actualizando...') : (t.editAccount?.updatePasswordBtn || 'Actualizar Contraseña')}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Zona de Peligro - Eliminar Cuenta */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-xs mt-8">
        <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" /> {t.editAccount?.dangerZoneTitle || 'Advertencia: Eliminar Cuenta'}
        </h2>
        <p className="text-sm text-red-600 mb-6">
          {t.editAccount?.dangerZoneSub || 'Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.'}
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
          >
            {t.editAccount?.deleteAccountBtn || 'Eliminar mi cuenta'}
          </button>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-red-200 mt-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {t.editAccount?.deletePrompt || 'Para continuar, por favor ingresa tu contraseña actual:'}
            </p>
            
            {deleteMessage.text && (
              <div className={`mb-3 p-3 rounded-lg text-sm font-medium border ${deleteMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {deleteMessage.text}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="password"
                required
                placeholder={t.editAccount?.deletePasswordPlaceholder || "Tu contraseña actual"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full md:w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-red-500 block"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition disabled:bg-red-400"
                >
                  {isDeleting ? (t.editAccount?.deletingAccount || 'Eliminando...') : (t.editAccount?.confirmDeleteBtn || 'Confirmar Eliminación')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeleteMessage({ type: '', text: '' });
                  }}
                  disabled={isDeleting}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}