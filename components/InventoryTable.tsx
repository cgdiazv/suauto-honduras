'use client';

import { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/lib/format';
import { Edit, Trash2 } from 'lucide-react';

interface InventoryTableProps {
  vehicles: Vehicle[];
  loadingInventory: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

export default function InventoryTable({ vehicles, loadingInventory, onEdit, onDelete }: InventoryTableProps) {
  if (loadingInventory) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-12 text-center text-slate-500 text-sm">Loading inventory...</div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-12 text-center text-slate-500 text-sm">No vehicles registered.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto w-full block scrollbar-thin">
        <table className="w-full text-left border-collapse text-sm min-w-[600px]">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
            <tr>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((car) => (
              <tr key={car.id} className="hover:bg-slate-50/50">
                <td className="p-4 flex items-center gap-3">
                  {car.featuredImage && <img src={car.featuredImage} alt="" className="w-10 h-10 object-cover rounded-md bg-slate-100 flex-shrink-0" />}
                  <div className="max-w-[180px] sm:max-w-none">
                    <div className="font-bold text-slate-900 uppercase truncate text-xs sm:text-sm">{car.title || `${car.brand} ${car.modelName}`}</div>
                    <div className="text-[10px] text-slate-400">Year {car.year} • Agent: {car.salesAgent || 'N/A'}</div>
                  </div>
                </td>
                <td className="p-4 font-semibold text-blue-900 text-xs sm:text-sm">{formatPrice(car.price)}</td>
                <td className="p-4">
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${car.status === 'Disponible' ? 'bg-[#67bd45] text-white border-[#67bd45]' : car.status === 'Reservado' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    {car.status === 'Disponible' 
                      ? 'Available'
                      : car.status === 'Reservado' 
                      ? 'Reserved'
                      : car.status === 'Vendido'
                      ? 'Sold'
                      : car.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 sm:gap-3">
                    <button 
                      onClick={() => onEdit(car)} 
                      title="Edit"
                      aria-label="Edit vehicle"
                      className="p-1.5 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(car.id!)} 
                      title="Delete"
                      aria-label="Delete vehicle"
                      className="p-1.5 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
