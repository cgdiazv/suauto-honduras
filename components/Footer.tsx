'use client';

import { useLanguage } from '@/context/LanguageContext'; // 🔑 Importamos el contexto bilingüe
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage(); // 🔤 Obtenemos las traducciones del contexto

  return (
    <footer className="border-t border-slate-200 bg-white">
      {/* Google Play Store Download Link */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="flex justify-center">
          <a
            href="https://play.google.com/store/apps/details?id=com.indevasa.suauto&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-14 w-auto"
            />
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-center md:text-left text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {t.footer.rights}
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-slate-400">
          <Link href="/politica-de-privacidad" className="hover:text-slate-500">
            {t.footer.links.privacy}
          </Link>
          <Link href="/terminos-y-condiciones" className="hover:text-slate-500">
            {t.footer.links.terms}
          </Link>
          <Link href="/contacto" className="hover:text-slate-500">
            {t.footer.links.support}
          </Link>
          <span>
            Powered by{' '}
            <a href="https://indevasa.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-slate-500">
              Indeva Websites
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}