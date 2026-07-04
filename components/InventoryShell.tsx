// components/InventoryShell.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Safe centralized data listener store to guarantee instant syncing between both sections
let currentGlobalState = {
  allVehicles: [] as Vehicle[],
  filteredVehicles: [] as Vehicle[],
  loading: true,
  selectedBrand: 'Todas las Marcas',
  selectedType: 'Tipo de Vehículo',
  selectedTransmission: 'Transmisión',
  availableBrands: [] as string[],
  availableTypes: [] as string[],
  availableTransmissions: [] as string[],
};

const stateListeners = new Set<() => void>();

function broadcastStateUpdate(nextFields: Partial<typeof currentGlobalState>) {
  currentGlobalState = { ...currentGlobalState, ...nextFields };
  stateListeners.forEach((triggerRender) => triggerRender());
}

export default function InventoryShell({ renderSection }: { renderSection: 'hero' | 'grid' }) {
  const { t } = useLanguage();
  const [localState, setLocalState] = useState(currentGlobalState);

  useEffect(() => {
    const syncWithGlobalStore = () => setLocalState({ ...currentGlobalState });
    stateListeners.add(syncWithGlobalStore);

    // Initial query trigger execution
    if (currentGlobalState.allVehicles.length === 0 && currentGlobalState.loading) {
      async function fetchInventory() {
        try {
          const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const vehicles: Vehicle[] = [];
          
          const brandsSet = new Set<string>();
          const typesSet = new Set<string>();
          const transSet = new Set<string>();

          querySnapshot.forEach((doc) => {
            const data = doc.data() as Vehicle;
            vehicles.push({ id: doc.id, ...data });

            if (data.brand) brandsSet.add(data.brand);
            data.types?.forEach(t => typesSet.add(t));
            data.transmissions?.forEach(t => transSet.add(t));
          });

          broadcastStateUpdate({
            allVehicles: vehicles,
            filteredVehicles: vehicles,
            availableBrands: Array.from(brandsSet).sort(),
            availableTypes: Array.from(typesSet).sort(),
            availableTransmissions: Array.from(transSet).sort(),
            loading: false,
          });
        } catch (error) {
          console.error("Error connecting to inventory store:", error);
          broadcastStateUpdate({ loading: false });
        }
      }
      fetchInventory();
    }

    return () => {
      stateListeners.delete(syncWithGlobalStore);
    };
  }, []);

  const executeInventorySearch = () => {
    let result = [...currentGlobalState.allVehicles];

    if (currentGlobalState.selectedBrand !== 'Todas las Marcas') {
      result = result.filter(car => car.brand === currentGlobalState.selectedBrand);
    }
    if (currentGlobalState.selectedType !== 'Tipo de Vehículo') {
      result = result.filter(car => car.types?.includes(currentGlobalState.selectedType));
    }
    if (currentGlobalState.selectedTransmission !== 'Transmisión') {
      result = result.filter(car => car.transmissions?.includes(currentGlobalState.selectedTransmission));
    }

    broadcastStateUpdate({ filteredVehicles: result });
  };

  // =========================================================================
  // CONDITION A: HERO CONTENT RENDER
  // =========================================================================
  if (renderSection === 'hero') {
    return (
      <>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl drop-shadow-md">
          {t.home?.heroTitle || "Encuentra tu próximo vehículo en San Pedro Sula"}
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-xs">
          {t.home?.heroSubtitle || "Explora nuestro inventario seleccionado de autos usados garantizados con excelentes opciones de financiamiento."}
        </p>
        
        {/* Mobile quick actions */}
        <div className="mt-6 flex flex-col gap-3 sm:hidden">
          <Link 
            href="/vender" 
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            {t.nav?.sell || "Vender Vehículo"}
          </Link>
          <Link 
            href="/rentar" 
            className="w-full rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
          >
            {t.nav?.rent || "Rentar Vehículo"}
          </Link>
        </div>

        {/* Toolbar Input Selectors */}
        <div className="mx-auto mt-10 max-w-3xl rounded-xl bg-white p-4 shadow-xl text-slate-800 grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
          <select 
            value={localState.selectedBrand}
            onChange={(e) => broadcastStateUpdate({ selectedBrand: e.target.value })}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-700"
          >
            <option value="Todas las Marcas">{t.home?.allBrands || "Todas las Marcas"}</option>
            {localState.availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select 
            value={localState.selectedType}
            onChange={(e) => broadcastStateUpdate({ selectedType: e.target.value })}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-700"
          >
            <option value="Tipo de Vehículo">{t.home?.vehicleType || "Tipo de Vehículo"}</option>
            {localState.availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            value={localState.selectedTransmission}
            onChange={(e) => broadcastStateUpdate({ selectedTransmission: e.target.value })}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-700"
          >
            <option value="Transmisión">{t.home?.transmission || "Transmisión"}</option>
            {localState.availableTransmissions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button 
            onClick={executeInventorySearch}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
          >
            {t.home?.searchBtn || "Buscar Auto"}
          </button>
        </div>
      </>
    );
  }

  // =========================================================================
  // CONDITION B: LOWER INVENTORY GRID RENDER
  // =========================================================================
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.home?.inventoryTitle || "Inventario Disponible"}
        </h2>
        {localState.filteredVehicles.length !== localState.allVehicles.length && (
          <button 
            onClick={() => {
              broadcastStateUpdate({
                selectedBrand: 'Todas las Marcas',
                selectedType: 'Tipo de Vehículo',
                selectedTransmission: 'Transmisión',
                filteredVehicles: localState.allVehicles
              });
            }}
            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            {t.home?.clearFilters || "Limpiar Filtros"}
          </button>
        )}
      </div>

      {localState.loading ? (
        <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-2xl border border-slate-200 bg-white h-[360px] p-5 space-y-4 shadow-xs">
              <div className="h-44 w-full bg-slate-100 animate-pulse rounded-xl" />
              <div className="h-6 w-3/4 bg-slate-100 animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : localState.filteredVehicles.length === 0 ? (
        <div className="mt-12 text-center text-slate-500 py-12 border rounded-xl border-dashed bg-white">
          <p className="font-semibold text-lg">{t.home?.noResultsTitle || "No encontramos vehículos que coincidan con esos filtros."}</p>
          <p className="text-sm text-slate-400 mt-1">{t.home?.noResultsSub || "Intenta restablecer los selectores para ver más opciones disponibles."}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {localState.filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition">
              
              <div className="h-52 w-full shrink-0 relative bg-slate-100 group-hover:opacity-95 transition">
                <Image
                  src={vehicle.featuredImage}
                  alt={vehicle.title || `${vehicle.brand} ${vehicle.modelName}`}
                  fill
                  sizes="(max-w-7xl) 25vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
                  <span className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md shadow-xs ${
                    vehicle.status === 'Disponible' ? 'bg-[#67bd45] text-white' : 'bg-slate-600 text-white'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    <Link href={`/vehiculos/${vehicle.id}`}>
                      <span className="absolute inset-0" />
                      {vehicle.title || `${vehicle.brand} ${vehicle.modelName} (${vehicle.year})`}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                    Motor {vehicle.engine} • {vehicle.transmissions?.join(', ')} • {vehicle.types?.join(', ')}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-extrabold text-blue-900">{formatPrice(vehicle.price)}</span>
                  <span className="text-xs font-semibold text-blue-600 group-hover:underline">{t.home?.viewDetails || "Ver detalles"} &rarr;</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </>
  );
}