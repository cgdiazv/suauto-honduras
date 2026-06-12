'use client';

import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto bilingüe
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage(); // 🔤 Obtenemos las traducciones del contexto

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {t.footer.rights}
        </p>
        <div className="flex space-x-6 text-sm text-slate-400">
          <Link href="/politica-de-privacidad" className="hover:text-slate-500">
            {t.footer.links.privacy}
          </Link>
          <Link href="/terminos-y-condiciones" className="hover:text-slate-500">
            {t.footer.links.terms}
          </Link>
          <Link href="/contacto" className="hover:text-slate-500">
            {t.footer.links.support}
          </Link>
        </div>
      </div>
    </footer>
  );
}