import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonPolygon } from '../../types/gis.types';

interface Props {
  active: boolean;
  onComplete: (polygon: GeoJsonPolygon) => void;
  onCancel: () => void;
}

/** Simple click-to-draw polygon tool (no extra draw plugin). */
export function PolygonDrawTools({ active, onComplete, onCancel }: Props) {
  const map = useMap();
  const [points, setPoints] = useState<[number, number][]>([]);
  const layerRef = useRef<L.Polyline | L.Polygon | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!active) {
      setPoints([]);
      return;
    }

    const onClick = (e: L.LeafletMouseEvent) => {
      setPoints((prev) => [...prev, [e.latlng.lng, e.latlng.lat]]);
    };

    const onDblClick = (e: L.LeafletMouseEvent) => {
      L.DomEvent.stop(e);
      setPoints((prev) => {
        if (prev.length < 3) return prev;
        const ring = [...prev, prev[0]];
        onComplete({ type: 'Polygon', coordinates: [ring] });
        return [];
      });
    };

    map.doubleClickZoom.disable();
    map.on('click', onClick);
    map.on('dblclick', onDblClick);

    return () => {
      map.off('click', onClick);
      map.off('dblclick', onDblClick);
      map.doubleClickZoom.enable();
    };
  }, [active, map, onComplete]);

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    if (points.length === 0) return;

    markersRef.current = points.map(([lng, lat]) =>
      L.circleMarker([lat, lng], {
        radius: 5,
        color: '#1b5e20',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map),
    );

    const latlngs = points.map(([lng, lat]) => L.latLng(lat, lng));
    layerRef.current =
      points.length >= 3
        ? L.polygon(latlngs, {
            color: '#1b5e20',
            dashArray: '6 4',
            fillOpacity: 0.15,
          }).addTo(map)
        : L.polyline(latlngs, { color: '#1b5e20', dashArray: '6 4' }).addTo(map);
  }, [points, map]);

  if (!active) return null;

  return (
    <div className="draw-hint">
      Click để thêm đỉnh · Double-click để khép đa giác · Tối thiểu 3 đỉnh
      <button type="button" className="btn ghost" onClick={onCancel}>
        Hủy vẽ
      </button>
    </div>
  );
}
