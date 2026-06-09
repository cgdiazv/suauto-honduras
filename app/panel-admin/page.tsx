// src/app/panel-admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Vehicle } from '@/types/vehicle';

const ADMIN_EMAIL = "contacto@suautohonduras.com";

// 🚗 Diccionario de Marcas Populares y sus Modelos correspondientes
const MAPA_MARCAS_MODELOS: { [key: string]: string[] } = {
  "Toyota": ["Corolla", "Yaris", "Hilux", "Rav4", "Land Cruiser", "Prado", "Tacoma", "Tundra", "4Runner", "Sienna", "Prius"],
  "Ford": ["F-150", "Ranger", "Escape", "Explorer", "Edge", "Focus", "Fiesta", "Mustang", "EcoSport", "Everest"],
  "Honda": ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Fit", "Ridgeline"],
  "Hyundai": ["Elantra", "Accent", "Santa Fe", "Tucson", "Creta", "Kona", "H-1", "Palisade"],
  "Kia": ["Picanto", "Rio", "Cerato", "Sportage", "Sorento", "Soul", "K2700", "Seltos"],
  "Nissan": ["Frontier", "Navara", "Sentra", "Versa", "March", "Kicks", "X-Trail", "Pathfinder", "Patrol"],
  "Mitsubishi": ["L200", "Montero", "Outlander", "ASX", "Mirage", "Sportero"],
  "Mazda": ["Mazda 2", "Mazda 3", "Mazda 6", "CX-3", "CX-5", "CX-9", "BT-50"],
  "Chevrolet": ["Colorado", "Silverado", "Spark", "Aveo", "Cruze", "Captiva", "Tracker", "Tahoe"],
  "Jeep": ["Grand Cherokee", "Cherokee", "Wrangler", "Compass", "Renegade"],
  "Suzuki": ["Grand Vitara", "Vitara", "Jimny", "Swift", "Alto", "Celerio"],
  "Isuzu": ["D-Max", "Mu-X"],
  "BMW": ["Serie 3", "Serie 5", "X1", "X3", "X5"],
  "Mercedes-Benz": ["Clase C", "Clase E", "GLA", "GLC", "GLE"],
  "Hino": ["Dutro", "300", "500"],
  "Isla de Opciones (Otra)": ["Otro Modelo"]
};

const OPCIONES_MARCAS = Object.keys(MAPA_MARCAS_MODELOS);

// Catálogos de Opciones para Checkboxes
const OPCIONES_TIPOS = ["Bicicleta", "Camión", "Convertible", "Coupé", "Cuatrimoto", "Deportivo", "Hatchback", "Minivan/Van", "Motocicleta", "Panel", "Pickup", "SUV/Camioneta", "Todo Terreno", "Turismo"];
const OPCIONES_EXTRAS = ["Botagua", "Parrilla de Techo", "Remolque", "Defensa delantera", "Gradas laterales"];
const OPCIONES_SEGURIDAD = ["Bolsas de Aire", "Frenos ABS", "Frenos EBD"];
const OPCIONES_INTERIOR = ["Aire Acondicionado", "Asientos de cuero", "Asientos de tela", "Cámara de reversa", "Radio CD", "Radio Pantalla Táctil", "Vidrios Eléctricos", "Cierres eléctricos", "3 Filas de asientos"];
const OPCIONES_EXTERIOR = ["Copas de lujo", "Rines de lujo", "Halógenas", "Quemacocos"];
const OPCIONES_CONDICIONES = ["Chocado", "Nuevo", "Usado de Agencia", "Usado Importado"];
const OPCIONES_COLORES = ["Amarillo", "Azul", "Beige", "Blanco", "Café", "Dorado", "Gris", "Naranja", "Negro", "Plateado", "Rojo", "Turquesa", "Verde", "Vino", "Violeta"];
const OPCIONES_COMBUSTIBLES = ["Biodiésel", "Diésel", "Gas", "Gasolina", "Híbrido", "Hidrógeno", "Eléctrico"];
const OPCIONES_TRANSMISIONES = ["Automático", "Automático 4x2", "Automático 4x4", "Manual", "Manual 4x2", "Manual 4x4", "Triptonic"];

export default function PanelAdminPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Estados del Inventario
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Estados de los Campos del Formulario
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState(OPCIONES_MARCAS[0]);
  const [modelName, setModelName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  
  const [status, setStatus] = useState<'Disponible' | 'Reservado' | 'Vendido'>('Disponible');
  const [price, setPrice] = useState('');
  const [mileageValue, setMileageValue] = useState(0);
  const [mileageUnit, setMileageUnit] = useState<'Km' | 'Millas'>('Km');
  const [engine, setEngine] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [salesAgent, setSalesAgent] = useState('');

  // 📸 Estados de URLs de Imágenes Finales (Firebase Storage)
  const [featuredImage, setFeaturedImage] = useState('');
  const [imgFrente, setImgFrente] = useState('');
  const [imgAtras, setImgAtras] = useState('');
  const [imgDerecha, setImgDerecha] = useState('');
  const [imgIzquierda, setImgIzquierda] = useState('');
  const [imgFrenteDerecha, setImgFrenteDerecha] = useState('');
  const [imgFrenteIzquierda, setImgFrenteIzquierda] = useState('');
  const [imgAtrasDerecha, setImgAtrasDerecha] = useState('');
  const [imgAtrasIzquierda, setImgAtrasIzquierda] = useState('');
  const [imgTablero, setImgTablero] = useState('');
  const [imgMotor, setImgMotor] = useState('');

  // Estados de Progreso de Carga Individual (%)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Estados para Checkboxes
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedSecurity, setSelectedSecurity] = useState<string[]>([]);
  const [selectedInterior, setSelectedInterior] = useState<string[]>([]);
  const [selectedExterior, setSelectedExterior] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);

  // 🔄 Efecto espejo para selectores anidados
  useEffect(() => {
    if (brand && MAPA_MARCAS_MODELOS[brand]) {
      setModelName(MAPA_MARCAS_MODELOS[brand][0] || '');
    }
  }, [brand]);

  // 🛡️ Filtro de seguridad estricto
  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login'); 
      } else {
        fetchInventory();
      }
    }
  }, [user, loading, router]);

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Vehicle[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Vehicle);
      });
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const uploadFileHandler = (file: File, fieldKey: string, setUrlState: (url: string) => void) => {
    if (!file) return;
    const fileName = `${Date.now()}_${fieldKey}_${file.name}`;
    const storageRef = ref(storage, `vehicles/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress((prev) => ({ ...prev, [fieldKey]: progress }));
      },
      (error) => {
        console.error(error);
        alert(`Error al subir imagen`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrlState(downloadURL);
        });
      }
    );
  };

  const handleCheckboxChange = (option: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (state.includes(option)) {
      setState(state.filter(item => item !== option));
    } else {
      setState([...state, option]);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const fallbackImg = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600';
    const marcaFinal = brand === "Isla de Opciones (Otra)" ? customBrand.trim() : brand;
    const modeloFinal = modelName === "Otro Modelo" ? customModel.trim() : modelName;

    const completeVehicle: Vehicle = {
      title,
      featuredImage: featuredImage || fallbackImg,
      brand: marcaFinal || "Genérica",
      modelName: modeloFinal || "Genérico",
      types: selectedTypes,
      status,
      galleryImages: {
        frente: imgFrente || fallbackImg,
        atras: imgAtras || fallbackImg,
        derecha: imgDerecha || fallbackImg,
        izquierda: imgIzquierda || fallbackImg,
        frenteDerecha: imgFrenteDerecha || fallbackImg,
        frenteIzquierda: imgFrenteIzquierda || fallbackImg,
        atrasDerecha: imgAtrasDerecha || fallbackImg,
        atrasIzquierda: imgAtrasIzquierda || fallbackImg,
        tablero: imgTablero || fallbackImg,
        motor: imgMotor || fallbackImg,
      },
      price,
      mileage: { value: Number(mileageValue), unit: mileageUnit },
      engine,
      countryOfOrigin,
      year: Number(year),
      salesAgent,
      extras: selectedExtras,
      security: selectedSecurity,
      interiorFeatures: selectedInterior,
      exteriorFeatures: selectedExterior,
      conditions: selectedConditions,
      colors: selectedColors,
      fuels: selectedFuels,
      transmissions: selectedTransmissions,
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'vehicles'), completeVehicle);
      setShowAddForm(false);
      
      // Limpiar todo el estado
      setTitle(''); setBrand(OPCIONES_MARCAS[0]); setCustomBrand(''); setCustomModel('');
      setPrice(''); setMileageValue(0); setEngine(''); setCountryOfOrigin(''); setSalesAgent('');
      setFeaturedImage(''); setImgFrente(''); setImgAtras(''); setImgDerecha(''); setImgIzquierda('');
      setImgFrenteDerecha(''); setImgFrenteIzquierda(''); setImgAtrasDerecha(''); setImgAtrasIzquierda('');
      setImgTablero(''); setImgMotor(''); setUploadProgress({});
      setSelectedTypes([]); setSelectedExtras([]); setSelectedSecurity([]);
      setSelectedInterior([]); setSelectedExterior([]); setSelectedConditions([]);
      setSelectedColors([]); setSelectedFuels([]); setSelectedTransmissions([]);
      
      alert("¡Vehículo agregado con éxito!");
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el vehículo.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      try {
        await deleteDoc(doc(db, 'vehicles', id));
        fetchInventory();
      } catch (err) {
        console.error(err);
        alert("No se pudo borrar el registro.");
      }
    }
  };

  const renderMediaField = (label: string, fieldKey: string, currentUrl: string, setUrlState: (url: string) => void) => {
    const progress = uploadProgress[fieldKey] || 0;
    return (
      <div className="flex flex-col space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {currentUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-white">
            <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
            <button 
              type="button" 
              onClick={() => { setUrlState(''); setUploadProgress(prev => ({ ...prev, [fieldKey]: 0 })); }}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] hover:bg-red-700 font-bold px-2"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => { if(e.target.files?.[0]) uploadFileHandler(e.target.files[0], fieldKey, setUrlState); }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
            />
            <span className="text-xs font-semibold text-blue-600">📸 Cargar Foto</span>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="p-12 text-center text-slate-500 text-sm">Verificando credenciales de acceso...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Barra de Menú */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Panel de Administración</h1>
          <p className="text-sm text-slate-500">Gestión de stock de Su Auto Honduras</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddForm(!showAddForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            {showAddForm ? 'Ver Lista de Inventario' : '➕ Agregar Vehículo'}
          </button>
          <button onClick={async () => { await logout(); router.push('/login'); }} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddVehicle} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-8">
          
          {/* SECCIÓN 1: GENERAL */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-900 border-b pb-2">1. Información del Post</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título o Nombre del Post</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" placeholder="Ej. Ford F-150 Lariat 2023 Impecable" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Estatus</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50">
                  <option value="Disponible">Disponible</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>
              <div className="md:col-span-3">
                {renderMediaField("Imagen Destacada (Miniatura de Listado)", "featuredImage", featuredImage, setFeaturedImage)}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: SPECIFIC SELECTORS */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-900 border-b pb-2">2. Especificaciones Técnicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Marca</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-900">
                  {OPCIONES_MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Modelo</label>
                <select value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50 font-medium text-slate-900">
                  {MAPA_MARCAS_MODELOS[brand]?.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                  <option value="Otro Modelo">-- Otro Modelo (Escribir) --</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año de Fabricación</label>
                <input type="number" required value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" />
              </div>

              {brand === "Isla de Opciones (Otra)" && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Escriba la Marca Nueva</label>
                  <input type="text" required value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} className="w-full rounded-lg border border-red-200 p-2.5 text-sm bg-red-50/30" placeholder="Ej. Hummer" />
                </div>
              )}
              {modelName === "Otro Modelo" && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Escriba el Modelo Nuevo</label>
                  <input type="text" required value={customModel} onChange={(e) => setCustomModel(e.target.value)} className="w-full rounded-lg border border-red-200 p-2.5 text-sm bg-red-50/30" placeholder="Ej. Raptor" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                <input type="text" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" placeholder="Ej. L. 135,000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motor (Cilindraje)</label>
                <input type="text" required value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" placeholder="Ej. V6 3.5L" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">País de Origen</label>
                <input type="text" required value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" placeholder="Ej. Estados Unidos" />
              </div>
              <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Millaje</label>
                  <input type="number" required value={mileageValue} onChange={(e) => setMileageValue(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                  <select value={mileageUnit} onChange={(e) => setMileageUnit(e.target.value as any)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50">
                    <option value="Km">Km</option>
                    <option value="Millas">Millas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asesor de Ventas</label>
                <input type="text" required value={salesAgent} onChange={(e) => setSalesAgent(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-slate-50" placeholder="Nombre de Asesor" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: GALERÍA DE LOS 10 ÁNGULOS */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-900 border-b pb-2">3. Galería de Fotos Profesional (Los 10 Ángulos Esenciales)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {renderMediaField("1. Frente", "frente", imgFrente, setImgFrente)}
              {renderMediaField("2. Atrás", "atras", imgAtras, setImgAtras)}
              {renderMediaField("3. Derecha", "derecha", imgDerecha, setImgDerecha)}
              {renderMediaField("4. Izquierda", "izquierda", imgIzquierda, setImgIzquierda)}
              {renderMediaField("5. Frente-Derecha", "frenteDerecha", imgFrenteDerecha, setImgFrenteDerecha)}
              {renderMediaField("6. Frente-Izquierda", "frenteIzquierda", imgFrenteIzquierda, setImgFrenteIzquierda)}
              {renderMediaField("7. Atrás-Derecha", "atrasDerecha", imgAtrasDerecha, setImgAtrasDerecha)}
              {renderMediaField("8. Atrás-Izquierda", "atrasIzquierda", imgAtrasIzquierda, setImgAtrasIzquierda)}
              {renderMediaField("9. Tablero", "tablero", imgTablero, setImgTablero)}
              {renderMediaField("10. Motor", "motor", imgMotor, setImgMotor)}
            </div>
          </div>

          {/* SECCIÓN 4: CHECKBOXES */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-blue-900 border-b pb-2">4. Detalles de Equipamiento</h2>
            
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Tipo de Vehículo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {OPCIONES_TIPOS.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedTypes.includes(o)} onChange={() => handleCheckboxChange(o, selectedTypes, setSelectedTypes)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Condiciones</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPCIONES_CONDICIONES.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedConditions.includes(o)} onChange={() => handleCheckboxChange(o, selectedConditions, setSelectedConditions)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Combustible</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPCIONES_COMBUSTIBLES.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedFuels.includes(o)} onChange={() => handleCheckboxChange(o, selectedFuels, setSelectedFuels)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Transmisión</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPCIONES_TRANSMISIONES.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedTransmissions.includes(o)} onChange={() => handleCheckboxChange(o, selectedTransmissions, setSelectedTransmissions)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Color</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {OPCIONES_COLORES.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedColors.includes(o)} onChange={() => handleCheckboxChange(o, selectedColors, setSelectedColors)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Extras</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OPCIONES_EXTRAS.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedExtras.includes(o)} onChange={() => handleCheckboxChange(o, selectedExtras, setSelectedExtras)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Seguridad</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OPCIONES_SEGURIDAD.map(o => (
                  <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                    <input type="checkbox" checked={selectedSecurity.includes(o)} onChange={() => handleCheckboxChange(o, selectedSecurity, setSelectedSecurity)} className="rounded text-blue-600 h-4 w-4" />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Características del Interior</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OPCIONES_INTERIOR.map(o => (
                    <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                      <input type="checkbox" checked={selectedInterior.includes(o)} onChange={() => handleCheckboxChange(o, selectedInterior, setSelectedInterior)} className="rounded text-blue-600 h-4 w-4" />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Características del Exterior</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OPCIONES_EXTERIOR.map(o => (
                    <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer">
                      <input type="checkbox" checked={selectedExterior.includes(o)} onChange={() => handleCheckboxChange(o, selectedExterior, setSelectedExterior)} className="rounded text-blue-600 h-4 w-4" />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={formSubmitting} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white">{formSubmitting ? 'Publicando...' : 'Publicar Vehículo'}</button>
          </div>
        </form>
      ) : (
        /* TABLA DE INVENTARIO */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loadingInventory ? (
            <div className="p-12 text-center text-slate-500 text-sm">Cargando inventario...</div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No hay vehículos registrados aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th className="p-4">Vehículo</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/50">
                      <td className="p-4 flex items-center gap-3">
                        {car.featuredImage && (
                          <img src={car.featuredImage} alt="" className="w-12 h-12 object-cover rounded-md bg-slate-100 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{car.title || `${car.brand} ${car.modelName}`}</div>
                          <div className="text-xs text-slate-400">Año {car.year} • Asesor: {car.salesAgent || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-blue-900">{car.price}</td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full">{car.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteVehicle(car.id!)} className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}