// app/terminos-y-condiciones/page.tsx
import Link from 'next/link';
import { ShieldCheck, Scale, FileText, Ban } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones - Su Auto Honduras',
  description: 'Conozca las condiciones de uso, responsabilidades y regulaciones legales que rigen al utilizar nuestra plataforma digital.',
};

export default function TerminosCondicionesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-slate-700 antialiased">
      
      {/* Encabezado Principal */}
      <div className="text-center mb-12 space-y-2 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl uppercase">
          Términos y Condiciones
        </h1>
        <p className="text-sm text-slate-500">
          Última actualización: Junio 2026
        </p>
      </div>

      {/* Contenedor del Marco Legal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base leading-relaxed text-justify">
        
        {/* Introducción */}
        <p>
          El presente documento establece los términos y condiciones de uso (en adelante los &ldquo;Términos&rdquo;) que regulan el acceso y utilización del sitio web <span className="text-blue-600 font-medium">www.suautohn.com</span> (en adelante el &ldquo;Sitio&rdquo;), de la cual es titular <strong className="text-slate-900">Su Auto Honduras</strong> (en adelante la &ldquo;Empresa&rdquo;). Al navegar por el Sitio y hacer uso de nuestros servicios de catálogo, tasación externa o solicitudes de renta, usted (en adelante el &ldquo;Usuario&rdquo;) acepta de manera expresa y sin reservas estos Términos en su totalidad.
        </p>

        {/* 1. Objeto de la Plataforma */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-900 flex-shrink-0" /> 1. Objeto del Sitio Web
          </h2>
          <p>
            El Sitio tiene como finalidad principal ofrecer un escaparate virtual del inventario de vehículos disponibles para venta y opciones de arrendamiento (renta) en San Pedro Sula, así como proveer herramientas digitales interactivas para que los Usuarios envíen propuestas de tasación (&ldquo;Vender Vehículo&rdquo;) o gestionen pre-reservas de alquiler (&ldquo;Rentar Vehículo&rdquo;).
          </p>
        </div>

        {/* 2. Veracidad de la Información y Datos Adjuntos */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900 flex-shrink-0" /> 2. Responsabilidad de Datos y Documentación
          </h2>
          <p>
            El Usuario se compromete a que toda la información que facilite a través de los formularios del Sitio (nombres, identificaciones, números de teléfono, estado mecánico de autos y precios pretendidos) sea verídica, exacta y actualizada. 
          </p>
          <p>
            Para los módulos de Renta de Vehículos, el Usuario garantiza la autenticidad e integridad de las imágenes de licencias de conducir, tarjetas de identidad o pasaportes adjuntados, eximiendo por completo a la Empresa de cualquier responsabilidad derivada del uso de documentación falsa, alterada o perteneciente a terceros.
          </p>
        </div>

        {/* Cita Destacada: Validez de Firma Digital */}
        <div className="bg-slate-50 border-l-4 border-blue-950 p-4 rounded-r-xl my-4 text-left">
          <span className="text-xs font-black tracking-wider text-blue-950 uppercase block mb-1">🖋️ Validez de la Firma Digital</span>
          <p className="text-xs sm:text-sm text-slate-600">
            Al trazar su firma manual sobre el lienzo digital (canvas) dispuesto en el formulario de renta, el Usuario reconoce y acepta que este acto constituye una firma electrónica con plena validez para manifestar su consentimiento y conformidad con la solicitud de pre-reserva, conforme a las normativas de comercio electrónico aplicables en el país.
          </p>
        </div>

        {/* 3. Condiciones Específicas para Tasación y Venta */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-900 flex-shrink-0" /> 3. Alcance de las Ofertas y Precios
          </h2>
          <p>
            Toda la información referente a precios, cuotas estimadas de financiamiento y características de equipamiento de los autos listados en el inventario está sujeta a cambios y variaciones sin previo aviso. Los datos mostrados en el Sitio son de carácter ilustrativo e Informativo; ninguna transacción de compra, venta o arrendamiento se considerará finalizada u obligatoria únicamente por el envío de un formulario en línea. Toda operación requiere de una inspección física presencial y la firma de contratos notariales en nuestra sede en San Pedro Sula.
          </p>
        </div>

        {/* 4. Propiedad Intelectual y Limitaciones */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Ban className="w-5 h-5 text-blue-900 flex-shrink-0" /> 4. Restricciones de Uso y Propiedad Intelectual
          </h2>
          <p>
            Queda expresamente prohibida la reproducción, copia, distribución, raspado de datos (scraping), transformación o comunicación pública de cualquier fragmento de software, logotipos, imágenes del stock o textos de este Sitio sin la autorización previa y por escrito de la Empresa. El Usuario se compromete a hacer un uso lícito y ético de la plataforma.
          </p>
        </div>

        {/* 5. Legislación y Resolución de Conflictos */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-900 flex-shrink-0" /> 5. Legislación Aplicable y Jurisdicción
          </h2>
          <p>
            Estos Términos se rigen e interpretan de acuerdo con las leyes vigentes de la República de Honduras. Cualquier disputa, reclamación o controversia que surja en relación con el uso de este Sitio, sus contenidos o los servicios digitales provistos será sometida a las autoridades competentes y a los tribunales de la ciudad de San Pedro Sula, Cortés.
          </p>
        </div>

        {/* Pie de Canales de Consulta */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">¿Dudas sobre nuestras condiciones?</h4>
            <p className="text-xs text-slate-400 mt-0.5">Ponte en contacto con nuestra área administrativa.</p>
          </div>
          <a 
            href="mailto:contacto@suautohonduras.com" 
            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs sm:text-sm px-4 py-2.5 transition border border-blue-200/40"
          >
            contacto@suautohonduras.com
          </a>
        </div>

      </div>

      {/* Regreso al Home */}
      <div className="text-center mt-8">
        <Link 
          href="/" 
          className="text-xs font-bold text-slate-400 hover:text-blue-900 transition flex items-center justify-center gap-1.5"
        >
          &larr; Volver a la Página Principal
        </Link>
      </div>

    </div>
  );
}