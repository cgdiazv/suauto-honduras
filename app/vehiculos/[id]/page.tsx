// app/vehiculos/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';

export default function VehiculoDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar las pestañas inferiores de la imagen image_f0d6e2.jpg
  const [activeSubTab, setActiveSubTab] = useState<'detalles' | 'contacto'>('detalles');

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

  // Crear link de WhatsApp automatizado con el asesor asignado
  const mensajeWhatsApp = encodeURIComponent(`Hola, estoy interesado en el vehículo ${vehicle.title || `${vehicle.brand} ${vehicle.modelName}`} de precio ${formatPrice(vehicle.price)} que vi en su sitio web.`);
  const urlWhatsApp = `https://wa.me/50425700962?text=${mensajeWhatsApp}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800 space-y-8">
      
      {/* 🧭 Breadcrumbs (Migas de Pan) */}
      <nav className="text-xs text-slate-400 space-x-2 uppercase tracking-wider">
        <Link href="/" className="hover:underline">Comprar y Vender Su Auto</Link>
        <span>/</span>
        <Link href="/" className="hover:underline">Vehículos</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate max-w-[250px] inline-block align-bottom">
          {vehicle.title || `${vehicle.brand} ${vehicle.modelName}`}
        </span>
      </nav>

      {/* 🔤 Encabezado Principal de Título y Precio */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex flex-wrap gap-2 items-baseline">
          <span className="text-blue-900 font-extrabold">{formatPrice(vehicle.price)}</span>
          <span>{vehicle.title || `${vehicle.brand} ${vehicle.modelName} motor ${vehicle.engine} año ${vehicle.year} ${vehicle.status}`}</span>
        </h1>
      </div>

      {/* 📊 GRID SUPERIOR DE DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Contenedor Multimedia Principal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
            <img 
              src={vehicle.featuredImage} 
              alt={vehicle.title} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Carrusel/Miniaturas de ángulos alternos si existen */}
          {vehicle.galleryImages && Object.values(vehicle.galleryImages).some(url => url !== '') && (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(vehicle.galleryImages).map(([key, url]) => url && (
                <div key={key} className="aspect-video rounded-lg overflow-hidden border bg-slate-50 cursor-pointer hover:opacity-80 transition">
                  <img src={url} alt={key} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Bloque Técnico e Identificadores */}
        <div className="lg:col-span-5 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Barra de utilidades superiores de la captura */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="text-emerald-600">FAVORITOS 0</span>
            <button className="text-blue-600 hover:underline cursor-pointer">Agregar a Favoritos &gt;</button>
          </div>

          {/* Encabezado Rápido de Ficha */}
          <div className="px-5 pt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase text-slate-700 bg-slate-50/40 py-2 border-b">
            <div className="flex items-center justify-center gap-1">🚘 {vehicle.brand}</div>
            <div className="flex items-center justify-center gap-1">📅 {vehicle.year}</div>
            <div className="flex items-center justify-center gap-1">⛽ {vehicle.fuels?.join(', ') || 'Gasolina'}</div>
          </div>

          {/* Tabla Desglosada con Estilo de Filas Grises Intercaladas */}
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
              <span className="font-semibold toughness-medium text-slate-500">Motor:</span>
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
              <span className="text-slate-800 font-bold text-blue-900 text-right md:text-left">San Pedro Sula</span>
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
        
        {/* Selector de Pestañas Vertical (Columna Izquierda Corta) */}
        <div className="md:col-span-2 flex flex-row md:flex-col gap-1 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setActiveSubTab('detalles')}
            className={`flex-1 md:flex-none text-left p-3.5 rounded-lg border transition cursor-pointer ${
              activeSubTab === 'detalles' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            📋 Detalles
          </button>
          <button 
            onClick={() => setActiveSubTab('contacto')}
            className={`flex-1 md:flex-none text-left p-3.5 rounded-lg border transition cursor-pointer ${
              activeSubTab === 'contacto' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            ✉️ Contáctenos
          </button>
        </div>

        {/* Panel del Contenido de la Pestaña Activa */}
        <div className="md:col-span-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          {activeSubTab === 'detalles' ? (
            /* Subgrilla de Equipamientos */
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
              <span className="text-3xl">💬</span>
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
      <div className="text-center text-[11px] text-slate-400 italic pt-4">
        Precios sujetos a cambio. Por favor vea nuestra <span className="underline cursor-pointer">Política de Privacidad</span> para más info.
      </div>

    </div>
  );
}