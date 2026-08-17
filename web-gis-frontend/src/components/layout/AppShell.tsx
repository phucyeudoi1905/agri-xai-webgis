import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useServiceHealth } from '../../hooks/useServiceHealth';
import { Icon, type IconName } from '../ui/Icon';

interface NavEntry {
  to: string;
  label: string;
  icon: IconName;
  title: string;
  subtitle: string;
}

const NAV: NavEntry[] = [
  {
    to: '/',
    label: 'Tổng quan',
    icon: 'dashboard',
    title: 'Tổng quan vùng trồng',
    subtitle: 'Thống kê diện tích, rủi ro không gian và cảnh báo dịch bệnh',
  },
  {
    to: '/map',
    label: 'Bản đồ số',
    icon: 'map',
    title: 'Bản đồ số vùng trồng',
    subtitle: 'Số hóa ranh giới lô đất và theo dõi rủi ro theo khung nhìn',
  },
  {
    to: '/plots',
    label: 'Lô đất',
    icon: 'list',
    title: 'Danh sách lô đất',
    subtitle: 'Tra cứu, lọc và quản lý toàn bộ lô đất đã cấp mã PUC',
  },
  {
    to: '/trace',
    label: 'Truy xuất',
    icon: 'qr',
    title: 'Truy xuất nguồn gốc',
    subtitle: 'Tra cứu mã PUC, mã lô hàng và lịch sử xuất xưởng',
  },
];

const HEALTH_TEXT: Record<string, string> = {
  checking: 'Đang kiểm tra GIS Service…',
  up: 'GIS Service hoạt động',
  down: 'Không kết nối được API',
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const health = useServiceHealth();
  const [navOpen, setNavOpen] = useState(false);

  const active =
    NAV.find((n) => n.to !== '/' && location.pathname.startsWith(n.to)) ??
    NAV[0];

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="shell">
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <aside className={`sidebar ${navOpen ? 'open' : ''}`.trim()}>
        <div className="sidebar-brand">
          <span className="brand-logo">
            <Icon name="sprout" size={19} />
          </span>
          <span className="brand-text">
            <span className="brand-name">AgriLens GIS</span>
            <span className="brand-tag">Nông nghiệp số · Nhóm 2</span>
          </span>
        </div>

        <p className="nav-section">Nghiệp vụ</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`.trim()
            }
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="health">
            <span
              className={`health-dot ${
                health === 'down' ? 'down' : health === 'checking' ? 'wait' : ''
              }`.trim()}
            />
            <span className="muted">{HEALTH_TEXT[health]}</span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-icon nav-toggle"
            onClick={() => setNavOpen(true)}
            aria-label="Mở menu"
          >
            <Icon name="menu" size={18} />
          </button>

          <div className="topbar-titles">
            <h1>{active.title}</h1>
            <p>{active.subtitle}</p>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/trace')}
            >
              <Icon name="qr" size={15} />
              Tra mã PUC
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => navigate('/map?draw=1')}
            >
              <Icon name="plus" size={15} />
              Số hóa lô đất
            </button>
          </div>
        </header>

        <main className={`page ${active.to === '/map' ? 'page-flush' : ''}`.trim()}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
