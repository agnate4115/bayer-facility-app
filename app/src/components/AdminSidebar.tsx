import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  QrCode,
  Star,
  Settings,
  Building2,
  LogOut,
  Users,
  ScrollText,
  X,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { currentAdmin } from '@/data/azureAdPeople';
import { useTheme } from '@/context/ThemeContext';
import BayerLogoBadge from '@/components/BayerLogoBadge';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Tickets', icon: Ticket, path: '/admin/tickets' },
  { label: 'Feedback', icon: Star, path: '/admin/feedback' },
  { label: 'Offices', icon: Building2, path: '/admin/offices' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'QR Codes', icon: QrCode, path: '/admin/qr-codes' },
  { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit-logs' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
  { label: 'People', icon: Users, path: '/admin/people' },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Desktop collapse state, persisted
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('facilitydesk-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('facilitydesk-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const handleNavClick = () => {
    onClose?.();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  // On mobile the drawer is always full-width; collapse only applies on lg+
  const width = collapsed ? '80px' : '280px';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Floating Premium Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-[100dvh] z-50 flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
          lg:p-[16px] lg:bg-transparent
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
          {/* Header */}
          <div
            className={`h-[80px] flex items-center gap-[12px] flex-shrink-0 border-b relative z-10 ${collapsed ? 'lg:px-[18px] px-[24px]' : 'px-[24px]'}`}
            style={{ borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9' }}
          >
            <BayerLogoBadge size={42} />
            <div className={`flex flex-col min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <span
                className="font-display text-[18px] font-bold tracking-tight truncate leading-tight"
                style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }}
              >
                FacilityDesk
              </span>
              <span className="font-mono text-[8px] uppercase tracking-widest font-semibold text-[#56D500] leading-tight">
                Admin Portal
              </span>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={20} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 py-[24px] px-[12px] flex flex-col gap-[6px] overflow-y-auto overflow-x-hidden z-10 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative flex items-center gap-[12px] px-[12px] py-[12px] rounded-xl transition-all duration-300 group
                    ${collapsed ? 'lg:justify-center' : ''}
                    ${active ? 'bg-gradient-to-r from-[#56D500]/15 to-transparent' : 'hover:bg-black/5 dark:hover:bg-white/[0.06]'}
                  `}
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-[#56D500] rounded-r-full shadow-[0_0_8px_rgba(86,213,0,0.5)]" />
                  )}

                  <Icon
                    size={20}
                    className="flex-shrink-0 transition-colors duration-300"
                    style={{ color: active ? '#56D500' : 'var(--text-tertiary)' }}
                  />

                  <span
                    className={`font-display text-[14px] font-semibold tracking-wide truncate transition-colors duration-300 ${collapsed ? 'lg:hidden' : ''}`}
                    style={{ color: active ? (isDark ? 'var(--text-primary)' : '#00314E') : 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions — compact */}
          <div
            className="px-[12px] py-[10px] flex flex-col gap-[6px] border-t z-10"
            style={{ borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9' }}
          >
            {/* Compact control row: theme toggle + collapse (icon buttons) */}
            <div className={`flex items-center gap-[6px] ${collapsed ? 'lg:flex-col' : ''}`}>
              <button
                onClick={toggleTheme}
                title={isDark ? 'Light mode' : 'Dark mode'}
                className="flex-1 flex items-center justify-center gap-[8px] h-[34px] rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/[0.06]"
              >
                {isDark
                  ? <Sun size={16} className="flex-shrink-0 text-[#38CFFF]" />
                  : <Moon size={16} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
                <span
                  className={`font-display text-[10px] uppercase tracking-wider font-semibold ${collapsed ? 'lg:hidden' : ''}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {isDark ? 'Light' : 'Dark'}
                </span>
              </button>

              {/* Collapse toggle (desktop only) */}
              <button
                onClick={() => setCollapsed(c => !c)}
                title={collapsed ? 'Expand' : 'Collapse'}
                className="hidden lg:flex flex-1 items-center justify-center h-[34px] rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/[0.06]"
              >
                {collapsed
                  ? <PanelLeftOpen size={16} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                  : <PanelLeftClose size={16} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
              </button>
            </div>

            {/* Logout — slim */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to log out?')) {
                  window.location.href = '/';
                }
              }}
              title={collapsed ? 'Log Out' : undefined}
              className={`w-full flex items-center gap-[10px] px-[10px] h-[34px] rounded-lg transition-all duration-200 group hover:bg-red-500/10 ${collapsed ? 'lg:justify-center' : ''}`}
            >
              <LogOut size={16} className="flex-shrink-0 transition-colors group-hover:text-red-500" style={{ color: 'var(--text-tertiary)' }} />
              <span className={`font-display text-[10px] uppercase tracking-wider font-semibold group-hover:text-red-500 transition-colors ${collapsed ? 'lg:hidden' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                Log Out
              </span>
            </button>
          </div>

          {/* Premium Azure AD Badge */}
          <div
            className={`p-[16px] border-t z-10 relative overflow-hidden group ${collapsed ? 'lg:px-[12px]' : ''}`}
            style={{
              borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9',
              backgroundColor: isDark ? 'var(--surface-dark)' : '#FFFFFF',
            }}
          >
            <div className={`flex items-center gap-[12px] relative z-10 ${collapsed ? 'lg:justify-center' : ''}`}>
              <div className="relative flex-shrink-0">
                <img
                  src={currentAdmin.profilePic}
                  alt={currentAdmin.displayName}
                  className="w-[40px] h-[40px] rounded-full border-2 border-white shadow-sm object-cover"
                  title={currentAdmin.displayName}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-[#56D500] rounded-full border-2 border-white shadow-[0_0_8px_rgba(86,213,0,0.6)]" />
              </div>

              <div className={`flex-1 min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="font-display text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentAdmin.displayName}
                </p>
                <p className="font-mono text-[8px] truncate flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  <ShieldAlert size={10} className="text-[#01BEFF]" />
                  {currentAdmin.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
