import type { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import type { PlotFeature, PlotFeatureCollection } from '../../types/gis.types';

interface Props {
  data: PlotFeatureCollection | null;
  selectedPuc: string | null;
  onSelect: (puc: string) => void;
}

function styleFor(
  feature?: Feature<Geometry, PlotFeature['properties']>,
): PathOptions {
  const risk = feature?.properties?.risk_level ?? 0;
  const color = feature?.properties?.risk_color ?? '#2E7D32';
  return {
    color,
    weight: risk === 2 ? 3 : 2,
    fillColor: color,
    fillOpacity: 0.35,
    className: risk === 2 ? 'plot-blink' : undefined,
  };
}

export function PlotLayer({ data, selectedPuc, onSelect }: Props) {
  const map = useMap();

  const key = useMemo(
    () =>
      `${data?.features.map((f) => f.properties.puc).join(',')}-${data?.features.map((f) => f.properties.risk_level).join(',')}`,
    [data],
  );

  if (!data) return null;

  return (
    <GeoJSON
      key={key || 'empty'}
      data={data as GeoJSON.FeatureCollection}
      style={styleFor}
      onEachFeature={(feature, layer) => {
        const props = feature.properties as PlotFeature['properties'];
        layer.bindTooltip(
          `<strong>${props.plot_name}</strong><br/>PUC: ${props.puc}<br/>${props.crop_type}`,
          { sticky: true },
        );
        layer.on('click', () => onSelect(props.puc));
        if (selectedPuc && props.puc === selectedPuc && layer instanceof L.Polygon) {
          map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 17 });
        }
      }}
    />
  );
}
