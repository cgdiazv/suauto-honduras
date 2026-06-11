// src/components/RentalsTable.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import RentalDetailModal from './RentalDetailModal';

export interface Rental {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime?: string;
  returnDate: string;
  returnTime?: string;
  vehicleId: string;
  vehicleName?: string;
  vehicleType?: string;
  status?: 'Pendiente' | 'Aprobada' | 'Rechazada';
  createdAt?: string;
  idNumber?: string;
  birthDate?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  address?: string;
  city?: string;
  country?: string;
  workCompany?: string;
  workPosition?: string;
  stayAddress1?: string;
  stayCity?: string;
  licenseImgUrl?: string;
  idImgUrl?: string;
  selfieImgUrl?: string;
  signatureImgUrl?: string;
}

interface RentalsTableProps {
  rentals: Rental[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: 'Pendiente' | 'Aprobada' | 'Rechazada') => void;
}

export default function RentalsTable({ rentals, loading, onStatusChange }: RentalsTableProps) {
  // 🔑 Estados para el modal interactivo
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetails = (rental: Rental) => {
    setSelectedRental(rental);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-12 text-center text-slate-500 text-sm">Cargando solicitudes de renta...</div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-12 text-center text-slate-500 text-sm">No hay solicitudes de renta registradas.</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
        <div className="overflow-x-auto w-full block scrollbar-thin">
          <table className="w-full text-left border-collapse text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Vehículo / Tipo</th>
                <th className="p-4">Fechas y Horas</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentals.map((rental) => (
                <tr 
                  key={rental.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  {/* Clic en los datos abre el modal de acuerdo */}
                  <td className="p-4" onClick={() => handleOpenDetails(rental)}>
                    <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {rental.firstName} {rental.lastName}
                    </div>
                    <div className="text-[10px] text-slate-400">{rental.email} • Tel: {rental.phone}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-700" onClick={() => handleOpenDetails(rental)}>
                    <div>{rental.vehicleName || 'Vehículo Web'}</div>
                    {rental.vehicleType && (
                      <div className="text-[10px] text-slate-400 font-normal italic">Categoría: {rental.vehicleType}</div>
                    )}
                  </td>
                  <td className="p-4 text-[11px] text-slate-600" onClick={() => handleOpenDetails(rental)}>
                    <div>
                      <span className="font-bold text-slate-400">Entrega:</span> {rental.pickupDate} 
                      {rental.pickupTime && <span className="text-slate-400"> ({rental.pickupTime})</span>}
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">Devolución:</span> {rental.returnDate}
                      {rental.returnTime && <span className="text-slate-400"> ({rental.returnTime})</span>}
                    </div>
                  </td>
                  <td className="p-4" onClick={() => handleOpenDetails(rental)}>
                    <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border font-bold tracking-wider ${
                      rental.status === 'Aprobada' 
                        ? 'bg-[#67bd45] text-white border-[#67bd45]' 
                        : rental.status === 'Rechazada' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {rental.status || 'Pendiente'}
                    </span>
                  </td>
                  {/* Las acciones mantienen el stopPropagation implícito al no interrumpir el flujo */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 relative z-10">
                      <button onClick={() => onStatusChange(rental.id!, 'Aprobada')} title="Aprobar" className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors cursor-pointer"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => onStatusChange(rental.id!, 'Rechazada')} title="Rechazar" className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors cursor-pointer"><XCircle className="w-4 h-4" /></button>
                      <button onClick={() => onStatusChange(rental.id!, 'Pendiente')} title="Marcar como Pendiente" className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"><Clock className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔑 RENDERIZADO DEL MODAL GLOBAL */}
      <RentalDetailModal 
        rental={selectedRental}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}