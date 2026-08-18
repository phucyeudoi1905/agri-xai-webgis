import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L, { type Map as LeafletMap } from 'leaflet';
import { CreatePlotModal } from '../components/forms/CreatePlotModal';
import { ShippingModal } from '../components/forms/ShippingModal';
import { GISMap, type Basemap } from '../components/map/GISMap';
import { PlotDetailPanel } from '../components/map/PlotDetailPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { useViewportPlots } from '../hooks/usePlotData';
import { fetchAllPlots, fetchPlotByPuc, connectRiskSocket } from '../services/gisApi';
import { useToast } from '../components/ui/toastContext';
import { formatNumber } from '../lib/format';
import { RISK_META, growthLabel } from '../lib/gis';
import type { GeoJsonPolygon } from '../types/gis.types';

type RiskFilter = 'all' | '0' | '1' | '2';

const BASEMAP_OPTIONS: Array<{ id: Basemap; label: string }> = [
  { id: 'satellite', label: 'Vệ tinh' },
  { id: 'street', label: 'Đường' },
  { id: 'topo', label: 'Địa hình' },
];

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const { features, loading, error, reload } = useViewportPlots(map);

  const [basemap, setBasemap] = useState<Basemap>('satellite');
  const [selectedPuc, setSelectedPuc] = useState<string | null>(
    searchParams.get('puc'),
  );
  const [drawing, setDrawing] = useState(false);
  const [gpsWalking, setGpsWalking] = useState(false);
  const [pendingBoundary, setPendingBoundary] = useState<GeoJsonPolygon | null>(
    null,
  );
  const [shippingPuc, setShippingPuc] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');

  const toast = useToast();

  useEffect(() => {
    const socket = connectRiskSocket((ev) => {
      toast.success(
        'Cập nhật rủi ro realtime',
        `${ev.puc} → mức ${ev.risk_level}` +
          (ev.neighbors?.length
            ? ` · ${ev.neighbors.length} lô cách ly`
            : ''),
      );
      void reload();
    });
    return () => {
      socket.disconnect();
    };
  }, [reload, toast]);

  // Điều hướng kèm ?draw=1 từ topbar sẽ bật ngay chế độ vẽ.
  useEffect(() => {
    if (searchParams.get('draw') === '1') {
      setDrawing(true);
      setSelectedPuc(null);
      const next = new URLSearchParams(searchParams);
      next.delete('draw');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const onMapReady = useCallback((m: LeafletMap) => setMap(m), []);

  // Lần đầu mở bản đồ: canh khung nhìn vào toàn bộ vùng trồng đang có dữ liệu.
  const didInitialFit = useRef(false);
  useEffect(() => {
    if (!map || didInitialFit.current) return;
    didInitialFit.current = true;
    if (searchParams.get('puc')) return;

    let cancelled = false;
    fetchAllPlots()
      .then((fc) => {
        const ring = fc.features.flatMap((f) => f.geometry.coordinates[0] ?? []);
        if (cancelled || ring.length === 0) return;
        map.fitBounds(
          L.latLngBounds(ring.map(([lng, lat]) => L.latLng(lat, lng))),
          { padding: [60, 60], maxZoom: 15 },
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [map, searchParams]);

  // Lô đất mở từ trang khác có thể nằm ngoài khung nhìn mặc định.
  useEffect(() => {
    if (!map || !selectedPuc || loading) return;
    if (features.some((f) => f.properties.puc === selectedPuc)) return;

    let cancelled = false;
    fetchPlotByPuc(selectedPuc)
      .then((plot) => {
        const ring = plot.boundary?.coordinates?.[0] ?? [];
        if (cancelled || ring.length === 0) return;
        map.fitBounds(
          L.latLngBounds(ring.map(([lng, lat]) => L.latLng(lat, lng))),
          { padding: [80, 80], maxZoom: 17 },
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [map, selectedPuc, features, loading]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return features.filter((f) => {
      const p = f.properties;
      const matchQuery =
        !q ||
        p.plot_name.toLowerCase().includes(q) ||
        p.puc.toLowerCase().includes(q) ||
        p.crop_type.toLowerCase().includes(q);
      const matchRisk =
        riskFilter === 'all' || String(p.risk_level) === riskFilter;
      return matchQuery && matchRisk;
    });
  }, [features, query, riskFilter]);

  const handleDrawComplete = (polygon: GeoJsonPolygon) => {
    setPendingBoundary(polygon);
    setDrawing(false);
  };

  const handleCreated = async (puc: string) => {
    setPendingBoundary(null);
    await reload();
    setSelectedPuc(puc);
  };

  return (
    <div className={`map-page ${drawing ? 'map-drawing' : ''}`.trim()}>
      <aside className="map-aside">
        <div className="map-aside-head">
          <div className="search">
            <Icon name="search" size={15} />
            <input
              className="input"
              value={query}
              placeholder="Tìm theo tên lô, PUC, cây trồng…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
            {loading
              ? 'Đang nạp khung nhìn…'
              : `${visible.length} lô trong khung nhìn`}
          </p>
        </div>

        <div className="map-aside-filters">
          <div className="segmented">
            {(['all', '0', '1', '2'] as RiskFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={riskFilter === key}
                onClick={() => setRiskFilter(key)}
              >
                {key === 'all'
                  ? 'Tất cả'
                  : RISK_META[Number(key) as 0 | 1 | 2].short}
              </button>
            ))}
          </div>
        </div>

        <div className="map-aside-list">
          {error && (
            <EmptyState icon="alert" title="Lỗi tải dữ liệu" description={error} />
          )}

          {!error && visible.length === 0 && (
            <EmptyState
              icon="map"
              title="Không có lô đất"
              description="Thử di chuyển bản đồ, đổi bộ lọc hoặc số hóa lô đất mới."
            />
          )}

          {visible.map((f) => {
            const p = f.properties;
            return (
              <button
                key={p.puc}
                type="button"
                className={`plot-card ${p.puc === selectedPuc ? 'active' : ''}`.trim()}
                onClick={() => setSelectedPuc(p.puc)}
              >
                <div className="plot-card-top">
                  <span
                    className="legend-swatch"
                    style={{ background: p.risk_color }}
                  />
                  <span className="plot-card-name">{p.plot_name}</span>
                </div>
                <span className="plot-card-puc">{p.puc}</span>
                <span className="plot-card-meta">
                  <span>{p.crop_type}</span>
                  <span>·</span>
                  <span>{formatNumber(p.area_m2 / 10000, 2)} ha</span>
                  <span>·</span>
                  <span>{growthLabel(p.growth_status)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="map-stage">
        <GISMap
          basemap={basemap}
          features={features}
          selectedPuc={selectedPuc}
          drawing={drawing}
          gpsWalking={gpsWalking}
          onMapReady={onMapReady}
          onSelect={setSelectedPuc}
          onDrawComplete={handleDrawComplete}
          onDrawCancel={() => setDrawing(false)}
          onGpsComplete={handleDrawComplete}
          onGpsCancel={() => setGpsWalking(false)}
        />

        <div className="map-float tl">
          <div className="map-toolbar">
            <button
              type="button"
              className="btn btn-sm"
              disabled={drawing || gpsWalking}
              onClick={() => {
                setDrawing(true);
                setGpsWalking(false);
                setSelectedPuc(null);
              }}
            >
              <Icon name="pen" size={15} />
              Vẽ lô đất
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={drawing || gpsWalking}
              onClick={() => {
                setGpsWalking(true);
                setDrawing(false);
                setSelectedPuc(null);
              }}
            >
              <Icon name="target" size={15} />
              GPS ranh giới
            </button>

            <button
              type="button"
              className="btn btn-icon"
              onClick={() => void reload()}
              aria-label="Nạp lại khung nhìn"
            >
              {loading ? <span className="spinner" /> : <Icon name="refresh" size={16} />}
            </button>

            {!drawing && !gpsWalking && (
              <>
                <span className="divider-v" />
                <div className="segmented">
                  {BASEMAP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={basemap === opt.id}
                      onClick={() => setBasemap(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="map-float bl">
          <div className="legend-card">
            <h4>Mức rủi ro</h4>
            <ul>
              {([0, 1, 2] as const).map((level) => (
                <li key={level}>
                  <span
                    className={`legend-swatch ${level === 2 ? 'blink' : ''}`.trim()}
                    style={{ background: RISK_META[level].color }}
                  />
                  {RISK_META[level].label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {selectedPuc && !drawing && !gpsWalking && (
          <PlotDetailPanel
            puc={selectedPuc}
            onClose={() => setSelectedPuc(null)}
            onChanged={() => void reload()}
            onLogShipment={setShippingPuc}
          />
        )}
      </div>

      {pendingBoundary && (
        <CreatePlotModal
          boundary={pendingBoundary}
          onClose={() => setPendingBoundary(null)}
          onCreated={(puc) => void handleCreated(puc)}
        />
      )}

      {shippingPuc && (
        <ShippingModal
          puc={shippingPuc}
          onClose={() => setShippingPuc(null)}
          onCreated={() => {
            setShippingPuc(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}
