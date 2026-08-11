export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export function assertValidPolygon(boundary: GeoJsonPolygon): void {
  if (!boundary || boundary.type !== 'Polygon') {
    throw new Error('Boundary must be a GeoJSON Polygon');
  }
  const ring = boundary.coordinates?.[0];
  if (!ring || ring.length < 4) {
    throw new Error('Polygon ring must have at least 4 positions (closed)');
  }
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx !== lx || fy !== ly) {
    throw new Error('Polygon ring must be closed (first point = last point)');
  }
  // Unique vertices excluding closing point
  const unique = ring.slice(0, -1);
  if (unique.length < 3) {
    throw new Error('Polygon must have at least 3 vertices');
  }
}

export function toGeoJsonString(boundary: GeoJsonPolygon): string {
  return JSON.stringify(boundary);
}
