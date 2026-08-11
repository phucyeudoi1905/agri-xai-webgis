import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePlotData } from '../../hooks/usePlotData';
import { createPlot } from '../../services/gisApi';
import type { GeoJsonPolygon } from '../../types/gis.types';
import { PlotLayer } from './PlotLayer';
import { PlotPopupDrawer } from './PlotPopupDrawer';
import { PolygonDrawTools } from './PolygonDrawTools';

const DEFAULT_CENTER: [number, number] = [10.045, 105.78];
const DEFAULT_ZOOM = 13;

function CaptureMap({ onReady }: { onReady: (m: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export function GISMapContainer() {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const { data, loading, error, reload } = usePlotData(map);
  const [selectedPuc, setSelectedPuc] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingBoundary, setPendingBoundary] = useState<GeoJsonPolygon | null>(
    null,
  );
  const [plotName, setPlotName] = useState('');
  const [cropType, setCropType] = useState('Lúa ST25');
  const [farmerId] = useState('a3b8e912-4c5d-6e7f-8a9b-0c1d2e3f4a5b');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onMapReady = useCallback((m: LeafletMap) => setMap(m), []);

  const handleDrawComplete = (polygon: GeoJsonPolygon) => {
    setPendingBoundary(polygon);
    setDrawing(false);
    setFormOpen(true);
  };

  const submitPlot = async () => {
    if (!pendingBoundary || !plotName.trim()) return;
    setBusy(true);
    setToast(null);
    try {
      const res = await createPlot({
        farmer_id: farmerId,
        plot_name: plotName.trim(),
        crop_type: cropType.trim(),
        boundary: pendingBoundary,
      });
      setToast(`Đã cấp PUC ${res.data.puc}`);
      setFormOpen(false);
      setPendingBoundary(null);
      setPlotName('');
      await reload();
      setSelectedPuc(res.data.puc);
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setToast(err.response?.data?.message || err.message || 'Không tạo được lô đất');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gis-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">AgriXAI</span>
          <span className="brand-sub">Web GIS · Nhóm 2</span>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setDrawing(true);
              setSelectedPuc(null);
            }}
            disabled={drawing}
          >
            Vẽ lô đất
          </button>
          <button type="button" className="btn ghost" onClick={() => void reload()}>
            Làm mới
          </button>
        </div>
      </header>

      <div className="map-stage">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="map-canvas"
          preferCanvas
        >
          <CaptureMap onReady={onMapReady} />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="ESRI World Imagery">
              <TileLayer
                attribution="Tiles © Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <PlotLayer
            data={data}
            selectedPuc={selectedPuc}
            onSelect={setSelectedPuc}
          />
          <PolygonDrawTools
            active={drawing}
            onComplete={handleDrawComplete}
            onCancel={() => setDrawing(false)}
          />
        </MapContainer>

        <div className="legend">
          <div>
            <i style={{ background: '#2E7D32' }} /> Bình thường
          </div>
          <div>
            <i style={{ background: '#F57F17' }} /> Cảnh báo nhẹ
          </div>
          <div>
            <i className="blink" style={{ background: '#D32F2F' }} /> Nguy cơ cao
          </div>
        </div>

        {(loading || error || toast) && (
          <div className="status-chip">
            {loading && 'Đang nạp viewport…'}
            {error && `Lỗi: ${error}`}
            {!loading && !error && toast}
          </div>
        )}

        <PlotPopupDrawer puc={selectedPuc} onClose={() => setSelectedPuc(null)} />
      </div>

      {formOpen && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h3>Lưu lô đất mới</h3>
            <label>
              Tên lô
              <input
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                placeholder="Lô Ruộng A1"
              />
            </label>
            <label>
              Loại cây
              <input
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              />
            </label>
            <p className="muted">farmer_id demo: {farmerId}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setFormOpen(false);
                  setPendingBoundary(null);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy || !plotName.trim()}
                onClick={() => void submitPlot()}
              >
                {busy ? 'Đang lưu…' : 'Lưu & cấp PUC'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
