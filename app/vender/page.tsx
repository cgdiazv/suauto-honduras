'use client';

import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto bilingüe
import { Camera, PartyPopper, XCircle, Loader2 } from 'lucide-react';

export default function VenderVehiculo() {
  const { t } = useLanguage(); // 🔤 Consumimos las traducciones del contexto

  // Datos del Formulario
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', location: '',
    brand: '', modelName: '', year: '', mileage: '', price: '',
    transmission: 'Automática', fuelType: 'Gasolina', details: ''
  });

  // Estados de carga e interfaz
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);

  // Guard de hidratación para asegurar coincidencia con la detección del idioma del OS
  useEffect(() => {
    setMounted(true);
  }, []);

  // Controlador de entradas de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 📸 Subida de imagen a Firebase Storage
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(1);

    const fileName = `${Date.now()}_vender_${file.name}`;
    const storageRef = ref(storage, `proposals/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress === 0 ? 1 : progress);
      },
      (error) => {
        console.error("Error en Storage:", error);
        alert("No se pudo cargar la imagen. Revisa los permisos de Storage.");
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          setIsUploading(false);
          setUploadProgress(100);
        });
      }
    );
  };

  // ✉️ Envío del formulario final hacia el endpoint de Resend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send-sell-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl })
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Limpiamos el formulario
        setFormData({
          fullName: '', phone: '', email: '', location: '',
          brand: '', modelName: '', year: '', mileage: '', price: '',
          transmission: 'Automática', fuelType: 'Gasolina', details: ''
        });
        setImageUrl('');
        setUploadProgress(0);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error("Error de envío:", error);
      setSubmitStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  // Retorno prematuro limpio mientras Next.js monta el cliente
  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {t.sell.title}
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          {t.sell.subtitle}
        </p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <span className="flex justify-center"><PartyPopper className="w-8 h-8 text-emerald-600" /></span>
          <h3 className="text-lg font-bold text-emerald-800 mt-2">{t.sell.successTitle}</h3>
          <p className="text-sm text-emerald-600 mt-1">{t.sell.successMsg}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-semibold text-rose-800 text-center flex items-center justify-center gap-2">
          <XCircle className="w-5 h-5" /> {t.sell.errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* SECCIÓN 1: DATOS DEL CONTACTO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">{t.sell.personalData}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.fullName} *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.phone} *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. 9999-9999" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.email}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="nombre@correo.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.location}</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. San Pedro Sula" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL VEHÍCULO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">{t.sell.carDetails}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.brand} *</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. Toyota" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.model} *</label>
              <input type="text" name="modelName" required value={formData.modelName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. Corolla" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.year} *</label>
              <input type="number" name="year" required value={formData.year} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. 2018" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.mileage} *</label>
              <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. 45000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.price} *</label>
              <input type="text" name="price" required value={formData.price} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. L 250,000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.transmission} *</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium">
                <option value="Automática">Automática</option>
                <option value="Mecánica">Mecánica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.fuelType} *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium">
                <option value="Gasolina">Gasolina</option>
                <option value="Diésel">Diésel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.sell.description}</label>
              <textarea name="details" rows={2} value={formData.details} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Detalles de pintura, llantas, extras o condiciones mecánicas especiales..." />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: MULTIMEDIA FOTO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">{t.sell.photoSection}</h2>
          
          <div className="flex flex-col space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50">
            {imageUrl ? (
              <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg border bg-white">
                <img src={imageUrl} alt="Vista previa" className="h-full w-full object-cover" />
                <button type="button" onClick={() => { setImageUrl(''); setUploadProgress(0); }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-[10px] px-2.5 font-bold hover:bg-red-700 transition shadow-xs cursor-pointer">
                  {t.sell.removePhoto}
                </button>
              </div>
            ) : isUploading ? (
              <div className="relative flex flex-col items-center justify-center border-2 border-blue-300 rounded-lg p-6 bg-blue-50/30 animate-pulse min-h-[120px]">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {t.sell.uploading}</span>
                <span className="text-lg font-black text-blue-900 mt-1">{uploadProgress}%</span>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 max-w-[180px]">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-white hover:bg-slate-50 transition cursor-pointer min-h-[120px]">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                <span className="text-xs font-bold text-blue-600 flex items-center gap-2"><Camera className="w-5 h-5" /> {t.sell.attachPhoto}</span>
                <span className="text-[10px] text-slate-400 mt-1">{t.sell.photoFormat}</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSending || isUploading}
            className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
              isSending || isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t.sell.sending}</>
            ) : (
              <>{t.sell.sendBtn} &rarr;</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}