import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJsonPolygon, PlotFeature } from '../../types/gis.types';
import { PlotLayer } from './PlotLayer';
import { PolygonDrawTools } from './PolygonDrawTools';

export type Basemap = 'satellite' | 'street' | 'topo';

const DEFAULT_CENTER: [number, number] = [10.038, 105.805];
const DEFAULT_ZOOM = 14;

const BASEMAPS: Record<Basemap, { url: string; attribution: string; maxZoom: number }> =
  {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Ảnh vệ tinh © Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap (CC-BY-SA)',
      maxZoom: 17,
    },
  };

function CaptureMap({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
    // Leaflet cần đo lại kích thước sau khi layout grid ổn định.
    const t = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(t);
  }, [map, onReady]);
  return null;
}

function FitToSelection({
  features,
  selectedPuc,
}: {
  features: PlotFeature[];
  selectedPuc: string | null;
}) {
  const map = useMap();
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedPuc || selectedPuc === lastRef.current) return;
    const target = features.find((f) => f.properties.puc === selectedPuc);
    if (!target) return;

    lastRef.current = selectedPuc;
    const ring = target.geometry.coordinates[0] ?? [];
    if (ring.length === 0) return;

    const bounds = L.latLngBounds(ring.map(([lng, lat]) => L.latLng(lat, lng)));
    map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 17, duration: 0.6 });
  }, [features, selectedPuc, map]);

  useEffect(() => {
    if (!selectedPuc) lastRef.current = null;
  }, [selectedPuc]);

  return null;
}

interface Props {
  basemap: Basemap;
  features: PlotFeature[];
  selectedPuc: string | null;
  drawing: boolean;
  onMapReady: (map: LeafletMap) => void;
  onSelect: (puc: string) => void;
  onDrawComplete: (polygon: GeoJsonPolygon) => void;
  onDrawCancel: () => void;
}

export function GISMap({
  basemap,
  features,
  selectedPuc,
  drawing,
  onMapReady,
  onSelect,
  onDrawComplete,
  onDrawCancel,
}: Props) {
  const tiles = BASEMAPS[basemap];

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="map-canvas"
      zoomControl={false}
      preferCanvas
    >
      <CaptureMap onReady={onMapReady} />
      <ZoomControl position="bottomright" />
      <TileLayer
        key={basemap}
        url={tiles.url}
        attribution={tiles.attribution}
        maxZoom={tiles.maxZoom}
      />
      <PlotLayer
        features={features}
        selectedPuc={selectedPuc}
        onSelect={onSelect}
      />
      <FitToSelection features={features} selectedPuc={selectedPuc} />
      <PolygonDrawTools
        active={drawing}
        onComplete={onDrawComplete}
        onCancel={onDrawCancel}
      />
    </MapContainer>
  );
}
