// app/rentar/page.tsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto de idioma
import { useRouter } from 'next/navigation'; // 🔑 Importamos el router para la redirección
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore'; 
import { storage, db } from '@/lib/firebase'; 
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Trash2, 
  FileText, 
  ArrowRight,
  User,
  Briefcase,
  Home,
  CalendarDays
} from 'lucide-react';

const initialFormData = {
  firstName: '', lastName: '', idNumber: '', birthDate: '', licenseNumber: '', licenseExpiry: '', email: '', phone: '', address: '', referencePoint: '', city: '', state: '', zipCode: '', country: 'Honduras',
  workCompany: '', workPosition: '', workEmail: '', workPhone: '', workAddress1: '', workAddress2: '', workCity: '', workState: '', workZipCode: '',
  stayAddress1: '', stayAddress2: '', stayCity: '', stayState: '', stayZipCode: '',
  pickupDate: '', pickupTime: '', returnDate: '', returnTime: '', vehicleType: ''
};

export default function RentarVehiculoPage() {
  const { user, loading } = useAuth(); // 🔑 Consumimos 'loading' para saber si Firebase ya verificó la sesión
  const { t, language } = useLanguage(); // 🔤 Consumimos el diccionario
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);

  // Estado multimedia
  const [licenseImg, setLicenseImg] = useState<string>('');
  const [idImg, setIdImg] = useState<string>('');
  const [selfieImg, setSelfieImg] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Estados de proceso
  const [loadingFile, setLoadingFile] = useState<{ [key: string]: boolean }>({});
  const [isSending, setIsSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Referencias para firma y cámara
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const isDrawing = useRef(false);

  // 🛡️ PROTECCIÓN DE RUTA INMEDIATA
  useEffect(() => {
    // Si el AuthContext ya terminó de cargar el estado y determina que NO hay usuario
    if (!loading && !user) {
      router.push('/login?redirect=/rentar'); // Lo mandamos al login y guardamos la ruta de retorno
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadToFirebase = async (file: File, pathKey: string, setUrl: (url: string) => void) => {
    if (!user) {
      alert(t.rentalPage?.storageAuthError || "Debes iniciar sesión para poder cargar tus documentos.");
      router.push('/login?redirect=/rentar');
      return;
    }

    setLoadingFile(prev => ({ ...prev, [pathKey]: true }));
    try {
      // Creamos la referencia del archivo
      const storageRef = ref(storage, `rentals/${Date.now()}_${pathKey}_${file.name}`);
      
      // 🔑 Forzamos metadatos explícitos para obligar al SDK a empaquetar el estado de autenticación actual
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploadedBy': user.uid
        }
      };

      // Pasamos los metadatos como tercer parámetro en uploadBytes
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(snapshot.ref);
      setUrl(url);
    } catch (err: any) {
      console.error("Error crítico en Storage:", err);
      alert(`Error al subir el archivo: ${err.message || 'Verifica tu conexión.'}`);
    } finally {
      setLoadingFile(prev => ({ ...prev, [pathKey]: false }));
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert(t.rentalPage?.cameraAccessError || "No se pudo acceder a la cámara frontal.");
      setCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelfieImg(dataUrl);
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    draw(e);
  };

  const stopDrawing = () => { isDrawing.current = false; canvasRef.current?.getContext('2d')?.beginPath(); };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const clearSignature = () => {
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert(t.rentalPage?.submitAuthError || "Debes iniciar sesión para poder enviar una solicitud de renta.");
      return;
    }

    if (!termsAccepted) { 
      alert(t.rentalPage?.termsValidationError || "Debe aceptar los términos y condiciones de uso."); 
      return; 
    }
    
    if (!licenseImg || !idImg || !selfieImg) {
      alert(t.rentalPage?.docsValidationError || "Por favor, asegúrate de cargar todos los documentos requeridos (Licencia, Identidad y Selfie) antes de enviar.");
      return;
    }

    setIsSending(true);
    setSubmitStatus('idle');

    let signatureImgUrl = '';
    if (canvasRef.current) {  
      signatureImgUrl = canvasRef.current.toDataURL('image/png');
    }

    const timestamp = new Date().toISOString();
    const requestBody = {
      ...formData,
      licenseImgUrl: licenseImg,
      idImgUrl: idImg,
      selfieImgUrl: selfieImg,
      signatureImgUrl,
      createdAt: timestamp,
      status: 'Pendiente',
      ...(user && { userId: user.uid, userEmail: user.email })
    };

    try {
      await addDoc(collection(db, 'rentals'), requestBody);

      const response = await fetch('/api/send-rent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData(initialFormData);
        clearSignature();
        setLicenseImg(''); setIdImg(''); setSelfieImg('');
        setTermsAccepted(false);
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  // ⏳ Mientras Firebase valida el estado de la sesión, mostramos pantalla de carga limpia
  if (loading || (!user && loading)) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
        {t.rentalPage?.verifyingAccess || "Verificando credenciales de acceso..."}
      </div>
    );
  }

  // Si ya no está cargando y no hay usuario, el useEffect se encarga de redirigir, 
  // pero retornamos null aquí para evitar el parpadeo visual del formulario desprotegido.
  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {t.rentalPage?.pageTitle || "Enviar Solicitud de Renta"}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
          {t.rentalPage?.pageSub || "Completa el formulario y uno de nuestros asesores se pondrá en contacto contigo a la brevedad."}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* BLOQUE 1: INFORMACIÓN PERSONAL */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-5 h-5" /> {t.sections?.personal || "1. Información Personal"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.firstName || "Nombres *"}</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.rentalPage?.placeholders?.firstName || "Ej. Juan"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.lastName || "Apellidos *"}</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.rentalPage?.placeholders?.lastName || "Ej. Pérez"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.idNumber || "Número de Identificación o Pasaporte *"}</label>
              <input type="text" name="idNumber" required value={formData.idNumber} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.birthDate || "Fecha de Nacimiento *"}</label>
              <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.licenseNumber || "Número de Licencia *"}</label>
              <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.licenseExpiry || "Fecha de Expiración de Licencia *"}</label>
              <input type="date" name="licenseExpiry" required value={formData.licenseExpiry} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.email || "Email *"}</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.rentalPage?.placeholders?.email || "nombre@correo.com"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.phone || "Teléfono *"}</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.rentalPage?.placeholders?.phone || "Ej. 9999-9999"} />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.address || "Dirección de Residencia *"}</label>
                <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.referencePoint || "Punto de Referencia"}</label>
                <input type="text" name="referencePoint" value={formData.referencePoint} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.city || "Ciudad *"}</label>
                <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.state || "Estado/Provincia *"}</label>
                <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.zipCode || "Código Postal"}</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.country || "País de Residencia *"}</label>
                <select name="country" value={formData.country} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700">
                  <option value="Honduras">{t.rentalPage?.countries?.honduras || "Honduras"}</option>
                  <option value="Estados Unidos">{t.rentalPage?.countries?.usa || "Estados Unidos"}</option>
                  <option value="Otro">{t.rentalPage?.countries?.other || "Otro"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: INFORMACIÓN DE TRABAJO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> {t.sections?.work || "2. Información de Trabajo"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.workCompany || "Nombre de Empresa *"}</label>
              <input type="text" name="workCompany" required value={formData.workCompany} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.workPosition || "Cargo *"}</label>
              <input type="text" name="workPosition" required value={formData.workPosition} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.workEmail || "Email Trabajo *"}</label>
              <input type="email" name="workEmail" required value={formData.workEmail} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.workPhone || "Teléfono Trabajo *"}</label>
              <input type="tel" name="workPhone" required value={formData.workPhone} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.workAddress1 || "Dirección de Trabajo *"}</label>
                <input type="text" name="workAddress1" required value={formData.workAddress1} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.workAddress2 || "Dirección de Trabajo (Línea 2)"}</label>
                <input type="text" name="workAddress2" value={formData.workAddress2} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.city || "Ciudad *"}</label>
                <input type="text" name="workCity" required value={formData.workCity} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.state || "Estado/Provincia *"}</label>
                <input type="text" name="workState" required value={formData.workState} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.zipCode || "Código Postal"}</label>
                <input type="text" name="workZipCode" value={formData.workZipCode} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: INFORMACIÓN DE ALOJAMIENTO */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Home className="w-5 h-5" /> {t.sections?.stay || "3. Información de Alojamiento (Opcional)"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.stayAddress1 || "Dirección de Alojamiento"}</label>
              <input type="text" name="stayAddress1" value={formData.stayAddress1} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.stayAddress2 || "Dirección de Alojamiento (Línea 2)"}</label>
              <input type="text" name="stayAddress2" value={formData.stayAddress2} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.stayCity || "Ciudad"}</label>
                <input type="text" name="stayCity" value={formData.stayCity} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.stayState || "Departamento"}</label>
                <input type="text" name="stayState" value={formData.stayState} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.zipCode || "Código Postal"}</label>
                <input type="text" name="stayZipCode" value={formData.stayZipCode} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 4: DETALLES DE RENTA */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> {t.sections?.details || "4. Detalles de Renta"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.pickupDate || "Fecha de Recogida *"}</label>
              <input type="date" name="pickupDate" required value={formData.pickupDate} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.pickupTime || "Hora de Recogida *"}</label>
              <input type="time" name="pickupTime" required value={formData.pickupTime} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.returnDate || "Fecha de Devolución *"}</label>
              <input type="date" name="returnDate" required value={formData.returnDate} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.returnTime || "Hora de Devolución *"}</label>
              <input type="time" name="returnTime" required value={formData.returnTime} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.rentalPage?.labels?.vehicleType || "Tipo de Vehículo *"}</label>
              <select name="vehicleType" required value={formData.vehicleType} onChange={handleInputChange} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700">
                <option value="">{t.rentalPage?.placeholders?.vehicleTypeDefault || "Seleccione el tipo de vehículo"}</option>
                <option value="CityRide">{t.rentalPage?.vehicleTypes?.cityRide || "CityRide (solo San Pedro Sula)"}</option>
                <option value="Turismo">{t.rentalPage?.vehicleTypes?.sedan || "Turismo"}</option>
                <option value="Camioneta 5 pasajeros">{t.rentalPage?.vehicleTypes?.suv5 || "Camioneta 5 pasajeros"}</option>
                <option value="Camioneta 7 pasajeros">{t.rentalPage?.vehicleTypes?.suv7 || "Camioneta 7 pasajeros"}</option>
                <option value="Pick Up doble cabina">{t.rentalPage?.vehicleTypes?.pickup || "Pick Up doble cabina"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* BLOQUE 5: SUBIDA DE DOCUMENTACIÓN */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" /> {t.sections?.docs || "5. Documentación Requerida"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Cargar Licencia */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 text-center flex flex-col justify-center min-h-[110px]">
              <label className="block text-xs font-bold text-slate-700 mb-2">{t.rentalPage?.labels?.licenseImg || "Imagen de Licencia *"}</label>
              {licenseImg ? (
                <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">{t.rentalPage?.multimedia?.successUpload || "✓ Archivo cargado correctamente"}</p>
              ) : (
                <input type="file" accept="image/*" required onChange={(e) => { if(e.target.files?.[0]) uploadToFirebase(e.target.files[0], 'licencia', setLicenseImg); }} className="text-xs w-full cursor-pointer" />
              )}
              {loadingFile['licencia'] && <p className="text-xs text-blue-600 mt-1 animate-pulse flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t.rentalPage?.multimedia?.uploading || "Subiendo..."}</p>}
            </div>

            {/* Cargar Identidad */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 text-center flex flex-col justify-center min-h-[110px]">
              <label className="block text-xs font-bold text-slate-700 mb-2">{t.rentalPage?.labels?.idImg || "Imagen de Documento de Identidad *"}</label>
              {idImg ? (
                <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">{t.rentalPage?.multimedia?.successUpload || "✓ Archivo cargado correctamente"}</p>
              ) : (
                <input type="file" accept="image/*" required onChange={(e) => { if(e.target.files?.[0]) uploadToFirebase(e.target.files[0], 'identidad', setIdImg); }} className="text-xs w-full cursor-pointer" />
              )}
              {loadingFile['identidad'] && <p className="text-xs text-blue-600 mt-1 animate-pulse flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t.rentalPage?.multimedia?.uploading || "Subiendo..."}</p>}
            </div>
          </div>

          {/* MÓDULO SELFIE */}
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center min-h-[130px]">
            <span className="text-xs font-bold text-slate-700 mb-2">{t.rentalPage?.labels?.selfieImg || "Tomar Selfie *"}</span>
            {selfieImg ? (
              <div className="text-center flex flex-col items-center">
                <img src={selfieImg} alt="Selfie" className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                <button type="button" onClick={() => setSelfieImg('')} className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-md px-2.5 py-1 mt-2 cursor-pointer transition flex items-center gap-1"><Trash2 className="w-3 h-3" /> {t.rentalPage?.multimedia?.retake || "Re-tomar"}</button>
              </div>
            ) : cameraActive ? (
              <div className="flex flex-col items-center gap-2">
                <video ref={videoRef} autoPlay playsInline className="w-48 h-36 object-cover bg-black rounded-lg" />
                <button type="button" onClick={captureSelfie} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1"><Camera className="w-3 h-3" /> {t.rentalPage?.multimedia?.capture || "Capturar Foto"}</button>
              </div>
            ) : (
              <button type="button" onClick={startCamera} className="border border-blue-600 text-blue-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> {t.rentalPage?.multimedia?.openCamera || "Abrir Cámara"}</button>
            )}
          </div>
        </div>

        {/* BLOQUE 6: CANVAS DE FIRMA DIGITAL */}
        <div className="space-y-4 flex flex-col items-center">
          <label className="block text-xs font-bold text-slate-700 text-center">{t.rentalPage?.labels?.signature || "6. Firma Digital (Dibuje sobre el cuadro) *"}</label>
          <div className="relative w-full max-w-md">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="border-2 border-dashed border-slate-300 bg-white rounded-xl w-full h-32 cursor-crosshair touch-none"
            />
            <button type="button" onClick={clearSignature} className="absolute top-2 right-2 border border-slate-300 bg-white text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md hover:bg-slate-50 cursor-pointer transition">{t.rentalPage?.multimedia?.clearSignature || "Borrar Firma"}</button>
          </div>
        </div>

        {/* TÉRMINOS Y ENVÍO */}
        <div className="pt-4 space-y-4">
          <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 rounded text-blue-600 h-4 w-4 focus:ring-blue-500" />
            <span>
              {language === 'en' ? 'I have read and accept the vehicle rental ' : 'He leído y acepto los '}
              <Link href="/terminos" className="text-blue-600 underline font-medium hover:text-blue-800 transition">
                {language === 'en' ? 'Terms and Conditions' : 'Términos y Condiciones'}
              </Link>
              {language === 'en' ? '.' : ' de renta de vehículos.'}
            </span>
          </label>

          <button
            type="submit"
            disabled={isSending}
            className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
              isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t.rentalPage?.submittingBtn || "Transmitiendo Solicitud..."}</>
            ) : (
              <>{t.rentalPage?.submitBtn || "Enviar Solicitud de Renta"} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        {/* BLOQUES DE NOTIFICACIONES */}
        <div className="pt-2">
          {submitStatus === 'success' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col items-center text-center animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <h3 className="text-base font-bold text-emerald-800 mt-2">{t.rentalPage?.successNotifyTitle || "¡Solicitud de renta transmitida con éxito!"}</h3>
              <p className="text-xs text-emerald-600 mt-0.5">{t.rentalPage?.successNotifySub || "Revisaremos tu documentación en San Pedro Sula a la brevedad."}</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center justify-center gap-2 animate-fade-in">
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{t.rentalPage?.errorNotify || "Hubo un error al procesar el envío. Por favor, verifica los campos o intenta más tarde."}</span>
            </div>
          )}
        </div>

      </form>
    </div>
  );
}