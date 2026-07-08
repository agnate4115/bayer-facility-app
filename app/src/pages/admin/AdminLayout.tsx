import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="dashboard-shell flex min-h-screen"
      style={{ backgroundColor: isDark ? 'var(--surface-dark)' : '#F5F7FA' }}
    >
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div
          className="lg:hidden flex items-center gap-[12px] px-[16px] py-[12px] border-b"
          style={{
            backgroundColor: isDark ? 'var(--surface-mid)' : '#FFFFFF',
            borderColor: isDark ? 'var(--border-subtle)' : '#E1E8ED',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-[8px] rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Menu size={22} style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }} />
          </button>
          <img src="/Bayer-Logo.wine.png" alt="Bayer" className="h-[32px] w-auto" />
          <span
            className="font-display text-[14px] font-semibold"
            style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }}
          >
            FacilityDesk
          </span>
        </div>

        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
