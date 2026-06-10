// src/app/cliente/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import { Car, Key, Trash2, ChevronRight, HeartCrack } from 'lucide-react';

export default function ClienteDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // 💻 Estados locales para los favoritos asíncronos
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Clave de almacenamiento vinculada de forma exacta a la sesión actual
  const storageKey = user ? `favs_${user.email}` : 'favs_anonymous';

  // Protección de ruta de cliente en el cliente
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 🔄 Cargar los datos detallados desde Firestore basándonos en los IDs guardados
  useEffect(() => {
    async function loadFavoritesFromFirestore() {
      if (!user) return;
      setLoadingFavorites(true);
      
      const favIds = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
      
      if (favIds.length === 0) {
        setFavoriteVehicles([]);
        setLoadingFavorites(false);
        return;
      }

      try {
        const fetchedVehicles: Vehicle[] = [];
        
        // Ejecutamos las consultas en paralelo para máxima velocidad de respuesta
        await Promise.all(
          favIds.map(async (id) => {
            const docRef = doc(db, 'vehicles', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              fetchedVehicles.push({ id: docSnap.id, ...docSnap.data() } as Vehicle);
            }
          })
        );

        setFavoriteVehicles(fetchedVehicles);
      } catch (error) {
        console.error("Error al recuperar los vehículos favoritos de Firestore:", error);
      } finally {
        setLoadingFavorites(false);
      }
    }

    if (user) {
      loadFavoritesFromFirestore();
    }
  }, [user, storageKey]);

  // 🗑️ Función para eliminar un favorito directamente desde el panel
  const handleRemoveFavorite = (e: React.MouseEvent, vehicleId: string) => {
    e.preventDefault(); // Evita que el clic dispare la navegación del Link corporativo
    
    const favIds = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    const nuevosIds = favIds.filter(id => id !== vehicleId);
    
    localStorage.setItem(storageKey, JSON.stringify(nuevosIds));
    setFavoriteVehicles(prev => prev.filter(car => car.id !== vehicleId));
  };

  if (authLoading || !user) {
    return <div className="p-12 text-center text-slate-500 text-sm">Cargando espacio de cliente...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      
      {/* Cabecera del Dashboard */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Espacio Su Auto</h1>
          <p className="text-sm text-slate-500 mt-1">Bienvenido a su portal, {user.email}</p>
        </div>
        <button 
          onClick={() => { logout(); router.push('/login'); }} 
          className="hidden sm:block rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* 📊 GRID DE DOS COLUMNAS RESPONSIVO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
        
        {/* TARJETA 1: FAVORITOS Y COTIZACIONES (DINÁMICA) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Car className="w-5 h-5 text-slate-700" /> Mis Autos Guardados
          </h2>

          {loadingFavorites ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">Sincronizando inventario guardado...</p>
          ) : favoriteVehicles.length === 0 ? (
            /* Estado vacío si no hay favoritos en localStorage */
            <div className="text-center py-6 text-slate-400 space-y-2">
              <HeartCrack className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">Aún no ha guardado ningún vehículo en sus favoritos.</p>
              <Link href="/" className="text-xs text-blue-600 font-bold hover:underline inline-block pt-1">
                Explorar el Inventario de Autos &rarr;
              </Link>
            </div>
          ) : (
            /* Listado dinámico de vehículos favoritos */
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {favoriteVehicles.map((car) => (
                <Link 
                  key={car.id} 
                  href={`/vehiculos/${car.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {car.featuredImage && (
                      <img 
                        src={car.featuredImage} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded-lg bg-slate-200 flex-shrink-0" 
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase truncate group-hover:text-blue-900 transition">
                        {car.title || `${car.brand} ${car.modelName}`}
                      </h3>
                      <p className="text-xs font-extrabold text-blue-900 mt-0.5">
                        {formatPrice(car.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {/* Botón rápido para remover favoritos */}
                    <button
                      onClick={(e) => handleRemoveFavorite(e, car.id!)}
                      title="Quitar de favoritos"
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* TARJETA 2: DETALLES DE LAS RENTAS DEL CLIENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <Key className="w-5 h-5 text-slate-700" /> Detalles de mis Rentas
          </h2>
          <p className="text-sm text-slate-500">
            Historial de solicitudes de alquiler, fechas de recogida/devolución y el estado de validación de sus documentos en tiempo real.
          </p>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
            Próximamente se listarán aquí los contratos de arrendamiento activos sincronizados con el Panel Admin.
          </div>
        </div>

      </div>

      {/* Botón de Cerrar Sesión en Móvil (Solo visible en móviles) */}
      <div className="sm:hidden mt-8">
        <button 
          onClick={() => { logout(); router.push('/login'); }} 
          className="w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}