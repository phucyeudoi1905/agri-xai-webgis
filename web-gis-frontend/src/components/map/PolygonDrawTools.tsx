import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonPolygon } from '../../types/gis.types';

interface Props {
  active: boolean;
  onComplete: (polygon: GeoJsonPolygon) => void;
  onCancel: () => void;
}

const STROKE = '#0b1524';

/** Công cụ vẽ đa giác bằng click, không cần plugin leaflet-draw. */
export function PolygonDrawTools({ active, onComplete, onCancel }: Props) {
  const map = useMap();
  const [points, setPoints] = useState<[number, number][]>([]);
  const shapeRef = useRef<L.Polyline | L.Polygon | null>(null);
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
        onComplete({ type: 'Polygon', coordinates: [[...prev, prev[0]]] });
        return [];
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPoints((prev) => prev.slice(0, -1));
      }
      if (e.key === 'Enter') {
        setPoints((prev) => {
          if (prev.length < 3) return prev;
          onComplete({ type: 'Polygon', coordinates: [[...prev, prev[0]]] });
          return [];
        });
      }
    };

    map.doubleClickZoom.disable();
    map.on('click', onClick);
    map.on('dblclick', onDblClick);
    window.addEventListener('keydown', onKey);

    return () => {
      map.off('click', onClick);
      map.off('dblclick', onDblClick);
      window.removeEventListener('keydown', onKey);
      map.doubleClickZoom.enable();
    };
  }, [active, map, onComplete, onCancel]);

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    shapeRef.current?.remove();
    shapeRef.current = null;

    if (points.length === 0) return;

    markersRef.current = points.map(([lng, lat], i) =>
      L.circleMarker([lat, lng], {
        radius: i === 0 ? 6 : 4.5,
        color: STROKE,
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map),
    );

    const latlngs = points.map(([lng, lat]) => L.latLng(lat, lng));
    shapeRef.current =
      points.length >= 3
        ? L.polygon(latlngs, {
            color: STROKE,
            weight: 2,
            dashArray: '5 4',
            fillColor: '#16a34a',
            fillOpacity: 0.16,
          }).addTo(map)
        : L.polyline(latlngs, {
            color: STROKE,
            weight: 2,
            dashArray: '5 4',
          }).addTo(map);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      shapeRef.current?.remove();
      shapeRef.current = null;
    };
  }, [points, map]);

  if (!active) return null;

  return (
    <div className="draw-banner">
      <span>
        <strong>{points.length}</strong> đỉnh · <kbd>Click</kbd> thêm điểm ·{' '}
        <kbd>Enter</kbd> hoặc <kbd>Double-click</kbd> khép đa giác
      </span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
        Hủy
      </button>
    </div>
  );
}
