import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useServiceHealth } from '../../hooks/useServiceHealth';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { Icon, type IconName } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/map', label: 'Bản Đồ GIS', icon: 'map' },
  { to: '/plots', label: 'Sổ Vùng Trồng', icon: 'list' },
  { to: '/trace', label: 'Xuất Kho & PUC', icon: 'qr' },
  { to: '/', label: 'Báo Cáo & Thống Kê', icon: 'dashboard' },
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const health = useServiceHealth();
  const { user, role, switchRole } = useAuth();

  const isMapView = location.pathname === '/map';

  return (
    <div className="shell">
      {/* Top Header Navbar (Ziinpv Style) */}
      <header className="app-header">
        {/* Left: Branding & Region */}
        <div className="header-brand" onClick={() => navigate('/')}>
          <div className="brand-icon-box">
            <Icon name="sprout" size={20} />
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-title-main">AgriGIS</span>
              <span className="brand-badge">Lâm Đồng</span>
            </div>
            <span className="brand-subtitle">
              Hệ Thống Số Hóa Vùng Trồng & Cấp Mã PUC
            </span>
          </div>
        </div>

        {/* Center: Navigation Pill-Tabs Capsule */}
        <nav className="header-nav" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={`nav-pill ${isActive ? 'active' : ''}`.trim()}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: User Profile & Role, Theme, & Action CTA */}
        <div className="header-actions">
          {/* User Account Switcher */}
          <div className="user-profile-badge" title={user.roleTitle}>
            <span className="user-avatar-circle">{user.avatarLetter}</span>
            <div className="user-info-text">
              <span className="user-name-label">{user.name}</span>
              <span className="user-role-label">
                {role === 'ADMIN'
                  ? '🛡️ Quản trị / Cán bộ NN'
                  : role === 'HTX'
                    ? '🏢 Chủ Hợp Tác Xã'
                    : '👨‍🌾 Nông Dân Canh Tác'}
              </span>
            </div>
            <select
              className="user-role-select-overlay"
              value={role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              title="Đổi tài khoản phân quyền"
            >
              <option value="HTX">🏢 K'Brông · Chủ HTX Cầu Đất</option>
              <option value="ADMIN">🛡️ Nguyễn Thanh Hùng · Admin Chi cục</option>
              <option value="FARMER">👨‍🌾 Trần Thị Mai · Nông dân Vạn Thành</option>
            </select>
          </div>

          <ThemeToggle />

          {/* New Plot CTA Button (Chỉ hiển thị cho Admin & HTX) */}
          {role !== 'FARMER' && (
            <button
              type="button"
              className="btn-new-plot"
              onClick={() => navigate('/map?action=create')}
            >
              <Icon name="plus" size={14} />
              <span>Số Hóa Lô Đất</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="main-content-wrapper">
        <div className={isMapView ? 'main-fullscreen' : 'main-scrollable'}>
          <Outlet />
        </div>
      </main>

      {/* Footer on scrollable views */}
      {!isMapView && (
        <footer className="app-footer">
          <div className="footer-system-status">
            <span
              className={`status-dot ${
                health === 'down' ? 'down' : health === 'checking' ? 'wait' : ''
              }`}
            />
            <span>
              {health === 'up'
                ? 'GIS Core Service & PostGIS Sẵn sàng'
                : health === 'checking'
                  ? 'Đang kiểm tra kết nối...'
                  : 'Mất kết nối API'}
            </span>
          </div>
          <div className="muted">
            AgriGIS Vietnam · Nông nghiệp số công nghệ cao tỉnh Lâm Đồng (Đà Lạt)
          </div>
        </footer>
      )}
    </div>
  );
}
