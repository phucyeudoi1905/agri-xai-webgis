import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useServiceHealth } from '../../hooks/useServiceHealth';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, type IconName } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: IconName;
}

/** Portal Admin — giám sát vĩ mô, duyệt PUC, báo cáo tỉnh */
const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Báo cáo toàn tỉnh', shortLabel: 'Báo cáo', icon: 'dashboard' },
  { to: '/map', label: 'Bản đồ quy hoạch', shortLabel: 'Bản đồ', icon: 'map' },
  { to: '/plots', label: 'Duyệt vùng trồng & PUC', shortLabel: 'Duyệt PUC', icon: 'list' },
  { to: '/trace', label: 'Giám sát chuỗi cung ứng', shortLabel: 'Giám sát', icon: 'qr' },
];

/** Portal HTX / Nông dân — số hóa thửa, sổ mùa vụ, xuất kho BATCH */
const FARMER_NAV_ITEMS: NavItem[] = [
  { to: '/map', label: 'Vùng trồng của tôi', shortLabel: 'Vùng trồng', icon: 'map' },
  { to: '/plots', label: 'Sổ mùa vụ & luân canh', shortLabel: 'Sổ vụ', icon: 'sprout' },
  { to: '/trace', label: 'Xuất kho & tem QR', shortLabel: 'Xuất kho', icon: 'qr' },
  { to: '/', label: 'Tổng quan sản lượng HTX', shortLabel: 'Tổng quan', icon: 'dashboard' },
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const health = useServiceHealth();
  const { user, role, isAdmin, logout } = useAuth();

  if (!user) return null;

  const isMapView = location.pathname === '/map';
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : FARMER_NAV_ITEMS;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const primaryCta = isAdmin
    ? {
        label: 'Duyệt / Tạo lô đất',
        title: 'Cấp mã số vùng trồng và vẽ ranh giới quy hoạch',
        to: '/map?draw=1',
        icon: 'plus' as IconName,
      }
    : {
        label: 'Đăng ký lô đất',
        title: 'Số hóa ranh giới thửa đất thành viên HTX',
        to: '/map?draw=1',
        icon: 'sprout' as IconName,
      };

  return (
    <div className={`shell shell-role-${isAdmin ? 'admin' : 'farmer'}`}>
      <header className="app-header">
        <div className="header-brand" onClick={() => navigate(isAdmin ? '/' : '/map')}>
          <div className={`brand-icon-box ${isAdmin ? 'admin-box' : 'htx-box'}`}>
            <Icon name={isAdmin ? 'target' : 'sprout'} size={20} />
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-title-main">AgriGIS</span>
              <span className={`brand-badge ${isAdmin ? 'badge-admin' : 'badge-htx'}`}>
                {isAdmin ? 'Quản lý nhà nước' : 'HTX Cầu Đất'}
              </span>
            </div>
            <span className="brand-subtitle">
              {isAdmin
                ? 'Chi Cục Trồng Trọt & BVTV Lâm Đồng · Giám sát vĩ mô'
                : 'Hợp tác xã Cà phê Cầu Đất Farm · Sản xuất & xuất kho'}
            </span>
          </div>
        </div>

        <nav className="header-nav" aria-label={isAdmin ? 'Menu quản lý nhà nước' : 'Menu HTX / nông dân'}>
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={`${role}-${item.to}`}
                to={item.to}
                end={item.to === '/'}
                className={`nav-pill ${isActive ? 'active' : ''}`.trim()}
                title={item.label}
              >
                <Icon name={item.icon} size={15} />
                <span className="nav-pill-label">{item.label}</span>
                <span className="nav-pill-short">{item.shortLabel}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="header-actions">
          <div className="user-profile-badge" title={user.roleTitle}>
            <span
              className="user-avatar-circle"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              {user.avatarLetter}
            </span>
            <div className="user-info-text">
              <span className="user-name-label">{user.name}</span>
              <span className="user-role-label">
                {isAdmin ? 'Admin · Chi Cục NN' : 'Chủ thể HTX / Nông dân'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            Thoát
          </button>

          <ThemeToggle />

          <button
            type="button"
            className="btn-new-plot"
            style={
              isAdmin
                ? { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }
                : undefined
            }
            onClick={() => navigate(primaryCta.to)}
            title={primaryCta.title}
          >
            <Icon name={primaryCta.icon} size={14} />
            <span>{primaryCta.label}</span>
          </button>
        </div>
      </header>

      <div className={`workspace-banner ${isAdmin ? 'admin' : 'htx_farmer'}`}>
        <div className="workspace-banner-left">
          <span className="workspace-tag">
            {isAdmin ? 'PORTAL ADMIN · CƠ QUAN QUẢN LÝ' : 'PORTAL HTX · CHỦ THỂ SẢN XUẤT'}
          </span>
          <span className="workspace-desc">
            {isAdmin
              ? 'Giám sát toàn tỉnh, phê duyệt mã PUC, theo dõi rủi ro dịch tễ — không tạo phiếu BATCH.'
              : 'Số hóa thửa thành viên, nhật ký mùa vụ, lập phiếu xuất kho BATCH & tem QR.'}
          </span>
        </div>
      </div>

      <main className="main-content-wrapper">
        <div className={isMapView ? 'main-fullscreen' : 'main-scrollable'}>
          <Outlet />
        </div>
      </main>

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
                ? 'GIS Core Service & PostGIS sẵn sàng'
                : health === 'checking'
                  ? 'Đang kiểm tra kết nối...'
                  : 'Mất kết nối API'}
            </span>
          </div>
          <div className="muted">
            AgriGIS Vietnam · Farm-to-Fork Lâm Đồng ·{' '}
            {isAdmin ? 'Không gian quản lý nhà nước' : 'Không gian HTX / nông dân'}
          </div>
        </footer>
      )}
    </div>
  );
}
