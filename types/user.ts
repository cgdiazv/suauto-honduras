// src/types/user.ts
export interface UserProfile {
  uid: string;           // El ID único generado por Firebase Auth
  fullName: string;      // Nombre completo del cliente
  email: string;         // Correo electrónico
  phone: string;         // Teléfono (ej. +504 XXXX-XXXX)
  city: string;          // Ciudad (ej. San Pedro Sula, Tegucigalpa)
  role: 'client';        // Rol explícito para el sistema de permisos
  createdAt: number;     // Fecha de registro
}