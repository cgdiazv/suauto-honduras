// app/politica-de-privacidad/page.tsx
import Link from 'next/link';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad - Su Auto Honduras',
  description: 'Conozca nuestras políticas de tratamiento de datos, confidencialidad y seguridad de la información de acuerdo a la legislación vigente.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-slate-700 antialiased">
      
      {/* Encabezado de la Página */}
      <div className="text-center mb-10 space-y-2 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl uppercase">
          Política de Privacidad
        </h1>
        <p className="text-sm text-slate-500">
          Última actualización: Junio 2026
        </p>
      </div>

      {/* Bloque Legal Principal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-sm sm:text-base leading-relaxed text-justify">
        
        {/* Párrafo 1: IAIP */}
        <p>
          En cumplimiento de la Ley del Instituto de Acceso a la Información Pública, Decreto Legislativo No. 170 – 2006, 
          <strong className="text-slate-900"> Su Auto Honduras</strong> (en adelante la empresa) cumple estrictamente con todas las medidas necesarias para garantizar la seguridad, integridad y privacidad de los datos aportados a través de los formularios de recogida de datos insertados en el sitio de internet <span className="text-blue-600 font-medium">www.suautohn.com</span> (en adelante el sitio).
        </p>

        {/* Párrafo 2: Uso de datos */}
        <p>
          Los datos personales introducidos libremente por el cliente (en adelante el usuario) en los formularios del sitio son empleados única y exclusivamente por la empresa para realizar sus labores de gestión administrativa, técnica, y comercial. En ningún caso se cederán datos personales de nuestros clientes a terceros ajenos a la empresa sin consentimiento expreso del afectado. La empresa se compromete a cancelar los datos personales recabados cuando hayan dejado de ser necesarios o pertinentes para la finalidad para la cual fueron recogidos.
        </p>

        {/* Párrafo 3: Cesión de datos */}
        <p>
          La empresa accederá a la cesión de datos únicamente cuando ello implique una necesidad para poder prestar a sus clientes los servicios contratados, cediendo estos únicamente a aquellas entidades y organismos que se encuentren íntima y necesariamente ligados con la prestación de los distintos servicios que se ofrecen en el sitio, trabajadores o colaboradores de la empresa y compañías o firmas profesionales que colaboren o ayuden en temas económicos, administrativos, legales, fiscales o financieros.
        </p>

        {/* Párrafo 4: Personal autorizado */}
        <p>
          El acceso del personal autorizado de la empresa a los datos de clientes se realiza de forma controlada y jerárquica, según la política interna de acceso y tratamiento de los datos de clientes.
        </p>

        {/* Párrafo 5: ARCO */}
        <p>
          El usuario que introduzca sus datos personales en los distintos formularios de alta del sitio tendrá plena capacidad para ejercitar sus derechos de acceso, rectificación, cancelación y oposición en cualquier momento solicitándolo a la empresa, de acuerdo con lo previsto en la citada ley.
        </p>

        {/* Destacado / Advertencia de Seguridad */}
        <div className="bg-slate-50 border-l-4 border-blue-900 p-4 rounded-r-xl space-y-2 my-6 text-left">
          <span className="text-xs font-black tracking-wider text-blue-900 uppercase flex items-center gap-1.5"><Lock className="w-4 h-4" /> Cifrado y Responsabilidad de Seguridad</span>
          <p className="text-xs sm:text-sm text-slate-600">
            La transmisión de los datos se efectúa de forma encriptada bajo una conexión segura; la empresa asegura la absoluta confidencialidad y privacidad de los datos personales recogidos y por ello se han adoptado medidas esenciales de seguridad para evitar la alteración, pérdida, tratamiento o acceso no autorizado y garantizar así su integridad y seguridad.
          </p>
          <p className="text-xs sm:text-sm text-slate-600">
            Sin embargo, la empresa no garantiza que terceros no autorizados que realicen cualquier tipo de ataque al sistema puedan tener conocimiento de las características del uso que los usuarios hacen del sitio. Por ello, la empresa no será en ningún caso responsable de las incidencias que puedan surgir en torno a los datos personales cuando se deriven bien de un ataque o acceso no autorizado a los sistemas del sitio, de tal forma que sea imposible detectarlo por las actuales medidas de seguridad o bien cuando se deba a una falta de diligencia del usuario en cuanto a la guardia y custodia de sus claves de acceso o de sus propios datos personales.
          </p>
        </div>

        {/* Párrafo 7: Veracidad de la información */}
        <p>
          La información facilitada por el usuario deberá ser veraz. A estos efectos, el usuario garantiza la autenticidad de todos aquellos datos que comunique como consecuencia de la cumplimentación de los formularios necesarios para la contratación de los Servicios. Igualmente, será responsabilidad del usuario mantener dicha información permanentemente actualizada para que responda, en cada momento, a la situación real del usuario. El usuario será el único responsable de las manifestaciones falsas o inexactas que realice y de los perjuicios que cause a la empresa o a terceros por la información que facilite.
        </p>

        {/* Párrafo 8: Propiedad Intelectual */}
        <p>
          La empresa prohíbe expresamente la reproducción, distribución, comunicación pública, transformación total o parcial, o cualquier otra actividad que se pueda realizar con los contenidos y/o el software del sitio ni aun citando las fuentes, salvo consentimiento por escrito de la empresa.
        </p>

        {/* Párrafo 9: Jurisdicción */}
        <p>
          La resolución de cualquier conflicto, controversia o reclamación derivada de la utilización del sitio, su contenido, o cualquiera de los productos y/o servicios en el ofrecidos, está sometida a la legislación vigente.
        </p>

        {/* Caja de Contacto Directo */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">¿Tiene consultas de privacidad?</h4>
            <p className="text-xs text-slate-400 mt-0.5">Nuestro canal legal se encuentra a su disposición permanente.</p>
          </div>
          <a 
            href="mailto:contacto@suautohonduras.com" 
            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs sm:text-sm px-4 py-2.5 transition flex items-center gap-2 border border-blue-200/40"
          >
            <Mail className="w-4 h-4" /> contacto@suautohonduras.com
          </a>
        </div>

      </div>

      {/* Enlace de regreso al Home */}
      <div className="text-center mt-8">
        <Link 
          href="/" 
          className="text-xs font-bold text-slate-400 hover:text-blue-900 transition flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la Página Principal
        </Link>
      </div>

    </div>
  );
}