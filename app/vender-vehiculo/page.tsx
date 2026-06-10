'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function VenderVehiculo() {
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Vende tu Vehículo con Nosotros
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Completa el formulario con los datos de tu auto y nos pondremos en contacto contigo a la brevedad.
        </p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <span className="text-2xl">🎉</span>
          <h3 className="text-lg font-bold text-emerald-800 mt-2">¡Propuesta enviada con éxito!</h3>
          <p className="text-sm text-emerald-600 mt-1">Hemos recibido los datos de tu auto. El equipo de Su Auto revisará la información y te contactará pronto.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-semibold text-rose-800 text-center">
          ❌ Hubo un error al procesar el envío. Por favor, verifica los campos o intenta más tarde.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* SECCIÓN 1: DATOS DEL CONTACTO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">1. Datos Personales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. Carlos Diaz" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Número de Teléfono / WhatsApp *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. 9999-9999" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="nombre@correo.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad / Ubicación (Opcional)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. San Pedro Sula" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL VEHÍCULO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">2. Detalles del Auto</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. Toyota" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Modelo *</label>
              <input type="text" name="modelName" required value={formData.modelName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. Corolla" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Año *</label>
              <input type="number" name="year" required value={formData.year} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. 2018" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kilometraje *</label>
              <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. 45000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Precio Estimado *</label>
              <input type="text" name="price" required value={formData.price} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Ej. L 250,000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transmisión *</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium">
                <option value="Automática">Automática</option>
                <option value="Mecánica">Mecánica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Combustible *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium">
                <option value="Gasolina">Gasolina</option>
                <option value="Diésel">Diésel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Estado del Auto</label>
              <textarea name="details" rows={2} value={formData.details} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-500" placeholder="Detalles de pintura, llantas, extras o condiciones mecánicas especiales..." />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: MULTIMEDIA FOTO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">3. Fotografía Principal del Vehículo</h2>
          
          <div className="flex flex-col space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50">
            {imageUrl ? (
              <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg border bg-white">
                <img src={imageUrl} alt="Vista previa" className="h-full w-full object-cover" />
                <button type="button" onClick={() => { setImageUrl(''); setUploadProgress(0); }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-[10px] px-2.5 font-bold hover:bg-red-700 transition shadow-xs cursor-pointer">
                  Eliminar Foto
                </button>
              </div>
            ) : isUploading ? (
              <div className="relative flex flex-col items-center justify-center border-2 border-blue-300 rounded-lg p-6 bg-blue-50/30 animate-pulse min-h-[120px]">
                <span className="text-xs font-bold text-blue-700">⏳ Subiendo Imagen...</span>
                <span className="text-lg font-black text-blue-900 mt-1">{uploadProgress}%</span>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 max-w-[180px]">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-white hover:bg-slate-50 transition cursor-pointer min-h-[120px]">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                <span className="text-xs font-bold text-blue-600">📸 Adjuntar una Foto Clara</span>
                <span className="text-[10px] text-slate-400 mt-1">Formatos JPG o PNG de la galería</span>
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
              <>⏳ Enviando Propuesta...</>
            ) : (
              <>Enviar Datos a Tasación &rarr;</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}