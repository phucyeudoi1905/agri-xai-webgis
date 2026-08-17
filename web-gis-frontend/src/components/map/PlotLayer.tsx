import { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import { formatNumber } from '../../lib/format';
import { growthLabel } from '../../lib/gis';
import type { PlotFeature, PlotProperties } from '../../types/gis.types';

interface Props {
  features: PlotFeature[];
  selectedPuc: string | null;
  onSelect: (puc: string) => void;
}

export function PlotLayer({ features, selectedPuc, onSelect }: Props) {
  const collection = useMemo<FeatureCollection>(
    () => ({ type: 'FeatureCollection', features: features as never }),
    [features],
  );

  // Leaflet không diff GeoJSON theo props, nên remount khi tập dữ liệu đổi.
  const key = useMemo(
    () =>
      features
        .map((f) => `${f.properties.puc}:${f.properties.risk_level}`)
        .join('|') + `#${selectedPuc ?? ''}`,
    [features, selectedPuc],
  );

  const style = (feature?: Feature<Geometry, PlotProperties>): PathOptions => {
    const props = feature?.properties;
    const color = props?.risk_color ?? '#2E7D32';
    const isSelected = props?.puc === selectedPuc;

    return {
      color: isSelected ? '#0b1524' : color,
      weight: isSelected ? 3 : props?.risk_level === 2 ? 2.5 : 1.8,
      fillColor: color,
      fillOpacity: isSelected ? 0.5 : 0.32,
      dashArray: isSelected ? undefined : undefined,
      className: props?.risk_level === 2 && !isSelected ? 'plot-blink' : undefined,
    };
  };

  if (features.length === 0) return null;

  return (
    <GeoJSON
      key={key}
      data={collection}
      style={style as never}
      onEachFeature={(feature, layer) => {
        const p = feature.properties as PlotProperties;
        layer.bindTooltip(
          `<strong>${p.plot_name}</strong><br/>${p.puc}<br/>${p.crop_type} · ${growthLabel(
            p.growth_status,
          )}<br/>${formatNumber(p.area_m2 / 10000, 2)} ha`,
          { sticky: true, direction: 'top', opacity: 1 },
        );
        layer.on('click', () => onSelect(p.puc));
      }}
    />
  );
}
