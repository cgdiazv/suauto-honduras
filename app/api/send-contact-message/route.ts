import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Validación de campos requeridos de la imagen
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Todos los campos son mandatorios.' }, { status: 400 });
    }

    // Envío usando el dominio verificado en Resend
    const { data, error } = await resend.emails.send({
      from: 'Su Auto Mensajes <notifications@indevasa.com>',
      to: ['contacto@suautohonduras.com'],
      subject: `✉️ Nuevo Mensaje de Contacto: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; color: #334155;">
          <h2 style="color: #1e3a8a; margin-bottom: 4px;">Mensaje desde el Sitio Web</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Un cliente potencial ha dejado una consulta a través del formulario de contacto.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          
          <ul style="list-style: none; padding-left: 0; line-height: 1.6; font-size: 14px;">
            <li><strong>Nombre del Remitente:</strong> ${name}</li>
            <li><strong>Correo de Contacto:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></li>
          </ul>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

          <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 8px;">💬 Contenido del Mensaje:</h3>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #1e3a8a; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${message}</div>
          
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px;">Este correo fue generado de forma automatizada por el portal de Su Auto Honduras.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error en el endpoint de contacto:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}