// src/components/AdminSettingsForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings, Save, Loader2, DollarSign, ShieldAlert, Users } from 'lucide-react';

interface GlobalSettings {
  rentaTarifaBase: number;
  rentaDepositoLps: number;
  deducibleAccidente: number;
  whatsappAsesorPrincipal: string;
  nombreAsesorPrincipal: string;
}

export default function AdminSettingsForm() {
  const [settings, setSettings] = useState<GlobalSettings>({
    rentaTarifaBase: 1000,
    rentaDepositoLps: 5000,
    deducibleAccidente: 6000,
    whatsappAsesorPrincipal: '50425700962',
    nombreAsesorPrincipal: 'Luis Antonio Herrador'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as GlobalSettings);
        }
      } catch (err) {
        console.error("Error al cargar configuraciones globales:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name.includes('whatsapp') || name.includes('nombre') ? value : parseInt(value) || 0
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Error al guardar configuraciones:", err);
      alert("No se pudieron guardar los ajustes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
        Cargando parámetros globales del sistema...
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveSettings} className="max-w-4xl mx-auto space-y-6">
      
      {/* 📊 PANEL 1: CONTROL DE VALORES DE ARRENDAMIENTO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <DollarSign className="w-4 h-4 text-blue-600" /> Parámetros Económicos de Alquiler
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Renta Diaria Base (LPS)</label>
            <input 
              type="number" 
              name="rentaTarifaBase" 
              value={settings.rentaTarifaBase} 
              onChange={handleInputChange} 
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Depósito Autoprotección (LPS)</label>
            <input 
              type="number" 
              name="rentaDepositoLps" 
              value={settings.rentaDepositoLps} 
              onChange={handleInputChange} 
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deducible por Accidente (LPS)</label>
            <input 
              type="number" 
              name="deducibleAccidente" 
              value={settings.deducibleAccidente} 
              onChange={handleInputChange} 
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 📊 PANEL 2: ASESOR PRINCIPAL Y ENLACES DE CONTACTO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Users className="w-4 h-4 text-blue-600" /> Atención al Cliente y WhatsApp
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Asesor Principal</label>
            <input 
              type="text" 
              name="nombreAsesorPrincipal" 
              value={settings.nombreAsesorPrincipal} 
              onChange={handleInputChange} 
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp del Asesor (Sin el símbolo +)</label>
            <input 
              type="text" 
              name="whatsappAsesorPrincipal" 
              value={settings.whatsappAsesorPrincipal} 
              onChange={handleInputChange} 
              placeholder="Ej. 50425700962"
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
            />
          </div>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN Y NOTIFICACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl">
        <div className="text-left">
          {success && (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
              ✓ Parámetros actualizados globalmente en la base de datos de Su Auto.
            </p>
          )}
          {!success && (
            <p className="text-[11px] text-slate-400 font-medium">
              Nota: Al guardar, las modificaciones impactarán inmediatamente las plantillas de contratos impresos y botones de redirección.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className={`w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
            saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando Cambios...</>
          ) : (
            <><Save className="w-3.5 h-3.5" /> Guardar Configuración</>
          )}
        </button>
      </div>

    </form>
  );
}