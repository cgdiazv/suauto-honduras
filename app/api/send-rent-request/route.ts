import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      // Personal
      firstName, lastName, idNumber, birthDate, licenseNumber, licenseExpiry, email, phone, address, referencePoint, city, state, zipCode, country,
      // Trabajo
      workCompany, workPosition, workEmail, workPhone, workAddress1, workAddress2, workCity, workState, workZipCode,
      // Alojamiento
      stayAddress1, stayAddress2, stayCity, stayState, stayZipCode,
      // Detalles Renta
      pickupDate, pickupTime, returnDate, returnTime, vehicleType,
      // Multimedia adjuntos
      licenseImgUrl, idImgUrl, selfieImgUrl, signatureImgUrl
    } = body;

    // Validación mínima de campos requeridos
    if (!firstName || !lastName || !idNumber || !licenseNumber || !pickupDate || !returnDate || !vehicleType) {
      return NextResponse.json({ error: 'Faltan campos mandatorios por rellenar.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Su Auto Rentas <notifications@indevasa.com>',
      to: ['contacto@suautohonduras.com'],
      subject: `🔑 Nueva Solicitud de Renta: ${firstName} ${lastName} - ${vehicleType}`,
      html: `
        <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; color: #334155;">
          <h2 style="color: #1e3a8a; margin-bottom: 4px; text-align: center;">Solicitud de Renta de Vehículo</h2>
          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 0;">Un cliente ha enviado una solicitud completa desde el sitio web.</p>
          
          <!-- DETALLES DE RENTA -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #1d4ed8; margin-top: 0; margin-bottom: 10px; font-size: 15px;">🗓️ Detalles del Alquiler</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0;"><strong>Tipo de Vehículo:</strong> ${vehicleType}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Recogida:</strong> ${pickupDate} a las ${pickupTime}</td>
                <td style="padding: 4px 0;"><strong>Devolución:</strong> ${returnDate} a las ${returnTime}</td>
              </tr>
            </table>
          </div>

          <!-- INFORMACIÓN PERSONAL -->
          <h3 style="color: #0f172a; font-size: 15px; border-b: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">👤 Información Personal</h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="width: 50%;"><strong>Nombre Completo:</strong> ${firstName} ${lastName}</td>
              <td><strong>Fecha de Nacimiento:</strong> ${birthDate}</td>
            </tr>
            <tr>
              <td><strong>Identidad / Pasaporte:</strong> ${idNumber}</td>
              <td><strong>Licencia de Conducir:</strong> ${licenseNumber} (Expira: ${licenseExpiry})</td>
            </tr>
            <tr>
              <td><strong>Email:</strong> ${email}</td>
              <td><strong>Teléfono:</strong> ${phone}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Dirección Residencia:</strong> ${address}, ${city}, ${state}. CP: ${zipCode} (${country})</td>
            </tr>
            ${referencePoint ? `<tr><td colspan="2"><strong>Punto de Referencia:</strong> ${referencePoint}</td></tr>` : ''}
          </table>

          <!-- INFORMACIÓN DE TRABAJO -->
          <h3 style="color: #0f172a; font-size: 15px; border-b: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">💼 Información de Trabajo</h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="width: 50%;"><strong>Empresa:</strong> ${workCompany}</td>
              <td><strong>Cargo:</strong> ${workPosition}</td>
            </tr>
            <tr>
              <td><strong>Email Trabajo:</strong> ${workEmail}</td>
              <td><strong>Teléfono Trabajo:</strong> ${workPhone}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Dirección Laboral:</strong> ${workAddress1} ${workAddress2 ? `, ${workAddress2}` : ''} - ${workCity}, ${workState}. CP: ${workZipCode}</td>
            </tr>
          </table>

          <!-- INFORMACIÓN DE ALOJAMIENTO -->
          ${stayAddress1 ? `
            <h3 style="color: #0f172a; font-size: 15px; border-b: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">🏨 Información de Alojamiento</h3>
            <p style="font-size: 13px; margin: 4px 0;"><strong>Dirección de Estadía:</strong> ${stayAddress1} ${stayAddress2 ? `, ${stayAddress2}` : ''} - ${stayCity}, ${stayState}. CP: ${stayZipCode}</p>
          ` : ''}

          <!-- DOCUMENTOS ADJUNTOS -->
          <h3 style="color: #0f172a; font-size: 15px; border-b: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">📸 Documentación Verificada</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
            ${licenseImgUrl ? `
              <div style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; border-radius: 6px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold;">Imagen de Licencia</p>
                <img src="${licenseImgUrl}" style="max-width: 100%; max-height: 150px; object-fit: contain; border-radius: 4px;" />
              </div>
            ` : ''}
            
            ${idImgUrl ? `
              <div style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; border-radius: 6px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold;">Documento de Identidad</p>
                <img src="${idImgUrl}" style="max-width: 100%; max-height: 150px; object-fit: contain; border-radius: 4px;" />
              </div>
            ` : ''}

            ${selfieImgUrl ? `
              <div style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; border-radius: 6px; grid-column: span 2;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold;">Foto Selfie</p>
                <img src="${selfieImgUrl}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 4px;" />
              </div>
            ` : ''}
          </div>

          <!-- FIRMA DIGITAL -->
          ${signatureImgUrl ? `
            <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #475569;">Firma de Conformidad del Cliente (Aceptó Términos):</p>
              <img src="${signatureImgUrl}" style="border: 1px solid #e2e8f0; background-color: #f8fafc; max-width: 250px; max-height: 100px; object-fit: contain;" />
            </div>
          ` : ''}
          
        </div>
      `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error crítico procesando renta:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}