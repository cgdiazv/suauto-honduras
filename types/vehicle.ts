// src/types/vehicle.ts
export interface Vehicle {
  id?: string;
  title: string;              // Título o nombre del post
  featuredImage: string;      // Imagen destacada
  brand: string;              // Marca
  modelName: string;          // Modelo
  types: string[];            // Checkboxes (Bicicleta, Camión, Pickup, SUV, etc.)
  status: 'Disponible' | 'Reservado' | 'Vendido';
  galleryImages: {            // Los 10 ángulos específicos solicitados
    frente?: string;
    atras?: string;
    derecha?: string;
    izquierda?: string;
    frenteDerecha?: string;
    frenteIzquierda?: string;
    atrasDerecha?: string;
    atrasIzquierda?: string;
    tablero?: string;
    motor?: string;
  };
  price: string;              // Precio
  mileage: {                  // Millaje
    value: number;
    unit: 'Km' | 'Millas';
  };
  engine: string;             // Motor (Cilindraje)
  countryOfOrigin: string;    // País de Origen
  year: number;               // Año de Fabricación
  salesAgent: string;         // Asesor de Ventas
  
  // Checkboxes de Extras, Seguridad, Interior, Exterior, Condiciones, Colores, Combustibles y Transmisiones
  extras: string[];           // Botagua, Parrilla de Techo, Remolque, etc.
  security: string[];         // Bolsas de Aire, Frenos ABS, etc.
  interiorFeatures: string[]; // Aire Acondicionado, Asientos de cuero, etc.
  exteriorFeatures: string[]; // Copas de lujo, Rines de lujo, etc.
  conditions: string[];       // Chocado, Nuevo, Usado de Agencia, etc.
  colors: string[];           // Amarillo, Azul, Blanco, etc.
  fuels: string[];            // Diésel, Gasolina, Híbrido, Eléctrico, etc.
  transmissions: string[];    // Automático, Automático 4x4, Manual, etc.
  
  createdAt: number;
}