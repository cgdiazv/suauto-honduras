// app/vehiculos/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import { 
  Heart, 
  MessageCircle, 
  ChevronRight, 
  Car, 
  Calendar, 
  Fuel, 
  FileText, 
  User, 
  ShieldCheck, 
  Compass,
  X 
} from 'lucide-react';

export default function VehiculoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'detalles' | 'contacto'>('detalles');
  
  // 💻 Estado Local de Favoritos
  const [isFavorito, setIsFavorito] = useState(false);

  // 🖼️ Estado del Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Clave de almacenamiento ligada al correo del usuario para evitar mezclas
  const storageKey = user ? `favs_${user.email}` : 'favs_anonymous';

  useEffect(() => {
    async function fetchVehicleData() {
      if (!id) return;
      try {
        const docRef = doc(db, 'vehicles', id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
        } else {
          console.error("El vehículo no existe en la base de datos.");
        }
      } catch (error) {
        console.error("Error cargando detalles del vehículo:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicleData();
  }, [id]);

  // 🔄 Efecto secundario para leer si este auto específico ya está guardado en localStorage
  useEffect(() => {
    if (!id) return;
    const favs = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    setIsFavorito(favs.includes(id as string));
  }, [id, storageKey]);

  // ❤️ Manejador del botón Favoritos
  const handleFavoritoToggle = () => {
    if (!user) {
      // Si no ha iniciado sesión, lo obligamos a loguearse para registrar sus favoritos
      router.push('/login');
      return;
    }

    const favs = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    let nuevosFavs: string[];

    if (favs.includes(id as string)) {
      nuevosFavs = favs.filter(favId => favId !== id);
      setIsFavorito(false);
    } else {
      nuevosFavs = [...favs, id as string];
      setIsFavorito(true);
    }

    localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-sm">Cargando ficha técnica del vehículo...</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-12 text-center text-slate-500 max-w-xl mx-auto space-y-4">
        <p className="text-lg font-bold">Vehículo no encontrado</p>
        <Link href="/" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md inline-block">
          Volver al Inventario
        </Link>
      </div>
    );
  }

  // Enlace automatizado de WhatsApp con el asesor asignado
  const mensajeWhatsApp = encodeURIComponent(`Hola, estoy interesado en el vehículo ${vehicle.title || `${vehicle.brand} ${vehicle.modelName}`} de precio ${vehicle.price} que vi en su sitio web.`);
  const urlWhatsApp = `https://wa.me/50425700962?text=${mensajeWhatsApp}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800 space-y-8">
      
      {/* 🧭 Breadcrumbs (Migas de Pan) */}
      <nav className="text-xs text-slate-400 flex items-center gap-2 uppercase tracking-wider">
        <Link href="/" className="hover:underline">Comprar y Vender Su Auto</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/" className="hover:underline">Vehículos</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 font-medium truncate max-w-[200px] sm:max-w-none">
          {vehicle.title || `${vehicle.brand} ${vehicle.modelName}`}
        </span>
      </nav>

      {/* 🔤 Título Principal de la página e Identificadores */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex flex-wrap gap-2 items-baseline">
          <span className="text-blue-900 font-extrabold">{formatPrice(vehicle.price)}</span>
          <span>{vehicle.title || `${vehicle.brand} ${vehicle.modelName} motor ${vehicle.engine} año ${vehicle.year} ${vehicle.status}`}</span>
        </h1>
      </div>

      {/* 📊 GRID SUPERIOR DE DOS COLUMNAS DE LA CAPTURA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Galería de Imágenes */}
        <div className="lg:col-span-7 space-y-4">
          <div 
            className="aspect-[4/3] w-full relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs cursor-pointer hover:opacity-95 transition"
            onClick={() => setLightboxImage(vehicle.featuredImage)}
          >
            <img 
              src={vehicle.featuredImage} 
              alt={vehicle.title} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Miniaturas de ángulos secundarios */}
          {vehicle.galleryImages && Object.values(vehicle.galleryImages).some(url => url !== '') && (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(vehicle.galleryImages).map(([key, url]) => url && (
                <div 
                  key={key} 
                  className="aspect-video rounded-lg overflow-hidden border bg-slate-50 cursor-pointer hover:opacity-80 transition"
                  onClick={() => setLightboxImage(url)}
                >
                  <img src={url} alt={key} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Bloque Técnico e Indicadores */}
        <div className="lg:col-span-5 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* 🌟 BARRA DINÁMICA DE FAVORITOS */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={isFavorito ? "text-red-600" : "text-slate-500"}>
              FAVORITOS {isFavorito ? "1" : "0"}
            </span>
            <button 
              onClick={handleFavoritoToggle}
              className={`flex items-center gap-1 font-bold transition cursor-pointer select-none ${
                isFavorito ? "text-red-600 hover:text-red-700" : "text-[#67bd45] hover:text-blue-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorito ? "fill-red-600" : ""}`} />
              {isFavorito ? "QUITAR DE FAVORITOS" : "AGREGAR A FAVORITOS >"}
            </button>
          </div>

          {/* Encabezado Rápido de Ficha de la Captura */}
          <div className="px-5 grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase text-slate-700 bg-slate-50/40 py-3 border-b">
            <div className="flex items-center justify-center gap-1.5"><Car className="w-4 h-4 text-slate-500" /> {vehicle.brand}</div>
            <div className="flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" /> {vehicle.year}</div>
            <div className="flex items-center justify-center gap-1.5"><Fuel className="w-4 h-4 text-slate-500" /> {vehicle.fuels?.join(', ') || 'Gasolina'}</div>
          </div>

          {/* Tabla Desglosada con Filas Grises Intercaladas */}
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="grid grid-cols-2 p-3 bg-slate-50/60">
              <span className="font-semibold text-slate-500">Asesor:</span>
              <span className="text-slate-800 font-bold text-right md:text-left">{vehicle.salesAgent || 'Asesor de Agencia'}</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="font-semibold text-slate-500">Tipo de Vehículo:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.types?.join(', ') || 'SUV/Camioneta'}</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-50/60">
              <span className="font-semibold text-slate-500">Transmisión:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.transmissions?.join(', ')}</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="font-semibold text-slate-500">Motor:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.engine}</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-50/60">
              <span className="font-semibold text-slate-500">Color:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.colors?.join(', ') || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="font-semibold text-slate-500">País de Origen:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.countryOfOrigin || 'Estados Unidos'}</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-50/60">
              <span className="font-semibold text-slate-500">Ubicación:</span>
              <span className="text-blue-900 font-bold text-right md:text-left">San Pedro Sula</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="font-semibold text-slate-500">Condición:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.conditions?.join(', ') || 'Usado Importado'}</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-50/60">
              <span className="font-semibold text-slate-500">Millaje:</span>
              <span className="text-slate-800 font-medium text-right md:text-left">{vehicle.mileage?.value?.toLocaleString()} {vehicle.mileage?.unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🗂️ SECCIÓN INFERIOR DE PESTAÑAS (TABS MENÚ) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-200">
        
        {/* Selector de Pestañas Vertical */}
        <div className="md:col-span-2 flex flex-row md:flex-col gap-1 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setActiveSubTab('detalles')}
            className={`flex-1 md:flex-none p-3.5 rounded-lg border transition cursor-pointer flex items-center gap-2 font-bold ${
              activeSubTab === 'detalles' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Detalles
          </button>
          <button 
            onClick={() => setActiveSubTab('contacto')}
            className={`flex-1 md:flex-none p-3.5 rounded-lg border transition cursor-pointer flex items-center gap-2 font-bold ${
              activeSubTab === 'contacto' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> Contáctenos
          </button>
        </div>

        {/* Panel contenedor del equipamiento técnico */}
        <div className="md:col-span-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          {activeSubTab === 'detalles' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm">
              
              {/* Características Interior */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900 border-b pb-1">Características Interior</h4>
                <ul className="space-y-1.5 text-slate-600 font-medium">
                  {vehicle.interiorFeatures && vehicle.interiorFeatures.length > 0 ? (
                    vehicle.interiorFeatures.map(item => <li key={item}>✓ {item}</li>)
                  ) : <li className="text-slate-400 italic">Estándar de fábrica</li>}
                </ul>
              </div>

              {/* Características Exterior */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900 border-b pb-1">Características Exterior</h4>
                <ul className="space-y-1.5 text-slate-600 font-medium">
                  {vehicle.exteriorFeatures && vehicle.exteriorFeatures.length > 0 ? (
                    vehicle.exteriorFeatures.map(item => <li key={item}>✓ {item}</li>)
                  ) : <li className="text-slate-400 italic">Estándar de fábrica</li>}
                </ul>
              </div>

              {/* Seguridad */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900 border-b pb-1">Seguridad</h4>
                <ul className="space-y-1.5 text-slate-600 font-medium">
                  {vehicle.security && vehicle.security.length > 0 ? (
                    vehicle.security.map(item => <li key={item}>✓ {item}</li>)
                  ) : <li className="text-slate-400 italic">Protección básica activa</li>}
                </ul>
              </div>

              {/* Extras */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900 border-b pb-1">Extras</h4>
                <ul className="space-y-1.5 text-slate-600 font-medium">
                  {vehicle.extras && vehicle.extras.length > 0 ? (
                    vehicle.extras.map(item => <li key={item}>✓ {item}</li>)
                  ) : <li className="text-slate-400 italic">Sin aditamentos adicionales</li>}
                </ul>
              </div>

            </div>
          ) : (
            /* Panel Rápido de Contacto por WhatsApp */
            <div className="text-center py-6 space-y-4 max-w-md mx-auto">
              <div className="text-emerald-500 mx-auto flex justify-center"><MessageCircle className="w-10 h-10" /></div>
              <h4 className="text-base font-bold text-slate-900">¿Deseas financiamiento o una prueba de manejo?</h4>
              <p className="text-xs text-slate-500">Presiona el botón de abajo para iniciar una conversación instantánea con nuestro asesor asignado en San Pedro Sula.</p>
              <a 
                href={urlWhatsApp} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                Hablar con un Asesor por WhatsApp &rarr;
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 📄 Nota de Deslinde Legal Inferior */}
      <div className="text-center text-[11px] text-slate-400 italic pt-4 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 inline" /> Precios sujetos a cambio. Por favor vea nuestra <Link href="/politica-de-privacidad" className="underline">Política de Privacidad</Link> para más info.
      </div>

      {/* 🖼️ Lightbox Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition"
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Vista ampliada" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()} // Evita cerrar si hacen clic en la imagen
          />
        </div>
      )}

    </div>
  );
}