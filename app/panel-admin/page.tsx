'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Vehicle } from '@/types/vehicle';
import { Key, Users, Settings, List, Plus } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import InventoryTable from '@/components/InventoryTable';
import VehicleForm from '@/components/VehicleForm';
import RentalsTable, { Rental } from '@/components/RentalsTable';
import AdminSettingsForm from '@/components/AdminSettingsForm';
import { useLanguage } from '@/context/LanguageContext';

const ADMIN_EMAIL = "contacto@suautohonduras.com";

export interface Customer {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  createdAt?: any;
}

export default function PanelAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'vehiculos' | 'rentas' | 'clientes' | 'ajustes'>('vehiculos');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login'); 
      } else {
        fetchInventory();
        fetchRentals();
        fetchCustomers();
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
      console.error(err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchRentals = async () => {
    setLoadingRentals(true);
    try {
      const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Rental[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Rental);
      });
      setRentals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRentals(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Customer[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers, maybe missing index. Trying without orderBy.", err);
      // Fallback query in case the index on 'createdAt' doesn't exist
      const q2 = query(collection(db, 'users'));
      const querySnapshot2 = await getDocs(q2);
      const data: Customer[] = [];
      querySnapshot2.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(data);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowAddForm(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm(t.admin?.confirmations?.deleteVehicle || '¿Desea eliminar este vehículo por completo del stock?')) {
      try {
        await deleteDoc(doc(db, 'vehicles', id));
        fetchInventory();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePublishClick = () => {
    if (showAddForm) {
      setEditingVehicle(null);
      setShowAddForm(false);
    } else {
      setEditingVehicle(null);
      setShowAddForm(true);
    }
  };

  const handleUpdateRentalStatus = async (id: string, status: 'Pendiente' | 'Aprobada' | 'Rechazada') => {
    try {
      await updateDoc(doc(db, 'rentals', id), { status });
      // Refresca la tabla local para reflejar los cambios
      fetchRentals();
    } catch (err) {
      console.error("Error actualizando la renta:", err);
    }
  };

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="p-12 text-center text-slate-500 text-sm">{t.admin?.verifyingCredentials || 'Verificando credenciales de acceso...'}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen bg-slate-100 overflow-hidden text-slate-800 antialiased">
      
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} setShowAddForm={setShowAddForm} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Cabecera Responsiva */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-xs">
          <div>
            <span className="text-base md:text-xl font-black text-slate-900">
              {activeTab === 'vehiculos' ? (t.admin?.tabs?.vehicles || 'Vehículos') : activeTab === 'rentas' ? (t.admin?.tabs?.rentals || 'Alquileres') : activeTab === 'clientes' ? (t.admin?.tabs?.customers || 'Clientes') : (t.admin?.tabs?.settings || 'Ajustes')}
            </span>
          </div>
          {activeTab === 'vehiculos' && (
            <button 
              onClick={handlePublishClick}
              className="rounded-lg bg-blue-600 px-3 md:px-4 py-2 text-[11px] md:text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              {showAddForm ? <><List className="w-4 h-4" /> {t.admin?.actions?.viewList || 'Ver Lista'}</> : <><Plus className="w-4 h-4" /> {t.admin?.actions?.publish || 'Publicar'}</>}
            </button>
          )}
        </header>

        {/* Área de Trabajo con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {activeTab === 'vehiculos' && (
            showAddForm ? (
              <VehicleForm 
                key={editingVehicle ? editingVehicle.id : 'new'}
                vehicleToEdit={editingVehicle}
                onSaveSuccess={() => {
                  setShowAddForm(false);
                  setEditingVehicle(null);
                  fetchInventory();
                }}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingVehicle(null);
                }}
              />
            ) : (
              <InventoryTable 
                vehicles={vehicles} 
                loadingInventory={loadingInventory} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteVehicle} 
              />
            )
          )}

          {/* CASILLAS CONCEPTUALES ADAPTABLES */}
          {activeTab === 'rentas' && (
            <RentalsTable 
              rentals={rentals} 
              loading={loadingRentals} 
              onStatusChange={handleUpdateRentalStatus} 
            />
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                      <tr>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Correo Electrónico</th>
                        <th className="p-4">Teléfono</th>
                        <th className="p-4">Ciudad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingCustomers ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">Cargando clientes...</td></tr>
                      ) : customers.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">No hay clientes registrados aún.</td></tr>
                      ) : (
                        customers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-medium text-slate-900">{customer.fullName || 'N/A'}</td>
                            <td className="p-4">{customer.email || 'N/A'}</td>
                            <td className="p-4">{customer.phone || 'N/A'}</td>
                            <td className="p-4">{customer.city || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ajustes' && (
            <AdminSettingsForm />
          )}

        </div>
      </main>
    </div>
  );
}