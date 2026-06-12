// src/components/RentalDetailModal.tsx
'use client';

import { X, Printer, Calendar, User, Briefcase, MapPin, FileText } from 'lucide-react';
import { Rental } from './RentalsTable';

interface RentalDetailModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RentalDetailModal({ rental, isOpen, onClose }: RentalDetailModalProps) {
  if (!isOpen || !rental) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Solicitud de Renta | ${rental.firstName} ${rental.lastName}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:absolute">
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col print:max-h-none print:box-none print:shadow-none print:border-none print:w-full">
        
        {/* Cabecera del Modal (Se oculta al imprimir) */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Detalles y Acuerdo de Renta</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimir Acuerdo
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 📄 CONTENIDO DEL ACUERDO (Optimizado para pantalla e Impresión) */}
        <div className="p-8 space-y-8 overflow-y-auto print:overflow-visible print:p-0 font-sans text-slate-800">
          
          {/* Encabezado del Contrato Oficial (Visible siempre, formateado para imprenta) */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">SU AUTO HONDURAS</h1>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mt-1">Contrato de Arrendamiento de Vehículo</p>
            <div className="flex justify-between items-center mt-4 text-xs font-mono text-slate-500 print:text-slate-900">
              <span>Nº REFERENCIA: {rental.id?.substring(0, 8).toUpperCase() || 'WEB-TEMP'}</span>
              <span>FECHA EMISIÓN: {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('es-HN') : 'N/A'}</span>
            </div>
          </div>

          {/* Bloque 1: Términos de la Renta */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1 print:border-slate-400">
              <Calendar className="w-4 h-4 print:hidden" /> 1. Términos del Alquiler y Vehículo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Vehículo Seleccionado</span>
                <span className="font-semibold text-slate-800 uppercase">{rental.vehicleName || 'Vehículo Web'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha y Hora Entrega</span>
                <span className="font-semibold text-slate-800">{rental.pickupDate} a las {rental.pickupTime || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha y Hora Devolución</span>
                <span className="font-semibold text-slate-800">{rental.returnDate} a las {rental.returnTime || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Bloque 2: Información del Cliente */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1 print:border-slate-400">
              <User className="w-4 h-4 print:hidden" /> 2. Datos Generales del Arrendatario
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</span>
                <span className="font-semibold text-slate-800">{rental.firstName} {rental.lastName}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Identificación / Pasaporte</span>
                <span className="font-semibold text-slate-800">{rental.idNumber || 'No especificado'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</span>
                <span className="font-semibold text-slate-800">{rental.birthDate || 'No especificado'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</span>
                <span className="font-semibold text-slate-800">{rental.email}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</span>
                <span className="font-semibold text-slate-800">{rental.phone}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Estatus del Trámite</span>
                <span className="font-bold text-slate-800 uppercase">{rental.status || 'Pendiente'}</span>
              </div>
            </div>
          </div>

          {/* Bloque 3: Licencia y Ubicación */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1 print:border-slate-400">
              <MapPin className="w-4 h-4 print:hidden" /> 3. Licencia de Conducir y Domicilio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Nº de Licencia</span>
                <span className="font-semibold text-slate-800">{rental.licenseNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Expiración Licencia</span>
                <span className="font-semibold text-slate-800">{rental.licenseExpiry || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Ciudad / País</span>
                <span className="font-semibold text-slate-800">{rental.city || 'N/A'}, {rental.country || 'N/A'}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección Residencial Exacta</span>
                <span className="font-medium text-slate-700">{rental.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Bloque 4: Datos Laborales / Estadía */}
          {(rental.workCompany || rental.stayAddress1) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1 print:border-slate-400">
                <Briefcase className="w-4 h-4 print:hidden" /> 4. Respaldo Laboral y Hospedaje
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {rental.workCompany && (
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Empresa / Puesto</span>
                    <span className="font-semibold text-slate-800">{rental.workCompany} — {rental.workPosition || 'Colaborador'}</span>
                  </div>
                )}
                {rental.stayAddress1 && (
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección de Estadía en Honduras</span>
                    <span className="font-semibold text-slate-800">{rental.stayAddress1} ({rental.stayCity})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bloque 5: Cláusulas del Contrato (Legal Estándar - Solo visible o extendido al imprimir) */}
          <div className="text-[10px] text-slate-500 text-justify space-y-2 leading-relaxed border-t border-slate-200 pt-4 print:text-black print:border-slate-400">
            <p className="font-bold uppercase text-slate-700 print:text-black">TÉRMINOS Y CONDICIONES LEGALES DEL ARRENDAMIENTO:</p>
            <p>
              El Arrendatario declara recibir el vehículo descrito en perfectas condiciones mecánicas, de carrocería y de limpieza, obligándose a devolverlo en el mismo estado en la fecha y hora pactadas. El uso del vehículo está restringido exclusivamente al territorio de la República de Honduras. Queda estrictamente prohibido subarrendar, conducir bajo los efectos del alcohol o estupefacientes, o utilizar el vehículo para fines ilícitos o de carga pesada. Cualquier daño ocasionado por negligencia será responsabilidad absoluta del Arrendatario.
            </p>
          </div>

          {/* Bloque 6: Área de Firmas Autógrafas */}
          <div className="grid grid-cols-2 gap-12 pt-12 border-t border-dashed border-slate-200 print:border-slate-400">
            {/* Firma Cliente Digitalizada si existe */}
            <div className="text-center space-y-2">
              <div className="h-20 flex items-center justify-center border-b border-slate-300 mx-auto max-w-[240px]">
                {rental.signatureImgUrl ? (
                  <img src={rental.signatureImgUrl} alt="Firma Cliente" className="max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-300 italic print:hidden">Firma física requerida</span>
                )}
              </div>
              <span className="block text-xs font-bold text-slate-800 uppercase">Firma del Arrendatario</span>
              <span className="block text-[10px] text-slate-400">ID: {rental.idNumber || '_______'}</span>
            </div>

            {/* Firma Administrador Su Auto */}
            <div className="text-center space-y-2">
              <div className="h-20 flex items-center justify-center border-b border-slate-300 mx-auto max-w-[240px]">
                <span className="text-xs text-slate-300 italic print:hidden">Sello Autorizado</span>
              </div>
              <span className="block text-xs font-bold text-slate-800 uppercase">Por: SU AUTO HONDURAS</span>
              <span className="block text-[10px] text-slate-400">Firma Administrador</span>
            </div>
          </div>

          {/* Bloque Opcional: Galería de Documentos Adjuntos (Se oculta por defecto al imprimir para ahorrar papel, visible en pantalla) */}
          {(rental.licenseImgUrl || rental.idImgUrl || rental.selfieImgUrl) && (
            <div className="border-t border-slate-200 pt-6 print:hidden">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Imágenes e Identificaciones Adjuntas</h4>
              <div className="grid grid-cols-3 gap-4">
                {rental.licenseImgUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Licencia</span>
                    <a href={rental.licenseImgUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-50 hover:opacity-90 transition">
                      <img src={rental.licenseImgUrl} alt="Licencia" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
                {rental.idImgUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Identificación</span>
                    <a href={rental.idImgUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-50 hover:opacity-90 transition">
                      <img src={rental.idImgUrl} alt="ID" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
                {rental.selfieImgUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Selfie Validación</span>
                    <a href={rental.selfieImgUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-50 hover:opacity-90 transition">
                      <img src={rental.selfieImgUrl} alt="Selfie" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Estilos CSS Inyectados Exclusivos para la Impresión */}
      <style jsx global>{`
        @media print {
          /* Ocultamos absolutamente todo lo que esté en el Layout raíz */
          body * {
            visibility: hidden;
          }
          /* Hacemos visible únicamente nuestro modal y sus hijos */
          .fixed, .fixed * {
            visibility: visible;
          }
          /* Posicionamos el contenedor de impresión al inicio absoluto de la página */
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          /* Ocultamos barras de scroll de contenedores internos */
          div {
            overflow: visible !important;
            max-h: none !important;
          }
        }
      `}</style>

    </div>
  );
}