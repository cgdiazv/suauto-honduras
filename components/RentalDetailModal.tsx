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
    document.title = `Contrato_Renta_${rental.firstName}_${rental.lastName}`;
    window.print();
    document.title = originalTitle;
  };

  // 🔑 Cálculo dinámico de los días de renta basados en las cadenas de fecha
  const calcularDiasRenta = (): number => {
    if (!rental.pickupDate || !rental.returnDate) return 1;
    try {
      const fechaEntrega = new Date(rental.pickupDate);
      const fechaDevolucion = new Date(rental.returnDate);
      const diferenciaTiempo = fechaDevolucion.getTime() - fechaEntrega.getTime();
      const dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
      return dias > 0 ? dias : 1;
    } catch {
      return 1;
    }
  };

  const diasTotales = calcularDiasRenta();

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
        <div className="p-8 space-y-6 overflow-y-auto print:overflow-visible print:p-0 font-sans text-slate-800 text-sm leading-relaxed">
          
          {/* Encabezado del Contrato Oficial (Visible siempre) */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">SU AUTO HONDURAS</h1>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mt-0.5">Contrato de Arrendamiento de Vehículo</p>
            <div className="flex justify-between items-center mt-3 text-xs font-mono text-slate-500 print:text-slate-900">
              <span>Nº REFERENCIA: {rental.id?.substring(0, 8).toUpperCase() || 'WEB-TEMP'}</span>
              <span>FECHA EMISIÓN: {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('es-HN') : 'N/A'}</span>
            </div>
          </div>

          {/* TEXTO LEGAL OFICIAL CON RELLENO DINÁMICO */}
          <div className="text-justify space-y-4 text-slate-900 print:text-black">
            <p className="font-bold text-center border-b border-slate-200 pb-2">
              CONTRATO DE ARRENDAMIENTO SU AUTO HONDURAS RENT A CAR
            </p>
            
            <p>
              Conste por el presente documento, el Contrato Abierto de Arrendamiento de Vehículos que celebran, de una parte, 
              Yo, <strong>Luis Antonio Herrador</strong> en representación de <strong>Su Auto Honduras S de RL</strong>, 
              con domicilio en el Barrio Guamilito 2da, Calle, 8 y 9 avenida en San Pedro Sula, con identidad 0501 1980 09066, 
              mayor de edad, casado, profesión: Licenciado en Mercadotecnia (en adelante, &quot;EL ARRENDADOR&quot;) y la otra parte 
              (en adelante, &quot;EL ARRENDATARIO&quot;), identificado con Identidad No. <span className="underline font-bold">{rental.idNumber || '_______'}</span> debidamente 
              representada por <span className="underline font-bold">{rental.workPosition || 'Persona Natural'}</span> (cargo), <span className="underline font-bold">{rental.firstName} {rental.lastName}</span> (nombre), 
              con domicilio en: <span className="underline font-bold">{rental.address || '_______'}</span> en el departamento de Cortés, Honduras, en los términos y condiciones siguientes:
            </p>

            <p className="font-bold tracking-wide uppercase text-xs pt-1 border-b border-slate-200">DECLARACIONES</p>
            
            <p>
              I. Declara EL ARRENDADOR ser propietaria del automóvil (objeto de este contrato) con las siguientes características: <span className="underline font-bold uppercase">{rental.vehicleType || rental.vehicleName || 'Vehículo Web'}</span>
            </p>
            
            <p>
              II. Así mismo, EL ARRENDADOR manifiesta que el automóvil objeto presente es contratado por la compañía y/o persona: <span className="underline font-bold uppercase">{rental.workCompany || `${rental.firstName} ${rental.lastName}`}</span>
            </p>
            
            <p>
              III. Declara AL ARRENDATARIO que conoce las características y el estado actual del automóvil objeto de este contrato en razón de que lo ha revisado personalmente.
            </p>
            
            <p>
              Estando LAS PARTES de acuerdo en lo anteriormente descrito, así como conociendo el contenido de las declaraciones vertidas con anterioridad, las cuales ratifican por contener la verdad, y sin existir error, dolo, violencia, mala fe o vicio alguno en el consentimiento que pudieran invalidar el mismo, sirvan en someterse a las siguientes Cláusulas:
            </p>

            <p className="font-bold tracking-wide uppercase text-xs pt-1 border-b border-slate-200">CLÁUSULAS</p>

            <p>
              <strong>CLÁUSULA PRIMERA. OBJETO DEL CONTRATO E INFORMACIÓN DEL CLIENTE</strong><br />
              El presente contrato tiene por objeto, el arrendamiento del automóvil descrito en las declaraciones, para uso y goce temporal. Este activo tendrá monitoreo por GPS. El cliente deberá presentar los siguientes documentos: Cédula de Identidad vigente que establezca que la persona es mayor de 23 años; Licencia Nacional Vigente o del país origen; Pasaporte, en caso de ser extranjero.
            </p>

            <p>
              <strong>CLÁUSULA SEGUNDA. VIGENCIA DEL CONTRATO</strong><br />
              Las partes acuerdan que la duración del presente contrato será de: <span className="underline font-bold">{diasTotales}</span> días. En todo caso el contrato podrá ser prorrogado por acuerdo de las partes con una notificación previa por escrito, telefónico o medio digital con 24 horas de anticipación para verificar la disponibilidad del vehículo en renta.
            </p>

            <p>
              <strong>CLÁUSULA TERCERA. ENTREGA Y DEVOLUCIÓN DEL BIEN ARRENDADO.</strong><br />
              A más tardar el día acordado, EL ARRENDADOR deberá hacer entrega a AL ARRENDATARIO del automóvil objeto de este contrato, así como de las llaves, boleta de revisión y/o controles o dispositivos, nivel de combustible correcto, además de las herramientas que sea necesaria para el funcionamiento del automóvil. Por la pérdida de las llaves se cobrará un recargo de $250.00 (O su equivalente en moneda nacional).<br />
              Una vez terminado el contrato, EL ARRENDATARIO deberá hacer la devolución correspondiente del depósito dejado en garantía a EL ARRENDADOR del automóvil objeto de este contrato en el siguiente domicilio: Barrio Guamilito 2 calle NO, 8 y 9 avenida, o dirección previamente acordada por ambas partes. La devolución del automóvil se realizará en el mismo estado en el que haya sido entregado, salvo el desgaste normal y natural del mismo; exceptuando los desgastes mecánicos generados por una mala operación en el vehículo.
            </p>

            <p>
              <strong>CLÁUSULA CUARTA. RENTA Y PAGO DE DEPÓSITO DE AUTOPROTECCIÓN</strong><br />
              Las PARTES en común acuerdo establecen que EL ARRENDATARIO pagará a EL ARRENDADOR una renta diaria por la cantidad de LPS (1000 LPS), cantidad que deberá ser pagada por adelantado. El pago se podrá realizar en efectivo, tarjeta de débito Y/O crédito y transferencia bancaria. El pago del depósito en autoprotección deberá ser en efectivo por adelantado y por un valor de $_______ ó (5,000 LPS). EL ARRENDADOR se encuentra obligado a emitir los recibos por los pagos realizados.
            </p>

            <p>
              <strong>CLÁUSULA QUINTA. OBLIGACIONES PARA LAS PARTES</strong><br />
              EL ARRENDATARIO se hace responsable de todo daño, perjuicio, lesión o muerte causada a tercero por conducción descuidada, culpable o dolosa. Se obliga al cumplimiento de las normas de tránsito, respondiendo personalmente por multas o indemnizaciones. Serán de cargo del ARRENDADOR los gastos producidos por su parte. El arrendatario no podrá efectuar en el vehículo ningún tipo de modificaciones o alteraciones.
            </p>

            <p>
              <strong>CLÁUSULA SEXTA. RETRASO EN EL INCUMPLIMIENTO DE CONTRATO</strong><br />
              En caso de que EL ARRENDATARIO no pueda realizar el pago de la renta deberá dar aviso a EL ARRENDADOR de forma inmediata.
            </p>

            <p>
              <strong>CLÁUSULA SÉPTIMA. INCUMPLIMIENTO DE CONTRATO</strong><br />
              Si EL ARRENDATARIO no devuelve voluntariamente el automóvil al término de la vigencia o no lo devuelve en las condiciones recibidas, dará motivos al pago de daños y perjuicios, que serán rebajados del depósito de autoprotección.
            </p>

            <p>
              <strong>CLÁUSULA OCTAVA. DE LOS ACCIDENTES.</strong><br />
              En caso de accidente, EL ARRENDATARIO deberá avisar de inmediato a EL ARRENDADOR, y estos avisaran a las compañías de seguros que correspondan y autoridades en un término no mayor a 2 horas.
            </p>

            <p>
              <strong>CLÁUSULA NOVENA. DEL ROBO.</strong><br />
              En caso de robo EL ARRENDADOR deberá dar parte a la aseguradora que corresponda según la unidad y a las autoridades correspondientes en un máximo de 5 horas.
            </p>

            <p>
              <strong>CLÁUSULA DÉCIMA. MODIFICACIONES DEL CONTRATO.</strong><br />
              Solo podrá ser modificado mediante convenio escrito firmado por LAS PARTES.
            </p>

            <p>
              <strong>CLÁUSULA DÉCIMA PRIMERA. COMUNICACIONES ENTRE LAS PARTES.</strong><br />
              Todo aviso o comunicación deberá realizarse por escrito en el domicilio señalado. Cambios de domicilio deben comunicarse 5 días antes; de lo contrario, deberá indemnizar por gastos extraordinarios para obtener el pago de renta o devolución del automóvil.
            </p>

            <p>
              <strong>CLÁUSULA DÉCIMA SEGUNDA. DEROGACIÓN DE ACUERDOS ANTERIORES.</strong><br />
              Este contrato constituye el acuerdo total entre las partes, dejando sin efecto cualquier negociación previa.
            </p>

            <p>
              <strong>CLÁUSULA DÉCIMA TERCERA. PROHIBICIONES</strong><br />
              No se permite fumar dentro de las unidades; de lo contrario tendrán un recargo de $300.00. El automóvil sólo podrá ser conducido por la persona registrada en el contrato. No se permite el uso de vehículo para acarreo o transporte de sustancias ilícitas o peligrosas.
            </p>

            <p>
              <strong>CLÁUSULA DÉCIMA CUARTA. SOLUCIÓN DE CONFLICTOS Y LEGISLACIÓN APLICABLE</strong><br />
              Cualquier controversia se someterá al Centro de Conciliación y Arbitraje de la Cámara de Comercio e Industrias de Cortés. En caso de accidente de tránsito el deducible será de Lps. 6,000. En caso de pérdida total el Coseguro es de Lps. 25,000.
            </p>
          </div>

          {/* Bloque 6: Área de Firmas Autógrafas */}
          <div className="grid grid-cols-2 gap-12 pt-8 mt-6 border-t border-dashed border-slate-300 print:border-slate-400">
            {/* Firma Cliente Digitalizada */}
            <div className="text-center space-y-1">
              <div className="h-16 flex items-center justify-center border-b border-slate-300 mx-auto max-w-[220px]">
                {rental.signatureImgUrl ? (
                  <img src={rental.signatureImgUrl} alt="Firma Cliente" className="max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-300 italic print:hidden">Firma física requerida</span>
                )}
              </div>
              <span className="block text-xs font-bold text-slate-800 uppercase">Firma del Arrendatario</span>
              <span className="block text-[10px] text-slate-400 text-center">ID: {rental.idNumber || '_______'}</span>
            </div>

            {/* Firma Administrador */}
            <div className="text-center space-y-1">
              <div className="h-16 flex items-center justify-center border-b border-slate-300 mx-auto max-w-[220px]">
                <span className="text-xs text-slate-300 italic print:hidden">Sello Autorizado</span>
              </div>
              <span className="block text-xs font-bold text-slate-800 uppercase">Por: SU AUTO HONDURAS</span>
              <span className="block text-[10px] text-slate-400 text-center">Firma Administrador</span>
            </div>
          </div>

          {/* Galería de Documentos Adjuntos (Se oculta al imprimir) */}
          {(rental.licenseImgUrl || rental.idImgUrl || rental.selfieImgUrl) && (
            <div className="border-t border-slate-200 pt-4 mt-6 print:hidden">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imágenes de Soporte</h4>
              <div className="grid grid-cols-3 gap-3">
                {rental.licenseImgUrl && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Licencia</span>
                    <a href={rental.licenseImgUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-50">
                      <img src={rental.licenseImgUrl} alt="Licencia" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
                {rental.idImgUrl && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Identificación</span>
                    <a href={rental.idImgUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-50">
                      <img src={rental.idImgUrl} alt="ID" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
                {rental.selfieImgUrl && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Selfie Validación</span>
                    <a href={rental.selfieImgUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-50">
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
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          div {
            overflow: visible !important;
            max-h: none !important;
          }
        }
      `}</style>

    </div>
  );
}