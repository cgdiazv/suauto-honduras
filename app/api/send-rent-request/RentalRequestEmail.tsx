import React from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  birthDate: string;
  licenseNumber: string;
  licenseExpiry: string;
  email: string;
  phone: string;
  address: string;
  referencePoint?: string; // ➕ Agregado
  city: string;            // ➕ Agregado
  state: string;           // ➕ Agregado
  zipCode?: string;        // ➕ Agregado
  country: string;         // ➕ Agregado
  workCompany: string;
  workPosition: string;
  workEmail: string;
  workPhone: string;
  stayAddress1?: string;   // ➕ Agregado
  stayAddress2?: string;   // ➕ Agregado
  stayCity?: string;       // ➕ Agregado
  stayState?: string;      // ➕ Agregado
  stayZipCode?: string;    // ➕ Agregado
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  vehicleType: string;
  licenseImgUrl: string;
  idImgUrl: string;
  selfieImgUrl: string;
  signatureImgUrl: string;
}

interface RentalRequestEmailProps {
  formData: FormData;
}

const sectionStyle = {
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #eeeeee',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
};

const headingStyle = {
  borderBottom: '2px solid #dddddd',
  paddingBottom: '10px',
  marginBottom: '15px',
  fontSize: '14px',
  fontWeight: 'bold' as 'bold',
  color: '#333333',
  textTransform: 'uppercase' as 'uppercase',
};

const fieldStyle = {
  marginBottom: '8px',
  fontSize: '14px',
};

const labelStyle = {
  fontWeight: 'bold' as 'bold',
  color: '#555555',
};

const imageStyle = {
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid #cccccc',
  borderRadius: '4px',
  marginTop: '10px',
};

const RentalRequestEmail: React.FC<RentalRequestEmailProps> = ({ formData }) => {
  const {
    firstName, lastName, idNumber, birthDate, licenseNumber, licenseExpiry, email, phone, address,
    referencePoint, city, state, zipCode, country,
    workCompany, workPosition, workEmail, workPhone,
    stayAddress1, stayAddress2, stayCity, stayState, stayZipCode,
    pickupDate, pickupTime, returnDate, returnTime, vehicleType,
    licenseImgUrl, idImgUrl, selfieImgUrl, signatureImgUrl
  } = formData;

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <title>Nueva Solicitud de Renta</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#333333', lineHeight: 1.6 }}>
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #dddddd', borderRadius: '10px' }}>
          <h1 style={{ color: '#0056b3', textAlign: 'center' }}>Nueva Solicitud de Renta de Vehículo</h1>
          <p style={{ textAlign: 'center', fontSize: '16px' }}>Se ha recibido una nueva solicitud a través del formulario web.</p>

          {/* Sección 1: Información Personal (Campos de dirección expandidos) */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Información Personal</h2>
            <p style={fieldStyle}><span style={labelStyle}>Nombre:</span> {firstName} {lastName}</p>
            <p style={fieldStyle}><span style={labelStyle}>Email:</span> {email}</p>
            <p style={fieldStyle}><span style={labelStyle}>Teléfono:</span> {phone}</p>
            <p style={fieldStyle}><span style={labelStyle}>Identidad/Pasaporte:</span> {idNumber}</p>
            <p style={fieldStyle}><span style={labelStyle}>Fecha de Nacimiento:</span> {birthDate}</p>
            <p style={fieldStyle}><span style={labelStyle}>Dirección de Residencia:</span> {address}</p>
            {referencePoint && <p style={fieldStyle}><span style={labelStyle}>Punto de Referencia:</span> {referencePoint}</p>}
            <p style={fieldStyle}><span style={labelStyle}>Ubicación:</span> {city}, {state} {zipCode ? `(CP: ${zipCode})` : ''}, {country}</p>
          </div>

          {/* Sección 2: Detalles de la Licencia */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Detalles de la Licencia</h2>
            <p style={fieldStyle}><span style={labelStyle}>Número de Licencia:</span> {licenseNumber}</p>
            <p style={fieldStyle}><span style={labelStyle}>Expiración de Licencia:</span> {licenseExpiry}</p>
          </div>

          {/* 🔑 Sección Nueva 3: Información de Trabajo */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Información de Trabajo</h2>
            <p style={fieldStyle}><span style={labelStyle}>Empresa:</span> {workCompany}</p>
            <p style={fieldStyle}><span style={labelStyle}>Cargo:</span> {workPosition}</p>
            <p style={fieldStyle}><span style={labelStyle}>Email de Trabajo:</span> {workEmail}</p>
            <p style={fieldStyle}><span style={labelStyle}>Teléfono de Trabajo:</span> {workPhone}</p>
          </div>

          {/* 🔑 Sección Nueva 4: Información de Alojamiento (Muestra si se llenó) */}
          {(stayAddress1 || stayCity || stayState) && (
            <div style={sectionStyle}>
              <h2 style={headingStyle}>Información de Alojamiento en Honduras</h2>
              <p style={fieldStyle}><span style={labelStyle}>Dirección 1:</span> {stayAddress1 || 'N/A'}</p>
              {stayAddress2 && <p style={fieldStyle}><span style={labelStyle}>Dirección 2:</span> {stayAddress2}</p>}
              <p style={fieldStyle}><span style={labelStyle}>Ubicación Estadía:</span> {stayCity || 'N/A'}, {stayState || 'N/A'} {stayZipCode ? `(CP: ${stayZipCode})` : ''}</p>
            </div>
          )}

          {/* Sección 5: Detalles de la Renta */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Detalles de la Renta</h2>
            <p style={fieldStyle}><span style={labelStyle}>Tipo de Vehículo:</span> {vehicleType}</p>
            <p style={fieldStyle}><span style={labelStyle}>Recogida:</span> {pickupDate} a las {pickupTime}</p>
            <p style={fieldStyle}><span style={labelStyle}>Devolución:</span> {returnDate} a las {returnTime}</p>
          </div>

          {/* Sección 6: Documentación Adjunta */}
          <div style={sectionStyle}>
            <h2 style={headingStyle}>Documentación Adjunta</h2>
            {licenseImgUrl && <div><p style={labelStyle}>Licencia:</p><a href={licenseImgUrl} target="_blank" rel="noopener noreferrer"><img src={licenseImgUrl} alt="Licencia" style={imageStyle} width="300"/></a></div>}
            {idImgUrl && <div><p style={labelStyle}>Identidad:</p><a href={idImgUrl} target="_blank" rel="noopener noreferrer"><img src={idImgUrl} alt="Identidad" style={imageStyle} width="300"/></a></div>}
            {selfieImgUrl && <div><p style={labelStyle}>Selfie:</p><img src={selfieImgUrl} alt="Selfie" style={imageStyle} width="300"/></div>}
            {signatureImgUrl && <div><p style={labelStyle}>Firma:</p><img src={signatureImgUrl} alt="Firma" style={imageStyle} width="300"/></div>}
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#888888', marginTop: '30px' }}>Este es un correo generado automáticamente. Por favor, no responda a este mensaje.</p>
        </div>
      </body>
    </html>
  );
};

export default RentalRequestEmail;