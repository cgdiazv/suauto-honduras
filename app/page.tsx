// src/app/page.tsx
import Image from 'next/image';

// Temporary Mock Data reflecting your actual inventory items for local visual testing
const MOCK_VEHICLES = [
  {
    id: '1',
    title: 'Ford F-150 2023 4X4',
    specs: 'Doble Cabina • Motor 2.7 Bi-Turbo',
    price: 'Consultar Precio',
    tags: ['Disponible', '4x4'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '2',
    title: 'Ford Escape 2010',
    specs: 'Motor 2.5 • Caja Automática 4x4',
    price: 'L. 135,000',
    tags: ['Disponible', 'Financiamiento'],
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '3',
    title: 'Hyundai Santa Fe 2017',
    specs: 'Caja Automática 4x2',
    price: 'Financiamiento Disponible',
    tags: ['Disponible'],
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600'
  }
];

export default function Home() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with Clean Integrated Search */}
      <section className="relative bg-gradient-to-r from-blue-900 to-slate-900 py-20 px-4 text-white text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Encuentra tu próximo vehículo en San Pedro Sula
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explora nuestro inventario seleccionado de autos usados garantizados con excelentes opciones de financiamiento.
          </p>
          
          {/* Filter Bar Redesign */}
          <div className="mx-auto mt-10 max-w-3xl rounded-xl bg-white p-4 shadow-xl text-slate-800 grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
            <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todas las Marcas</option>
              <option>Ford</option>
              <option>Toyota</option>
              <option>Hyundai</option>
            </select>
            <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Tipo de Vehículo</option>
              <option>Pick-up</option>
              <option>SUV / Camioneta</option>
              <option>Turismo</option>
            </select>
            <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Transmisión</option>
              <option>Automática</option>
              <option>Mecánica</option>
            </select>
            <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition">
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

        {/* Card Component Layout Rendering */}
        <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {MOCK_VEHICLES.map((vehicle) => (
            <div key={vehicle.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
              {/* Image Section */}
              <div className="aspect-video relative bg-slate-100 group-hover:opacity-95 transition">
                <img
                  src={vehicle.image}
                  alt={vehicle.title}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  {vehicle.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md shadow-sm ${
                        tag === 'Disponible' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Content Details */}
              <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    <a href={`/vehiculos/${vehicle.id}`}>
                      <span className="absolute inset-0" />
                      {vehicle.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{vehicle.specs}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-extrabold text-blue-900">{vehicle.price}</span>
                  <span className="text-xs font-semibold text-blue-600 group-hover:underline">Ver detalles &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}