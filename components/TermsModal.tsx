'use client';

import { X, FileText, ShieldCheck, Scale, Ban, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const { t } = useLanguage();
  const terms = t.terms;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-700" />
            <div>
              <p className="text-sm font-bold text-slate-900">{terms?.title || 'Términos y Condiciones'}</p>
              <p className="text-xs text-slate-500">{terms?.lastUpdated || ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6 text-sm text-slate-700 leading-7">
          {terms?.introduction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Info className="w-4 h-4" />
                <span>{terms?.title || 'Introducción'}</span>
              </div>
              <p>{terms.introduction}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{terms?.sections?.responsibilityTitle || 'Responsabilidad de Datos'}</span>
              </div>
              <p>{terms?.sections?.responsibilityContent1}</p>
              <p>{terms?.sections?.responsibilityContent2}</p>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <Scale className="w-4 h-4" />
                <span>{terms?.sections?.scopeTitle || 'Alcance de las ofertas'}</span>
              </div>
              <p>{terms?.sections?.scopeContent}</p>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <Ban className="w-4 h-4" />
                <span>{terms?.sections?.restrictionsTitle || 'Restricciones de Uso'}</span>
              </div>
              <p>{terms?.sections?.restrictionsContent}</p>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <Scale className="w-4 h-4" />
                <span>{terms?.sections?.jurisdictionTitle || 'Jurisdicción Aplicable'}</span>
              </div>
              <p>{terms?.sections?.jurisdictionContent}</p>
            </div>
          </div>

          {terms?.sections?.objectTitle && terms?.sections?.objectContent && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{terms.sections.objectTitle}</h3>
              <p className="mt-2 text-slate-700">{terms.sections.objectContent}</p>
            </div>
          )}

          {terms?.sections?.signatureTitle && terms?.sections?.signatureContent && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{terms.sections.signatureTitle}</h3>
              <p className="mt-2 text-slate-700">{terms.sections.signatureContent}</p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-sm font-semibold text-slate-900">{terms?.questions}</p>
            <p className="mt-1 text-slate-700 text-xs">{terms?.questionsSub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
