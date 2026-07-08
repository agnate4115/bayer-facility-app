import {
  LayoutDashboard, Ticket, BarChart3, QrCode, Star, Settings,
  Building2, Users, ScrollText,
} from 'lucide-react';
import { currentAdmin } from '@/data/azureAdPeople';
import AppSidebar, { type SidebarMenuItem } from '@/components/AppSidebar';

const menuItems: SidebarMenuItem[] = [
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
  return (
    <AppSidebar
      portalLabel="Admin Portal"
      accent="#56D500"
      items={menuItems}
      storageKey="facilitydesk-sidebar-collapsed"
      isOpen={isOpen}
      onClose={onClose}
      user={{
        name: currentAdmin.displayName,
        subtitle: currentAdmin.role,
        avatar: currentAdmin.profilePic,
      }}
    />
  );
}
