// src/app/cliente/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import { Rental } from '@/components/RentalsTable';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import { Car, Key, Trash2, ChevronRight, HeartCrack, Settings, LogOut, Loader2, Calendar } from 'lucide-react';

export default function ClienteDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // 💻 Estados locales para los favoritos asíncronos
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // 📋 Estados locales para las rentas
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);

  // Clave de almacenamiento vinculada de forma exacta a la sesión actual
  const storageKey = user ? `favs_${user.email}` : 'favs_anonymous';

  // Protección de ruta de cliente en el cliente
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 🔄 Cargar los datos de vehículos favoritos desde localStorage y Firestore
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

  // 🔄 Cargar el historial de rentas del cliente (Sincronizado con tus Reglas)
  useEffect(() => {
    async function loadRentals() {
      if (!user?.email) return;
      setLoadingRentals(true);
      try {
        const q = query(
          collection(db, 'rentals'), 
          where('email', '==', user.email)
        );
        const querySnapshot = await getDocs(q);
        const fetchedRentals: any[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedRentals.push({ id: doc.id, ...doc.data() } as Rental);
        });
        
        // 🔑 CORRECCIÓN COMPILACIÓN: Añadimos 'as any' para evitar el bloqueo estricto de TypeScript
        fetchedRentals.sort((a: any, b: any) => {
          const dateA = a.createdAt || '';
          const dateB = b.createdAt || '';
          return dateB.localeCompare(dateA);
        });
        
        setRentals(fetchedRentals);
      } catch (error) {
        console.error("Error al recuperar las rentas:", error);
      } finally {
        setLoadingRentals(false);
      }
    }

    if (user) {
      loadRentals();
    }
  }, [user]);

  // 🗑️ Función para eliminar un favorito directamente desde el panel
  const handleRemoveFavorite = (e: React.MouseEvent, vehicleId: string) => {
    e.preventDefault(); 
    
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
      <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Mi Espacio</h1>
          <p className="text-sm text-slate-500 mt-1 truncate">Bienvenido, {user.email}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link 
            href="/cliente/editar"
            title="Editar Cuenta"
            className="rounded-full bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => { logout(); router.push('/login'); }} 
            title="Cerrar Sesión"
            className="rounded-full bg-red-50 p-2.5 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 📊 GRID DE DOS COLUMNAS RESPONSIVO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
        
        {/* TARJETA 1: MIS AUTOS GUARDADOS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Car className="w-5 h-5 text-slate-700" /> Mis Autos Guardados
          </h2>

          {loadingFavorites ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">Sincronizando inventario guardado...</p>
          ) : favoriteVehicles.length === 0 ? (
            <div className="text-center py-6 text-slate-400 space-y-2">
              <HeartCrack className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">Aún no ha guardado ningún vehículo en sus favoritos.</p>
              <Link href="/" className="text-xs text-blue-600 font-bold hover:underline inline-block pt-1">
                Explorar el Inventario de Autos &rarr;
              </Link>
            </div>
          ) : (
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="w-5 h-5 text-slate-700" /> Detalles de mis Rentas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-2">
            Historial de solicitudes de alquiler, fechas de recogida/devolución y el estado de validación de sus documentos en tiempo real.
          </p>
          
          {loadingRentals ? (
            <p className="text-xs text-slate-400 italic py-4 text-center flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> Sincronizando contratos activos...
            </p>
          ) : rentals.length === 0 ? (
            <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
              Aún no ha realizado ninguna solicitud de renta.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {rentals.map((rental: any) => (
                <div key={rental.id} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase truncate">
                        {rental.vehicleType ? `Renta: ${rental.vehicleType}` : 'Solicitud de Alquiler'}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    {/* Badge de Estatus Dinámico */}
                    <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full font-bold tracking-wider border shrink-0 ${
                      rental.status === 'Aprobada' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : rental.status === 'Rechazada' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {rental.status || 'Pendiente'}
                    </span>
                  </div>
                  
                  {/* Bloque de Fechas Consolidado */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Entrega</span>
                      <p className="font-semibold text-slate-700">{rental.pickupDate} <span className="text-slate-400 font-medium">({rental.pickupTime})</span></p>
                    </div>
                    <div className="border-l border-slate-100 pl-4">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Devolución</span>
                      <p className="font-semibold text-slate-700">{rental.returnDate} <span className="text-slate-400 font-medium">({rental.returnTime})</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}