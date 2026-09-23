import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ROLE_PERMISSIONS,
  type RolePermissions,
  type UserRole,
} from '../lib/rolePermissions';
import { fetchMe, loginRequest } from '../services/gisApi';
import {
  USER_KEY,
  clearStoredAuth,
  getStoredToken,
  setStoredToken,
} from '../lib/authStorage';

export type { UserRole, RolePermissions };
export { ROLE_PERMISSIONS };
export { getStoredToken };

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  cooperativeName?: string;
  phone?: string;
  avatarLetter: string;
  portalBadge: string;
  portalDesc: string;
}

const ROLE_META: Record<
  UserRole,
  Pick<AuthUser, 'roleTitle' | 'portalBadge' | 'portalDesc'>
> = {
  ADMIN: {
    roleTitle: 'Chi Cục Trưởng · Chi Cục Trồng Trọt & BVTV Lâm Đồng',
    portalBadge: 'CỔNG QUẢN LÝ NHÀ NƯỚC',
    portalDesc:
      'Giám sát quy hoạch vĩ mô, phê duyệt vùng trồng & cảnh báo dịch tễ toàn tỉnh',
  },
  HTX_FARMER: {
    roleTitle: 'Chủ Nhiệm Hợp Tác Xã & Đại Diện Nông Dân',
    portalBadge: 'CỔNG HỢP TÁC XÃ / NÔNG DÂN',
    portalDesc:
      'Quản lý thửa đất canh tác thành viên, nhật ký luân canh & lập phiếu xuất kho BATCH',
  },
};

export function mapApiUser(raw: {
  id: string;
  username: string;
  name: string;
  role: string;
  phone?: string | null;
  cooperativeName?: string | null;
  cooperative_name?: string | null;
}): AuthUser {
  const role: UserRole = raw.role === 'HTX_FARMER' ? 'HTX_FARMER' : 'ADMIN';
  const meta = ROLE_META[role];
  return {
    id: raw.id,
    username: raw.username,
    name: raw.name,
    role,
    roleTitle: meta.roleTitle,
    cooperativeName: raw.cooperativeName ?? raw.cooperative_name ?? undefined,
    phone: raw.phone ?? undefined,
    avatarLetter: (raw.name || raw.username).charAt(0).toUpperCase(),
    portalBadge: meta.portalBadge,
    portalDesc: meta.portalDesc,
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole;
  isAdmin: boolean;
  isFarmer: boolean;
  ready: boolean;
  permissions: RolePermissions;
  can: (action: keyof RolePermissions) => boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof localStorage === 'undefined' ? null : readStoredUser(),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    void fetchMe()
      .then((me) => {
        const mapped = mapApiUser(me);
        setUser(mapped);
        localStorage.setItem(USER_KEY, JSON.stringify(mapped));
      })
      .catch(() => {
        clearStoredAuth();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginRequest(username, password);
    setStoredToken(data.access_token);
    const mapped = mapApiUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(mapped));
    setUser(mapped);
    return mapped;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const role: UserRole = user?.role ?? 'ADMIN';
  const isAdmin = !!user && role === 'ADMIN';
  const isFarmer = !!user && role === 'HTX_FARMER';
  const permissions = ROLE_PERMISSIONS[role];

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isAdmin,
      isFarmer,
      ready,
      permissions,
      can: (action) => (user ? permissions[action] : false),
      login,
      logout,
    }),
    [user, role, isAdmin, isFarmer, ready, permissions, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
