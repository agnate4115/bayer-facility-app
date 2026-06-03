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
} from 'lucide-react';
import { currentAdmin } from '@/data/azureAdPeople';

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

  const handleNavClick = () => {
    onClose?.();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
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
          lg:p-4 lg:bg-transparent
        `}
        style={{ width: '280px' }}
      >
        <div className={`
          flex flex-col h-full bg-white 
          lg:rounded-2xl lg:shadow-2xl lg:border border-slate-200 
          overflow-hidden transition-all duration-300 relative
        `}>

          {/* Header */}
          <div className="h-20 flex items-center px-6 gap-3 flex-shrink-0 border-b border-slate-100  relative z-10">
            <img src="/Bayer-Logo.wine.svg" alt="Bayer" className="h-10 w-auto flex-shrink-0 drop-shadow-sm" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-lg font-bold tracking-tight text-[#00314E]  truncate leading-tight">
                FacilityDesk
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-[#56D500] leading-tight">
                Admin Portal
              </span>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-500 " />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto z-10 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                    ${active 
                      ? 'bg-gradient-to-r from-[#56D500]/10 to-transparent' 
                      : 'hover:bg-slate-50'
                    }
                  `}
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#56D500] rounded-r-full shadow-[0_0_8px_rgba(86,213,0,0.5)]" />
                  )}
                  
                  <Icon 
                    size={20} 
                    className={`flex-shrink-0 transition-colors duration-300 ${
                      active ? 'text-[#56D500]' : 'text-slate-400 group-hover:text-slate-600'
                    }`} 
                  />
                  
                  <span className={`font-display text-sm font-semibold tracking-wide truncate transition-colors duration-300 ${
                    active ? 'text-[#00314E] ' : 'text-slate-600  group-hover:text-slate-900'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 flex flex-col gap-2 border-t border-slate-100  z-10 bg-slate-50/50 ">
            {/* Logout */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to log out?')) {
                  window.location.href = '/';
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-red-50 group border border-transparent hover:border-red-100"
            >
              <LogOut size={20} className="flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="font-display text-xs uppercase tracking-wider font-semibold text-slate-600  group-hover:text-red-600 transition-colors">Log Out</span>
            </button>
          </div>

          {/* Premium Azure AD Badge */}
          <div className="p-4 border-t border-slate-100  bg-white z-10 relative overflow-hidden group">
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#01BEFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex-shrink-0">
                <img
                  src={currentAdmin.profilePic}
                  alt={currentAdmin.displayName}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                  title={currentAdmin.displayName}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#56D500] rounded-full border-2 border-white shadow-[0_0_8px_rgba(86,213,0,0.6)]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-slate-900  truncate">
                  {currentAdmin.displayName}
                </p>
                <p className="font-mono text-[10px] text-slate-500  truncate flex items-center gap-1 mt-0.5">
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
