import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      className="flex min-h-screen ]"
      style={{ backgroundColor: theme === 'dark' ? undefined : '#F5F7FA' }}
    >
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b ] (210,20%,20%)]"
          style={{
            backgroundColor: theme === 'dark' ? undefined : '#FFFFFF',
            borderColor: theme === 'dark' ? undefined : '#E1E8ED',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 :bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={22} style={{ color: '#00314E' }}  />
          </button>
          <img src="/Bayer-Logo.wine.png" alt="Bayer" className="h-8 w-auto" />
          <span className="font-display text-sm font-semibold " style={{ color: theme === 'dark' ? undefined : '#00314E' }}>
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
