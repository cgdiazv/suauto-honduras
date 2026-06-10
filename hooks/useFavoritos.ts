// src/hooks/useFavoritos.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useFavoritos(vehicleId: string) {
  const { user } = useAuth();
  const [isFavorito, setIsFavorito] = useState(false);

  // Clave única por usuario para guardar en localStorage
  const storageKey = user ? `favs_${user.email}` : 'favs_anonymous';

  useEffect(() => {
    // Cargar favoritos guardados al montar el componente
    const favs = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    setIsFavorito(favs.includes(vehicleId));
  }, [vehicleId, storageKey]);

  const toggleFavorito = () => {
    const favs = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    let nuevosFavs: string[];

    if (favs.includes(vehicleId)) {
      nuevosFavs = favs.filter(id => id !== vehicleId);
      setIsFavorito(false);
    } else {
      nuevosFavs = [...favs, vehicleId];
      setIsFavorito(true);
    }

    localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
  };

  return { isFavorito, toggleFavorito };
}