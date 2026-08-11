import { useEffect, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';

export function useGISMap(map: LeafletMap | null) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map) {
      setReady(false);
      return;
    }
    setReady(true);
  }, [map]);

  return { ready };
}
