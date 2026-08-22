import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

interface Props {
  variant?: 'icon' | 'labeled';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        className={`btn btn-secondary btn-sm ${className}`.trim()}
        onClick={toggleTheme}
        aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      >
        <Icon name={isDark ? 'sun' : 'moon'} size={15} />
        <span>{isDark ? 'Giao diện sáng' : 'Giao diện tối'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-secondary btn-icon ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={16} />
    </button>
  );
}
