// src/app/page.tsx
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import Link from 'next/link';

// Fetching live vehicles data directamente en el server
async function getLiveVehicles(): Promise<Vehicle[]> {
  try {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'), limit(12));
    const querySnapshot = await getDocs(q);
    
    const vehicles: Vehicle[] = [];
    querySnapshot.forEach((doc) => {
      vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    return vehicles;
  } catch (error) {
    console.error("Error fetching live inventory from Firestore:", error);
    return [];
  }
}

export default async function Home() {
  const liveVehicles = await getLiveVehicles();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section 
  className="relative bg-cover bg-center py-24 px-4 text-white text-center"
  style={{ 
    backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85)), url('/hero-suauto.png')` 
  }}
>
  <div className="mx-auto max-w-4xl space-y-6 relative z-10">
    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl drop-shadow-md">
      Encuentra tu próximo vehículo en San Pedro Sula
    </h1>
    <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-xs">
      Explora nuestro inventario seleccionado de autos usados garantizados con excelentes opciones de financiamiento.
    </p>
          
          {/* Custom Tailwind v4 Filter Inputs */}
          <div className="mx-auto mt-10 max-w-3xl rounded-xl bg-white p-4 shadow-xl text-slate-800 grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
            <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500">
              <option>Todas las Marcas</option>
            </select>
            <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500">
              <option>Tipo de Vehículo</option>
            </select>
            <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500">
              <option>Transmisión</option>
            </select>
            <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
              Buscar Auto
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventario Disponible
          </h2>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Mostrando Recientes
          </span>
        </div>

        {/* Dynamic Display Grid */}
        {liveVehicles.length === 0 ? (
          <div className="mt-12 text-center text-slate-500 py-12 border rounded-xl border-dashed bg-white">
            <p className="font-semibold text-lg">No hay vehículos para mostrar por el momento.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {liveVehicles.map((vehicle) => (
              <div key={vehicle.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition">
                
                {/* Image Wrap */}
                <div className="aspect-video relative bg-slate-100 group-hover:opacity-95 transition">
                  <img
                    src={vehicle.featuredImage}
                    alt={vehicle.title || `${vehicle.brand} ${vehicle.modelName}`}
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md shadow-xs ${
                      vehicle.status === 'Disponible' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                </div>

                {/* Card Details Content */}
                <div className="flex flex-1 flex-col p-5 space-y-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                      <Link href={`/vehiculos/${vehicle.id}`}>
                        <span className="absolute inset-0" />
                        {vehicle.title || `${vehicle.brand} ${vehicle.modelName} (${vehicle.year})`}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Motor {vehicle.engine} • {vehicle.transmissions?.join(', ')} • {vehicle.types?.join(', ')}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-blue-900">{vehicle.price}</span>
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">Ver detalles &rarr;</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}