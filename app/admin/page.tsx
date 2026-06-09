// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Vehicle } from '@/types/vehicle';

export default function AdminPage() {
  const { user, logout } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Business Logic State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields State
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('SUV / Camioneta');
  const [transmission, setTransmission] = useState<'Automática' | 'Mecánica'>('Automática');
  const [engine, setEngine] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'Disponible' | 'Vendido' | 'Reservado'>('Disponible');
  const [details, setDetails] = useState('');
  const [placeholderUrl, setPlaceholderUrl] = useState(''); // Temporary image string path

  // Fetch inventory when admin logs in
  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

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
      console.error("Error loading vehicles:", err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError('Credenciales inválidas. Intente nuevamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    // Dynamic clean fallback image if field left empty
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
      // Reset Form fields
      setBrand(''); setModelName(''); setEngine(''); setPrice(''); setDetails(''); setPlaceholderUrl('');
      fetchInventory(); // Refresh view
    } catch (err) {
      console.error("Error protecting or saving doc: ", err);
      alert("Error al guardar el vehículo.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este vehículo del inventario?')) {
      try {
        await deleteDoc(doc(db, 'vehicles', id));
        fetchInventory();
      } catch (err) {
        console.error("Error deleting:", err);
        alert("No se pudo borrar el registro.");
      }
    }
  };

  // ================= VIEW: LOGIN INTERFACE =================
  if (!user) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight text-blue-900">SU AUTO<span className="text-blue-500">.hn</span></h2>
            <p className="mt-2 text-sm text-slate-500">Panel de Administración de Inventario</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">{loginError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:bg-blue-400">
              {isLoggingIn ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= VIEW: DASHBOARD MANAGEMENT =================
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Upper Menu Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Control de Inventario</h1>
          <p className="text-sm text-slate-500">Administrador: {user.email}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Ver Inventario' : '➕ Agregar Vehículo'}
          </button>
          <button onClick={() => logout()} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
            Salir
          </button>
        </div>
      </div>

      {/* FORM: ADD VEHICLE */}
      {showAddForm ? (
        <form onSubmit={handleAddVehicle} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
          <h2 className="text-xl font-bold text-slate-900 sm:col-span-2 border-b pb-2">Detalles del Nuevo Vehículo</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
            <input type="text" placeholder="Ej. Ford, Toyota" required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Línea / Modelo</label>
            <input type="text" placeholder="Ej. F-150, Rav4" required value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
            <input type="number" required value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Carrocería</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900">
              <option>SUV / Camioneta</option>
              <option>Pick-up</option>
              <option>Turismo</option>
              <option>Camión Sencillo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Transmisión</label>
            <select value={transmission} onChange={(e) => setTransmission(e.target.value as any)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900">
              <option value="Automática">Automática</option>
              <option value="Mecánica">Mecánica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motor / Cilindrada</label>
            <input type="text" placeholder="Ej. 2.7 Bi-Turbo, 2.5 Diésel" required value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio o Condición</label>
            <input type="text" placeholder="Ej. L. 135,000 o Financiamiento Disponible" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Disponibilidad</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900">
              <option value="Disponible">Disponible</option>
              <option value="Reservado">Reservado</option>
              <option value="Vendido">Vendido</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">URL de Imagen de Muestra (Opcional por ahora)</label>
            <input type="url" placeholder="https://ejemplo.com/imagen.jpg" value={placeholderUrl} onChange={(e) => setPlaceholderUrl(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Detalles Adicionales</label>
            <textarea rows={3} placeholder="Especificaciones adicionales..." value={details} onChange={(e) => setDetails(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 text-slate-900" />
          </div>

          <div className="sm:col-span-2 pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={formSubmitting} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400">
              {formSubmitting ? 'Guardando...' : 'Publicar Vehículo'}
            </button>
          </div>
        </form>
      ) : (
        /* TABLE INVENTORY LIST */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loadingInventory ? (
            <div className="p-12 text-center text-slate-500 text-sm">Cargando inventario de Firestore...</div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <p className="font-medium">No hay vehículos registrados en la base de datos.</p>
              <p className="text-xs text-slate-400">Presione el botón "Agregar Vehículo" para comenzar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Vehículo</th>
                    <th className="p-4">Tipo / Transmisión</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img src={car.imageUrls[0]} alt="" className="w-12 h-12 object-cover rounded-md bg-slate-100 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{car.brand} {car.modelName}</div>
                          <div className="text-xs text-slate-400">Año {car.year} • Motor {car.engine}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>{car.type}</div>
                        <div className="text-xs text-slate-400">{car.transmission}</div>
                      </td>
                      <td className="p-4 font-semibold text-blue-950">{car.price}</td>
                      <td className="p-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          car.status === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          car.status === 'Reservado' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteVehicle(car.id!)} 
                          className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md transition"
                        >
                          Eliminar
                        </button>
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