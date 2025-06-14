
import { useState, useCallback } from 'react';

type GeolocationState = {
  loading: boolean;
  position: GeolocationCoordinates | null;
  error: GeolocationPositionError | Error | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    position: null,
    error: null,
  });

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: new Error("A geolocalização não é suportada pelo seu navegador.") }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    return new Promise<GeolocationCoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            loading: false,
            position: position.coords,
            error: null,
          });
          resolve(position.coords);
        },
        (error) => {
          setState({
            loading: false,
            position: null,
            error: error,
          });
          reject(error);
        }
      );
    });
  }, []);

  return { ...state, getPosition };
}
