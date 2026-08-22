import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'HTX' | 'FARMER';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  cooperativeName?: string;
  phone?: string;
  avatarLetter: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: 'usr-admin-01',
    username: 'admin_gis',
    name: 'Nguyễn Thanh Hùng',
    role: 'ADMIN',
    roleTitle: 'Chi Cục Trồng Trọt & BVTV Lâm Đồng',
    phone: '0263 3822 567',
    avatarLetter: 'A',
  },
  HTX: {
    id: 'usr-htx-01',
    username: 'htx_caudat',
    name: 'K\'Brông',
    role: 'HTX',
    roleTitle: 'Chủ nhiệm Hợp tác xã',
    cooperativeName: 'HTX Cà Phê Cầu Đất Farm',
    phone: '0977 412 550',
    avatarLetter: 'K',
  },
  FARMER: {
    id: 'usr-farmer-01',
    username: 'farmer_mai',
    name: 'Trần Thị Mai',
    role: 'FARMER',
    roleTitle: 'Nông dân canh tác',
    cooperativeName: 'HTX Rau Sạch Vạn Thành GreenFarm',
    phone: '0903 889 912',
    avatarLetter: 'M',
  },
};

interface AuthContextValue {
  user: AuthUser;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  login: (username: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = 'agri_gis_user_role';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ADMIN' || saved === 'HTX' || saved === 'FARMER') {
      return saved;
    }
    return 'HTX'; // Mặc định là K'Brông (Chủ HTX)
  });

  const user = DEMO_ACCOUNTS[role];

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem(STORAGE_KEY, newRole);
  };

  const login = (username: string): boolean => {
    const found = Object.values(DEMO_ACCOUNTS).find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
    );
    if (found) {
      switchRole(found.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    switchRole('FARMER');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  return (
    <AuthContext.Provider value={{ user, role, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
