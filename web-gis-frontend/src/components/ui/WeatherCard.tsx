import { useEffect, useState } from 'react';
import { fetchCurrentWeather, fetchPlotWeather } from '../../services/gisApi';
import type { PlotWeatherReport } from '../../types/gis.types';
import { formatNumber } from '../../lib/format';
import { Card, CardBody, CardHead } from './Card';
import { Icon, type IconName } from './Icon';

interface Props {
  puc?: string;
  lat?: number;
  lng?: number;
  report?: PlotWeatherReport | null;
  compact?: boolean;
  title?: string;
}

export function WeatherCard({
  puc,
  lat = 11.94,
  lng = 108.45,
  report: initialReport,
  compact = false,
  title = 'Thời tiết & Vi khí hậu vùng trồng',
}: Props) {
  const [data, setData] = useState<PlotWeatherReport | null>(initialReport ?? null);
  const [loading, setLoading] = useState(!initialReport);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      if (puc) {
        const res = await fetchPlotWeather(puc);
        setData(res);
      } else {
        const res = await fetchCurrentWeather(lat, lng);
        setData(res);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được dữ liệu thời tiết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReport) {
      setData(initialReport);
      setLoading(false);
    } else {
      void loadWeather();
    }
  }, [puc, lat, lng, initialReport]);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="stack" style={{ gap: 12 }}>
            <div className="skeleton" style={{ height: 20, width: '40%' }} />
            <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardBody>
          <div className="row-between">
            <span className="muted" style={{ fontSize: 13 }}>
              {error ?? 'Chưa có thông tin thời tiết'}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => void loadWeather()}
            >
              <Icon name="refresh" size={14} /> Thử lại
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { current, daily, agriAdvice, iotReading } = data;
  const weatherIconName: IconName =
    current.icon === 'sun' || current.icon === 'cloud-rain' || current.icon === 'wind'
      ? (current.icon as IconName)
      : 'cloud';

  return (
    <Card>
      <CardHead
        title={title}
        subtitle={
          data.plotName
            ? `${data.plotName} · ${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}`
            : `Khu vực Lâm Đồng - Đà Lạt · ${data.location.lat.toFixed(2)}°B, ${data.location.lng.toFixed(2)}°Đ`
        }
        actions={
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => void loadWeather()}
            aria-label="Cập nhật thời tiết"
            title="Cập nhật dữ liệu thời tiết thực tế"
          >
            <Icon name="refresh" size={14} />
          </button>
        }
      />
      <CardBody>
        {/* Phần nhiệt độ & điều kiện hiện tại */}
        <div
          className="row-between"
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            marginBottom: 14,
          }}
        >
          <div className="row" style={{ gap: 14 }}>
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 44,
                height: 44,
                borderRadius: 'var(--r-md)',
                background:
                  current.icon === 'sun'
                    ? 'rgba(245, 158, 11, 0.16)'
                    : 'rgba(59, 130, 246, 0.16)',
                color: current.icon === 'sun' ? '#f59e0b' : 'var(--info)',
              }}
            >
              <Icon name={weatherIconName} size={24} />
            </div>
            <div>
              <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: -0.02,
                    color: 'var(--text-strong)',
                  }}
                >
                  {formatNumber(current.temperature, 1)}°C
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  (Cảm nhận {formatNumber(current.apparentTemperature, 1)}°C)
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--brand-600)',
                }}
              >
                {current.condition}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, auto)',
              gap: '6px 16px',
              fontSize: 12,
            }}
          >
            <div className="row" style={{ gap: 6 }}>
              <Icon name="droplet" size={13} className="muted" />
              <span className="muted">Độ ẩm:</span>
              <strong style={{ color: 'var(--text-strong)' }}>
                {current.humidity}%
              </strong>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <Icon name="wind" size={13} className="muted" />
              <span className="muted">Gió:</span>
              <strong style={{ color: 'var(--text-strong)' }}>
                {formatNumber(current.windSpeed, 1)} km/h
              </strong>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <Icon name="cloud-rain" size={13} className="muted" />
              <span className="muted">Mưa:</span>
              <strong style={{ color: 'var(--text-strong)' }}>
                {current.precipitation} mm
              </strong>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <Icon name="thermometer" size={13} className="muted" />
              <span className="muted">Khí áp:</span>
              <strong style={{ color: 'var(--text-strong)' }}>
                {Math.round(current.pressure)} hPa
              </strong>
            </div>
          </div>
        </div>

        {/* Khuyến nghị nông vụ */}
        {agriAdvice && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--brand-50)',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              fontSize: 12.5,
              color: 'var(--brand-700)',
              marginBottom: compact ? 0 : 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 2, display: 'inline-flex' }}>
              <Icon name="sprout" size={15} />
            </span>
            <span>
              <strong>Khuyến nghị canh tác:</strong> {agriAdvice}
            </span>
          </div>
        )}

        {/* Cảm biến IoT thực địa nếu có */}
        {iotReading && (
          <div
            className="row-between"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--violet-soft)',
              fontSize: 12,
              marginBottom: compact ? 0 : 12,
            }}
          >
            <div className="row" style={{ gap: 6 }}>
              <span style={{ color: 'var(--violet)', display: 'inline-flex' }}>
                <Icon name="target" size={14} />
              </span>
              <span>
                <strong>Trạm IoT thực địa:</strong> {iotReading.temperatureC}°C ·{' '}
                {iotReading.humidityPct}% ẩm
              </span>
            </div>
            <span className="muted" style={{ fontSize: 11 }}>
              {iotReading.sensorId ?? 'Sensor-01'}
            </span>
          </div>
        )}

        {/* Dự báo các ngày tới */}
        {!compact && daily && daily.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p
              className="muted"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 8,
              }}
            >
              Dự báo thời tiết 3 ngày tới
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(daily.length, 3)}, 1fr)`,
                gap: 8,
              }}
            >
              {daily.slice(0, 3).map((d) => (
                <div
                  key={d.date}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    fontSize: 12,
                  }}
                >
                  <p className="muted" style={{ fontSize: 11, marginBottom: 4 }}>
                    {d.date.slice(5).replace('-', '/')}
                  </p>
                  <strong style={{ fontSize: 13, color: 'var(--text-strong)' }}>
                    {Math.round(d.tempMin)}° - {Math.round(d.tempMax)}°C
                  </strong>
                  <p
                    style={{
                      fontSize: 11.5,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {d.condition}
                  </p>
                  {d.precipitationProbability > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--info)',
                        fontWeight: 600,
                      }}
                    >
                      🌧️ {d.precipitationProbability}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
