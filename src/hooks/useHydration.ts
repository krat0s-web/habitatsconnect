import { useEffect, useState } from 'react';

/**
 * Hook pour gérer l'hydratation client-serveur
 * Évite les erreurs d'hydratation avec Zustand
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
