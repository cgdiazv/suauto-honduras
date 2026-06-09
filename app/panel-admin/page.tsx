// src/app/panel-admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Vehicle } from '@/types/vehicle';

const ADMIN_EMAIL = "contacto@suautohonduras.com";

export default function PanelAdminPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Estados del Inventario
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Estados de los Campos del Formulario
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('SUV / Camioneta');
  const [transmission, setTransmission] = useState<'Automática' | 'Mecánica'>('Automática');
  const [engine, setEngine] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'Disponible' | 'Vendido' | 'Reservado'>('Disponible');
  const [details, setDetails] = useState('');
  const [placeholderUrl, setPlaceholderUrl] = useState('');

  // 🛡️ Filtro de seguridad estricto
  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login'); // Expulsar si no es el admin institucional
      } else {
        fetchInventory();
      }
    }
  }, [user, loading, router]);

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Vehicle[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Vehicle);
      });
      setVehicles(data);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const finalImage = placeholderUrl.trim() || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600';

    const newVehicle: Vehicle = {
      brand,
      modelName,
      year: Number(year),
      type,
      transmission,
      engine,
      price,
      status,
      details,
      imageUrls: [finalImage],
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'vehicles'), newVehicle);
      setShowAddForm(false);
      // Limpiar campos
      setBrand(''); setModelName(''); setEngine(''); setPrice(''); setDetails(''); setPlaceholderUrl('');
      fetchInventory();
    } catch (err) {
      console.error("Error al guardar en Firestore: ", err);
      alert("Error al guardar el vehículo.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      try {
        await deleteDoc(doc(db, 'vehicles', id));
        fetchInventory();
      } catch (err) {
        console.error(err);
        alert("No se pudo borrar el registro.");
      }
    }
  };

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="p-12 text-center text-slate-500 text-sm">Verificando credenciales de acceso...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Barra de Menú */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Panel de Administración</h1>
          <p className="text-sm text-slate-500">Gestión de stock de Su Auto Honduras</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Ver Lista de Inventario' : '➕ Agregar Vehículo'}
          </button>
          <button 
            onClick={async () => { await logout(); router.push('/login'); }} 
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* FORMULARIO CRUD */}
      {showAddForm ? (
        <form onSubmit={handleAddVehicle} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* ... Todos los inputs de Marca, Modelo, Año, Precio que construimos anteriormente se quedan exactamente igual aquí ... */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
            <input type="text" placeholder="Ej. Ford" required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Línea / Modelo</label>
            <input type="text" placeholder="Ej. F-150" required value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
            <input type="text" placeholder="Ej. L. 135,000" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" />
          </div>
          <div className="sm:col-span-2 pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600">Cancelar</button>
            <button type="submit" disabled={formSubmitting} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white">{formSubmitting ? 'Guardando...' : 'Publicar Vehículo'}</button>
          </div>
        </form>
      ) : (
        /* TABLA DE VEHÍCULOS */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loadingInventory ? (
            <div className="p-12 text-center text-slate-500 text-sm">Cargando inventario...</div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No hay vehículos registrados aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th className="p-4">Vehículo</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{car.brand} {car.modelName} ({car.year})</td>
                      <td className="p-4 font-semibold text-blue-900">{car.price}</td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full">{car.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteVehicle(car.id!)} className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}