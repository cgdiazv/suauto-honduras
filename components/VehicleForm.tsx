'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Vehicle } from '@/types/vehicle';
import { Edit, Camera } from 'lucide-react';

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
const OPCIONES_TIPOS = ["Bicicleta", "Camión", "Convertible", "Coupé", "Cuatrimoto", "Deportivo", "Hatchback", "Minivan/Van", "Motocicleta", "Panel", "Pickup", "SUV/Camioneta", "Todo Terreno", "Turismo"];
const OPCIONES_EXTRAS = ["Botagua", "Parrilla de Techo", "Remolque", "Defensa delantera", "Gradas laterales"];
const OPCIONES_SEGURIDAD = ["Bolsas de Aire", "Frenos ABS", "Frenos EBD"];
const OPCIONES_INTERIOR = ["Aire Acondicionado", "Asientos de cuero", "Asientos de tela", "Cámara de reversa", "Radio CD", "Radio Pantalla Táctil", "Vidrios Eléctricos", "Cierres eléctricos", "3 Filas de asientos"];
const OPCIONES_EXTERIOR = ["Copas de lujo", "Rines de lujo", "Halógenas", "Quemacocos"];
const OPCIONES_CONDICIONES = ["Chocado", "Nuevo", "Usado de Agencia", "Usado Importado"];
const OPCIONES_COLORES = ["Amarillo", "Azul", "Beige", "Blanco", "Café", "Dorado", "Gris", "Naranja", "Negro", "Plateado", "Rojo", "Turquesa", "Verde", "Vino", "Violeta"];
const OPCIONES_COMBUSTIBLES = ["Biodiésel", "Diésel", "Gas", "Gasolina", "Híbrido", "Hidrógeno", "Eléctrico"];
const OPCIONES_TRANSMISIONES = ["Automático", "Automático 4x2", "Automático 4x4", "Manual", "Manual 4x2", "Manual 4x4", "Triptonic"];

interface VehicleFormProps {
  vehicleToEdit: Vehicle | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicleToEdit, onSaveSuccess, onCancel }: VehicleFormProps) {
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Estados del formulario
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

  // Multimedia
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
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Arrays de Opciones
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedSecurity, setSelectedSecurity] = useState<string[]>([]);
  const [selectedInterior, setSelectedInterior] = useState<string[]>([]);
  const [selectedExterior, setSelectedExterior] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (vehicleToEdit) {
      if (OPCIONES_MARCAS.includes(vehicleToEdit.brand)) {
        setBrand(vehicleToEdit.brand);
        setCustomBrand('');
      } else {
        setBrand("Isla de Opciones (Otra)");
        setCustomBrand(vehicleToEdit.brand);
      }

      setTitle(vehicleToEdit.title || '');
      setModelName(vehicleToEdit.modelName || '');
      setCustomModel('');
      setStatus((vehicleToEdit.status as 'Disponible' | 'Reservado' | 'Vendido') || 'Disponible');
      setPrice(vehicleToEdit.price || '');
      setMileageValue(vehicleToEdit.mileage?.value || 0);
      setMileageUnit((vehicleToEdit.mileage?.unit as 'Km' | 'Millas') || 'Km');
      setEngine(vehicleToEdit.engine || '');
      setCountryOfOrigin(vehicleToEdit.countryOfOrigin || '');
      setYear(vehicleToEdit.year || new Date().getFullYear());
      setSalesAgent(vehicleToEdit.salesAgent || '');

      setFeaturedImage(vehicleToEdit.featuredImage || '');
      setImgFrente(vehicleToEdit.galleryImages?.frente || '');
      setImgAtras(vehicleToEdit.galleryImages?.atras || '');
      setImgDerecha(vehicleToEdit.galleryImages?.derecha || '');
      setImgIzquierda(vehicleToEdit.galleryImages?.izquierda || '');
      setImgFrenteDerecha(vehicleToEdit.galleryImages?.frenteDerecha || '');
      setImgFrenteIzquierda(vehicleToEdit.galleryImages?.frenteIzquierda || '');
      setImgAtrasDerecha(vehicleToEdit.galleryImages?.atrasDerecha || '');
      setImgAtrasIzquierda(vehicleToEdit.galleryImages?.atrasIzquierda || '');
      setImgTablero(vehicleToEdit.galleryImages?.tablero || '');
      setImgMotor(vehicleToEdit.galleryImages?.motor || '');

      setSelectedTypes(vehicleToEdit.types || []);
      setSelectedExtras(vehicleToEdit.extras || []);
      setSelectedSecurity(vehicleToEdit.security || []);
      setSelectedInterior(vehicleToEdit.interiorFeatures || []);
      setSelectedExterior(vehicleToEdit.exteriorFeatures || []);
      setSelectedConditions(vehicleToEdit.conditions || []);
      setSelectedColors(vehicleToEdit.colors || []);
      setSelectedFuels(vehicleToEdit.fuels || []);
      setSelectedTransmissions(vehicleToEdit.transmissions || []);
    }
  }, [vehicleToEdit]);

  // Manejo de cambio de marca para los modelos
  useEffect(() => {
    if (!vehicleToEdit && brand && MAPA_MARCAS_MODELOS[brand]) {
      setModelName(MAPA_MARCAS_MODELOS[brand][0] || '');
    }
  }, [brand, vehicleToEdit]);

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
      (error) => console.error(error),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const fallbackImg = '/images/placeholder.jpg';
    const marcaFinal = brand === "Isla de Opciones (Otra)" ? customBrand.trim() : brand;
    const modeloFinal = modelName === "Otro Modelo" ? customModel.trim() : modelName;

    const payloadVehicle = {
      title,
      featuredImage: featuredImage || fallbackImg,
      brand: marcaFinal || "Genérica",
      modelName: modeloFinal || "Genérico",
      types: selectedTypes,
      status,
      galleryImages: {
        frente: imgFrente || '', atras: imgAtras || '', derecha: imgDerecha || '', izquierda: imgIzquierda || '',
        frenteDerecha: imgFrenteDerecha || '', frenteIzquierda: imgFrenteIzquierda || '',
        atrasDerecha: imgAtrasDerecha || '', atrasIzquierda: imgAtrasIzquierda || '',
        tablero: imgTablero || '', motor: imgMotor || '',
      },
      price,
      mileage: { value: Number(mileageValue), unit: mileageUnit },
      engine, countryOfOrigin, year: Number(year), salesAgent,
      extras: selectedExtras, security: selectedSecurity, interiorFeatures: selectedInterior,
      exteriorFeatures: selectedExterior, conditions: selectedConditions,
      colors: selectedColors, fuels: selectedFuels, transmissions: selectedTransmissions,
    };

    try {
      if (vehicleToEdit?.id) {
        const docRef = doc(db, 'vehicles', vehicleToEdit.id);
        await updateDoc(docRef, payloadVehicle);
        alert("¡Vehículo modificado con éxito!");
      } else {
        await addDoc(collection(db, 'vehicles'), { ...payloadVehicle, createdAt: Date.now() });
        alert("¡Vehículo agregado con éxito!");
      }
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      alert("Error al procesar la solicitud.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderMediaField = (label: string, fieldKey: string, currentUrl: string, setUrlState: (url: string) => void) => {
    const progress = uploadProgress[fieldKey] || 0;
    const isUploading = progress > 0 && !currentUrl;

    return (
      <div className="flex flex-col space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {currentUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-white">
            <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
            <button type="button" onClick={() => { setUrlState(''); setUploadProgress(prev => ({ ...prev, [fieldKey]: 0 })); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] px-2 font-bold hover:bg-red-700 transition shadow-xs">
              Quitar
            </button>
          </div>
        ) : isUploading ? (
          <div className="relative flex flex-col items-center justify-center border-2 border-blue-300 rounded-lg p-6 bg-blue-50/30 animate-pulse min-h-[100px]">
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">{progress === 100 ? '⏳ Procesando...' : '⏳ Subiendo...'}</span>
            <span className="text-lg font-black text-blue-900 mt-1">{progress}%</span>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-3 max-w-[180px]">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white hover:bg-slate-50 transition cursor-pointer min-h-[100px]">
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) { uploadFileHandler(e.target.files[0], fieldKey, setUrlState); e.target.value = ''; } }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5"><Camera className="w-4 h-4" /> Cargar Foto</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-xs max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Bloque 1 Form */}
      <div className="space-y-4">
        <h2 className="text-sm md:text-base font-bold text-blue-900 border-b pb-1.5 flex items-center gap-2">
          {vehicleToEdit ? <><Edit className="w-4 h-4" /> Editando Ficha</> : '1. Información del Post'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título del Post</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estatus</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'Disponible' | 'Reservado' | 'Vendido')} className="w-full rounded-lg border p-2 text-sm bg-slate-50">
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

      {/* Bloque 2 Form */}
      <div className="space-y-4">
        <h2 className="text-sm md:text-base font-bold text-blue-900 border-b pb-1.5">2. Especificaciones Técnicas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50 font-medium">
              {OPCIONES_MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo</label>
            <select value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50 font-medium">
              {MAPA_MARCAS_MODELOS[brand]?.map(mod => <option key={mod} value={mod}>{mod}</option>)}
              <option value="Otro Modelo">-- Otro Modelo --</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Año</label>
            <input type="number" required value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
          </div>

          {brand === "Isla de Opciones (Otra)" && (
            <div>
              <label className="block text-xs font-medium text-red-700 mb-1">Escriba Marca</label>
              <input type="text" required value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} className="w-full rounded-lg border border-red-200 p-2 text-sm bg-red-50/30" />
            </div>
          )}
          {modelName === "Otro Modelo" && (
            <div>
              <label className="block text-xs font-medium text-red-700 mb-1">Escriba Modelo</label>
              <input type="text" required value={customModel} onChange={(e) => setCustomModel(e.target.value)} className="w-full rounded-lg border border-red-200 p-2 text-sm bg-red-50/30" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Precio</label>
            <input type="text" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Motor</label>
            <input type="text" required value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Origen</label>
            <input type="text" required value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Millaje</label>
              <input type="number" required value={mileageValue} onChange={(e) => setMileageValue(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad</label>
              <select value={mileageUnit} onChange={(e) => setMileageUnit(e.target.value as 'Km' | 'Millas')} className="w-full rounded-lg border p-2 text-sm bg-slate-50">
                <option value="Km">Km</option>
                <option value="Millas">Millas</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Asesor</label>
            <input type="text" required value={salesAgent} onChange={(e) => setSalesAgent(e.target.value)} className="w-full rounded-lg border p-2 text-sm bg-slate-50" />
          </div>
        </div>
      </div>

      {/* Bloque 3 Form Galería adaptable a rejillas móviles */}
      <div className="space-y-4">
        <h2 className="text-sm md:text-base font-bold text-blue-900 border-b pb-1.5">3. Galería de Fotos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {renderMediaField("Frente", "frente", imgFrente, setImgFrente)}
          {renderMediaField("Atrás", "atras", imgAtras, setImgAtras)}
          {renderMediaField("Derecha", "derecha", imgDerecha, setImgDerecha)}
          {renderMediaField("Izquierda", "izquierda", imgIzquierda, setImgIzquierda)}
          {renderMediaField("Fr-Der", "frenteDerecha", imgFrenteDerecha, setImgFrenteDerecha)}
          {renderMediaField("Fr-Izq", "frenteIzquierda", imgFrenteIzquierda, setImgFrenteIzquierda)}
          {renderMediaField("At-Der", "atrasDerecha", imgAtrasDerecha, setImgAtrasDerecha)}
          {renderMediaField("At-Izq", "atrasIzquierda", imgAtrasIzquierda, setImgAtrasIzquierda)}
          {renderMediaField("Tablero", "tablero", imgTablero, setImgTablero)}
          {renderMediaField("Motor", "motor", imgMotor, setImgMotor)}
        </div>
      </div>

      {/* Bloque 4 Equipamiento Checkboxes responsivos */}
      <div className="space-y-6">
        <h2 className="text-sm md:text-base font-bold text-blue-900 border-b pb-1.5">4. Equipamiento</h2>
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-2">Tipo de Vehículo</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OPCIONES_TIPOS.map(o => (
              <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input type="checkbox" checked={selectedTypes.includes(o)} onChange={() => handleCheckboxChange(o, selectedTypes, setSelectedTypes)} className="rounded text-blue-600 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{o}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-2">Transmisión</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OPCIONES_TRANSMISIONES.map(o => (
              <label key={o} className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input type="checkbox" checked={selectedTransmissions.includes(o)} onChange={() => handleCheckboxChange(o, selectedTransmissions, setSelectedTransmissions)} className="rounded text-blue-600 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{o}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-xs text-slate-600">Cancelar</button>
        <button type="submit" disabled={formSubmitting} className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white">
          {formSubmitting ? 'Procesando...' : vehicleToEdit ? 'Guardar' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}
