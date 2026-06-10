import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { formatPrice } from '@/lib/format';

// Inicializamos Resend con la llave del entorno secreto
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, phone, email, location,
      brand, modelName, year, mileage, price,
      transmission, fuelType, details, imageUrl 
    } = body;

    // Validación básica de campos requeridos
    if (!fullName || !phone || !brand || !modelName || !year || !price) {
      return NextResponse.json({ error: 'Faltan campos mandatorios por rellenar.' }, { status: 400 });
    }

    // Estructuramos el correo electrónico con HTML limpio
    const { data, error } = await resend.emails.send({
      from: 'Su Auto Alertas <notifications@indevasa.com>',
      to: ['contacto@suautohonduras.com'],
      subject: `🚗 Nueva Propuesta de Venta: ${brand} ${modelName} (${year})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; rounded-style: 12px;">
          <h2 style="color: #1e3a8a; margin-bottom: 4px;">Nueva Solicitud Recibida</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Un usuario desea vender su vehículo a través de la plataforma.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          
          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">👤 Datos del Propietario</h3>
          <ul style="list-style: none; padding-left: 0; line-height: 1.6; color: #334155; font-size: 14px;">
            <li><strong>Nombre Completo:</strong> ${fullName}</li>
            <li><strong>Teléfono / WhatsApp:</strong> ${phone}</li>
            <li><strong>Correo Electrónico:</strong> ${email || 'No proporcionado'}</li>
            <li><strong>Ubicación:</strong> ${location || 'No proporcionado'}</li>
          </ul>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">🚘 Detalles del Vehículo</h3>
          <ul style="list-style: none; padding-left: 0; line-height: 1.6; color: #334155; font-size: 14px;">
            <li><strong>Marca y Modelo:</strong> ${brand} ${modelName}</li>
            <li><strong>Año:</strong> ${year}</li>
            <li><strong>Kilometraje:</strong> ${Number(mileage).toLocaleString()} km</li>
            <li><strong>Precio Pretendido:</strong> ${formatPrice(price)}</li>
            <li><strong>Transmisión:</strong> ${transmission}</li>
            <li><strong>Combustible:</strong> ${fuelType}</li>
          </ul>

          ${details ? `
            <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Comentarios adicionales:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #334155;">${details}</p>
            </div>
          ` : ''}

          ${imageUrl ? `
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">📸 Fotografía del Vehículo</h3>
            <div style="margin-top: 12px;">
              <img src="${imageUrl}" alt="Foto del vehículo" style="width: 100%; max-width: 400px; border-radius: 8px; border: 1px solid #cbd5e1;" />
            </div>
          ` : ''}
          
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px;">Este es un mensaje automatizado generado por el módulo de tasación externa de Su Auto Honduras.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error crítico en el endpoint de Resend:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}