import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonPolygon } from '../../types/gis.types';

interface Props {
  active: boolean;
  onComplete: (polygon: GeoJsonPolygon) => void;
  onCancel: () => void;
}

/** T23 scaffold: thu thập GPS khi đi bộ quanh ranh giới. */
export function GpsWalkTools({ active, onComplete, onCancel }: Props) {
  const map = useMap();
  const [points, setPoints] = useState<[number, number][]>([]);
  const watchRef = useRef<number | null>(null);
  const layerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!active) {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      setPoints([]);
      return;
    }

    if (!navigator.geolocation) {
      onCancel();
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        setPoints((prev) => {
          const last = prev[prev.length - 1];
          if (last) {
            const dlat = (lat - last[1]) * 111_320;
            const dlng =
              (lng - last[0]) * 111_320 * Math.cos((lat * Math.PI) / 180);
            if (Math.hypot(dlat, dlng) < 4) return prev;
          }
          return [...prev, [lng, lat]];
        });
        map.panTo([lat, lng], { animate: true });
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 1000 },
    );

    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [active, map, onCancel]);

  useEffect(() => {
    layerRef.current?.remove();
    layerRef.current = null;
    if (points.length < 2) return;
    layerRef.current = L.polyline(
      points.map(([lng, lat]) => L.latLng(lat, lng)),
      { color: '#2563eb', weight: 3, dashArray: '4 6' },
    ).addTo(map);
    return () => {
      layerRef.current?.remove();
      layerRef.current = null;
    };
  }, [points, map]);

  if (!active) return null;

  return (
    <div className="draw-banner">
      <span>
        GPS · <strong>{points.length}</strong> điểm · đi bộ quanh ranh giới
      </span>
      <button
        type="button"
        className="btn btn-sm"
        disabled={points.length < 3}
        onClick={() => {
          if (points.length < 3) return;
          onComplete({
            type: 'Polygon',
            coordinates: [[...points, points[0]]],
          });
        }}
      >
        Khép đa giác
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
        Hủy
      </button>
    </div>
  );
}
