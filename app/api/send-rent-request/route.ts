import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Resend } from 'resend';
import { createElement } from 'react';
import RentalRequestEmail from './RentalRequestEmail';

// Asegúrate de tener RESEND_API_KEY en tus variables de entorno (.env.local)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();

  try {
    // 1. Guardar la solicitud en la base de datos de Firestore
    // Esto creará la colección "rentals" si no existe.
    const rentalsCollection = collection(db, 'rentals');

    // 2. Enviar la notificación por correo electrónico (funcionalidad existente)
    await resend.emails.send({
      from: 'Notificaciones SuAuto <noreply@suautohn.com>',
      to: ['ventas@suautohn.com', 'carlos.diaz@suautohn.com'],
      subject: `Nueva Solicitud de Renta - ${body.firstName} ${body.lastName}`,
      react: createElement(RentalRequestEmail, { formData: body }),
    });

    return NextResponse.json({ message: 'Solicitud enviada y guardada correctamente' }, { status: 200 });

  } catch (error) {
    console.error('Error en /api/send-rent-request:', error);
    return NextResponse.json({ message: 'Error al procesar la solicitud', error: (error as Error).message }, { status: 500 });
  }
}