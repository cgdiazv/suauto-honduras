// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto bilingüe


export default function Home() {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language, setLanguage } = useLanguage(); // 🔑 Consumimos el estado del diccionario

  // Estados de los Selectores de Búsqueda
  const [selectedBrand, setSelectedBrand] = useState('Todas las Marcas');
  const [selectedType, setSelectedType] = useState('Tipo de Vehículo');
  const [selectedTransmission, setSelectedTransmission] = useState('Transmisión');

  // Listas de opciones dinámicas extraídas del Stock Real
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableTransmissions, setAvailableTransmissions] = useState<string[]>([]);

  useEffect(() => {
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
          const vehicleWithId = { id: doc.id, ...data };
          vehicles.push(vehicleWithId);

          // Alimentar catálogos dinámicos
          if (data.brand) brandsSet.add(data.brand);
          data.types?.forEach(t => typesSet.add(t));
          data.transmissions?.forEach(t => transSet.add(t));
        });

        setAllVehicles(vehicles);
        setFilteredVehicles(vehicles); // Por defecto muestra todo el stock
        
        setAvailableBrands(Array.from(brandsSet).sort());
        setAvailableTypes(Array.from(typesSet).sort());
        setAvailableTransmissions(Array.from(transSet).sort());
      } catch (error) {
        console.error("Error cargando inventario en el cliente:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  // 🔥 Función de Filtrado Ejecutada al dar clic en "Buscar Auto"
  const handleSearch = () => {
    let result = [...allVehicles];

    if (selectedBrand !== 'Todas las Marcas') {
      result = result.filter(car => car.brand === selectedBrand);
    }

    if (selectedType !== 'Tipo de Vehículo') {
      result = result.filter(car => car.types?.includes(selectedType));
    }

    if (selectedTransmission !== 'Transmisión') {
      result = result.filter(car => car.transmissions?.includes(selectedTransmission));
    }

    setFilteredVehicles(result);
  };

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
            {t.home?.heroTitle || "Encuentra tu próximo vehículo en San Pedro Sula"}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-xs">
            {t.home?.heroSubtitle || "Explora nuestro inventario seleccionado de autos usados garantizados con excelentes opciones de financiamiento."}
          </p>
          
          {/* Contenedor de Filtros Conectado al Estado Reactivo */}
          <div className="mx-auto mt-10 max-w-3xl rounded-xl bg-white p-4 shadow-xl text-slate-800 grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
            
            {/* Selector de Marcas */}
            <select 
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-700"
            >
              <option value="Todas las Marcas">{t.home?.allBrands || "Todas las Marcas"}</option>
              {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            {/* Selector de Tipos */}
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-700"
            >
              <option value="Tipo de Vehículo">{t.home?.vehicleType || "Tipo de Vehículo"}</option>
              {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Selector de Transmisiones */}
            <select 
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-700"
            >
              <option value="Transmisión">{t.home?.transmission || "Transmisión"}</option>
              {availableTransmissions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Botón de Acción */}
            <button 
              onClick={handleSearch}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              {t.home?.searchBtn || "Buscar Auto"}
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.home?.inventoryTitle || "Inventario Disponible"}
          </h2>
          {filteredVehicles.length !== allVehicles.length && (
  <button 
    onClick={() => {
      setSelectedBrand('Todas las Marcas');
      setSelectedType('Tipo de Vehículo');
      setSelectedTransmission('Transmisión');
      setFilteredVehicles(allVehicles);
    }}
    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition flex items-center gap-1 cursor-pointer"
  >
    <X className="w-3.5 h-3.5" />
    {t.home?.clearFilters || "Limpiar Filtros"}
  </button>
)}
        </div>

        {/* Mapeo del Estado Filtrado */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">{t.home?.searchingStock || "Buscando en el stock de Su Auto..."}</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="mt-12 text-center text-slate-500 py-12 border rounded-xl border-dashed bg-white">
            <p className="font-semibold text-lg">{t.home?.noResultsTitle || "No encontramos vehículos que coincidan con esos filtros."}</p>
            <p className="text-sm text-slate-400 mt-1">{t.home?.noResultsSub || "Intenta restablecer los selectores para ver más opciones disponibles."}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredVehicles.map((vehicle) => (
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
                      vehicle.status === 'Disponible' ? 'bg-[#67bd45] text-white' : 'bg-slate-600 text-white'
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
      </section>
    </div>
  );
}