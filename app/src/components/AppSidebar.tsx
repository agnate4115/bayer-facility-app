import { useState, useEffect, type ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogOut, X, PanelLeftClose, PanelLeftOpen, Sun, Moon, ShieldAlert,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import BayerLogoBadge from '@/components/BayerLogoBadge';

export interface SidebarMenuItem {
  label: string;
  icon: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  path: string;
  /** exact match vs. prefix match for active state */
  exact?: boolean;
}

export interface SidebarUser {
  name: string;
  subtitle: string;
  avatar?: string;
  initials?: string;
}

interface AppSidebarProps {
  portalLabel: string;               // e.g. "Admin Portal"
  accent: string;                    // hex accent (green for admin, cyan for employee)
  items: SidebarMenuItem[];
  user: SidebarUser;
  storageKey: string;                // localStorage key for collapse state
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AppSidebar({
  portalLabel, accent, items, user, storageKey, isOpen = false, onClose,
}: AppSidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(storageKey) === 'true'
  );
  useEffect(() => {
    localStorage.setItem(storageKey, String(collapsed));
  }, [collapsed, storageKey]);

  const isActive = (item: SidebarMenuItem) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const width = collapsed ? '76px' : '272px';

  // Shared footer button — one consistent shape for every action row.
  const footerBtn =
    'w-full flex items-center h-[40px] rounded-lg transition-colors duration-200 ' +
    'hover:bg-black/[0.05] dark:hover:bg-white/[0.06] ' +
    (collapsed ? 'lg:justify-center lg:px-0 px-[14px] gap-[14px]' : 'px-[14px] gap-[14px]');
  const footerLabel =
    'font-display text-[11px] uppercase tracking-[0.12em] font-semibold whitespace-nowrap ' +
    (collapsed ? 'lg:hidden' : '');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-[100dvh] z-50 flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
          lg:p-[14px] lg:bg-transparent
        `}
        style={{ width }}
      >
        <div
          className="flex flex-col h-full lg:rounded-2xl lg:shadow-2xl lg:border overflow-hidden transition-all duration-300 relative"
          style={{
            backgroundColor: isDark ? 'var(--surface-mid)' : '#FFFFFF',
            borderColor: isDark ? 'var(--border-subtle)' : '#E2E8F0',
          }}
        >
          {/* ── Header ── */}
          <div
            className={`h-[76px] flex items-center flex-shrink-0 border-b relative z-10 ${collapsed ? 'lg:justify-center lg:px-0 px-[20px] gap-[12px]' : 'px-[20px] gap-[12px]'}`}
            style={{ borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9' }}
          >
            <BayerLogoBadge size={40} />
            <div className={`flex flex-col min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <span
                className="font-display text-[17px] font-bold tracking-tight truncate leading-tight"
                style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }}
              >
                FacilityDesk
              </span>
              <span
                className="font-mono text-[8px] uppercase tracking-[0.2em] font-semibold leading-tight"
                style={{ color: accent }}
              >
                {portalLabel}
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={20} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>

          {/* ── Menu ── */}
          <nav className="flex-1 py-[18px] px-[12px] flex flex-col gap-[4px] overflow-y-auto overflow-x-hidden z-10 custom-scrollbar">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative flex items-center h-[42px] rounded-xl transition-colors duration-200 group
                    ${collapsed ? 'lg:justify-center lg:px-0 px-[12px] gap-[12px]' : 'px-[12px] gap-[12px]'}
                    ${active ? '' : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'}
                  `}
                  style={active ? { backgroundColor: isDark ? `${accent}1F` : `${accent}14` } : undefined}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-r-full"
                      style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}80` }}
                    />
                  )}
                  <Icon
                    size={20}
                    className="flex-shrink-0 transition-colors duration-200"
                    style={{ color: active ? accent : 'var(--text-tertiary)' }}
                  />
                  <span
                    className={`font-display text-[14px] font-semibold tracking-wide truncate transition-colors duration-200 ${collapsed ? 'lg:hidden' : ''}`}
                    style={{ color: active ? (isDark ? 'var(--text-primary)' : '#00314E') : 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ── Footer: consistent full-width action rows ── */}
          <div
            className="px-[12px] py-[10px] flex flex-col gap-[2px] border-t z-10"
            style={{ borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9' }}
          >
            {/* Dark / Light */}
            <button onClick={toggleTheme} title={collapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined} className={footerBtn}>
              {isDark
                ? <Sun size={19} className="flex-shrink-0 text-[#38CFFF]" />
                : <Moon size={19} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
              <span className={footerLabel} style={{ color: 'var(--text-secondary)' }}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Collapse (desktop only) */}
            <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'} className={`hidden lg:flex ${footerBtn}`}>
              {collapsed
                ? <PanelLeftOpen size={19} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                : <PanelLeftClose size={19} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
              <span className={footerLabel} style={{ color: 'var(--text-secondary)' }}>
                {collapsed ? 'Expand' : 'Collapse'}
              </span>
            </button>

            {/* Log out */}
            <button
              onClick={() => { if (confirm('Are you sure you want to log out?')) window.location.href = '/'; }}
              title={collapsed ? 'Log Out' : undefined}
              className={`${footerBtn} group`}
            >
              <LogOut size={19} className="flex-shrink-0 transition-colors group-hover:text-red-500" style={{ color: 'var(--text-tertiary)' }} />
              <span className={`${footerLabel} group-hover:text-red-500 transition-colors`} style={{ color: 'var(--text-secondary)' }}>
                Log Out
              </span>
            </button>
          </div>

          {/* ── User badge ── */}
          <div
            className={`border-t z-10 relative overflow-hidden ${collapsed ? 'lg:px-0 lg:py-[14px] px-[16px] py-[14px]' : 'px-[16px] py-[14px]'}`}
            style={{
              borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9',
              backgroundColor: isDark ? 'var(--surface-dark)' : '#FFFFFF',
            }}
          >
            <div className={`flex items-center gap-[12px] ${collapsed ? 'lg:justify-center' : ''}`}>
              <div className="relative flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} title={user.name}
                    className="w-[38px] h-[38px] rounded-full border-2 border-white shadow-sm object-cover" />
                ) : (
                  <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-display text-[13px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: accent }}>
                    {user.initials}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-[13px] h-[13px] bg-[#56D500] rounded-full border-2 border-white" />
              </div>
              <div className={`flex-1 min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="font-display text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </p>
                <p className="font-mono text-[8px] truncate flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  <ShieldAlert size={10} style={{ color: accent }} />
                  {user.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
