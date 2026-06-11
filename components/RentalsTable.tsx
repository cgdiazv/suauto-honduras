'use client';

import { CheckCircle, XCircle, Clock } from 'lucide-react';

export interface Rental {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  vehicleId: string;
  vehicleName?: string;
  status?: 'Pendiente' | 'Aprobada' | 'Rechazada';
  createdAt?: number;
}

interface RentalsTableProps {
  rentals: Rental[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: 'Pendiente' | 'Aprobada' | 'Rechazada') => void;
}

export default function RentalsTable({ rentals, loading, onStatusChange }: RentalsTableProps) {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto w-full block scrollbar-thin">
        <table className="w-full text-left border-collapse text-sm min-w-[800px]">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Vehículo</th>
              <th className="p-4">Fechas</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{rental.firstName} {rental.lastName}</div>
                  <div className="text-[10px] text-slate-400">{rental.email} • Tel: {rental.phone}</div>
                </td>
                <td className="p-4 font-medium text-slate-700">{rental.vehicleName || 'Vehículo Web'}</td>
                <td className="p-4 text-[11px] text-slate-600">
                  <div><span className="font-bold text-slate-400">Entrega:</span> {rental.pickupDate}</div>
                  <div><span className="font-bold text-slate-400">Devolución:</span> {rental.returnDate}</div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${rental.status === 'Aprobada' ? 'bg-[#67bd45] text-white border-[#67bd45]' : rental.status === 'Rechazada' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {rental.status || 'Pendiente'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onStatusChange(rental.id!, 'Aprobada')} title="Aprobar" aria-label="Aprobar renta" className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => onStatusChange(rental.id!, 'Rechazada')} title="Rechazar" aria-label="Rechazar renta" className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><XCircle className="w-4 h-4" /></button>
                    <button onClick={() => onStatusChange(rental.id!, 'Pendiente')} title="Marcar como Pendiente" aria-label="Marcar pendiente" className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"><Clock className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
