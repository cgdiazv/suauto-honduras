// src/types/vehicle.ts
export interface Vehicle {
  id?: string;
  brand: string;         // e.g., 'Ford', 'Toyota'
  modelName: string;     // e.g., 'F-150', 'Escape'
  year: number;          // e.g., 2023
  type: string;          // e.g., 'Pick-up', 'SUV / Camioneta', 'Turismo'
  transmission: 'Automática' | 'Mecánica';
  engine: string;        // e.g., '2.7 Bi-Turbo', '2.5'
  price: string;         // e.g., 'L. 135,000' or 'Financiamiento Disponible'
  status: 'Disponible' | 'Vendido' | 'Reservado';
  details: string;       // e.g., 'Doble cabina 4x4, impecable estado'
  imageUrls: string[];   // Array of links stored in Firebase Storage
  createdAt: number;
}