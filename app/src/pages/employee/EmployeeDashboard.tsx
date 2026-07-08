import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Menu, Ticket, History, MessageSquare, FileText, ChevronRight, CheckCircle, Home, Loader2 } from 'lucide-react';
import NewTicket from './NewTicket';
import TicketHistory from './TicketHistory';
import TicketDetail from './TicketDetail';
import FeedbackHistory from './FeedbackHistory';
import FeedbackForm from './FeedbackForm';
import FeedbackDetail from './FeedbackDetail';
import EditFeedback from './EditFeedback';
import { useTheme } from '@/context/ThemeContext';
import { currentEmployee, azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';
import AppSidebar, { type SidebarMenuItem } from '@/components/AppSidebar';

const employeeMenu: SidebarMenuItem[] = [
  { path: '/app/dashboard', icon: Home, label: 'Home', exact: true },
  { path: '/app/dashboard/new-ticket', icon: Ticket, label: 'New Ticket', exact: true },
  { path: '/app/dashboard/ticket-history', icon: History, label: 'My Tickets' },
  { path: '/app/dashboard/feedback', icon: MessageSquare, label: 'Feedback', exact: true },
  { path: '/app/dashboard/feedback-history', icon: FileText, label: 'My Feedbacks' },
];

// Mock user data - sourced from Azure AD
const mockUser = {
  name: currentEmployee.displayName,
  email: currentEmployee.email,
  profilePic: currentEmployee.profilePic,
  designation: currentEmployee.designation,
  department: currentEmployee.department,
  office: currentEmployee.office,
  employeeId: currentEmployee.employeeId,
};

// Bayer colors
const BAYER_GREEN = '#56D500';
const BAYER_CYAN = '#01BEFF';

function DashboardHome() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardStyle = {
    backgroundColor: 'var(--surface-mid)',
    borderColor: 'var(--border-subtle)',
  };

  const [tickets, setTickets] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = azureAdPeople.find(p => p.email === mockUser.email || p.displayName === mockUser.name);
        const user_id = currentUser ? currentUser.id : "user-123";

        const [tRes, fRes] = await Promise.all([
          fetch(`${API_URL}/api/tickets/`),
          fetch(`${API_URL}/api/feedback/?user_id=${user_id}`)
        ]);

        if (tRes.ok) {
          const allTickets = await tRes.json();
          setTickets(allTickets.filter((t: any) => t.user_id === user_id || t.user_name === mockUser.name));
        }
        if (fRes.ok) {
          setFeedbacks(await fRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRequests = tickets.length;
  const activeRequests = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedRequests = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const resolutionRate = totalRequests > 0 ? Math.round((resolvedRequests / totalRequests) * 100) : 0;
  const totalFeedbacks = feedbacks.length;

  const recentTickets = [...tickets].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()).slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <p className="font-body text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>{greeting}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1" style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }}>
          {mockUser.name}
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
          {mockUser.designation} · {mockUser.department}
        </p>
      </div>

      {/* Stats Overview - Top Priority */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl p-5 border" style={cardStyle}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-3xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }}>{totalRequests}</span>
            <Ticket size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="font-body text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Requests</p>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Overall</p>
        </div>

        <div className="rounded-xl p-5 border-2" style={{ backgroundColor: isDark ? 'rgba(249,115,22,0.08)' : '#FFF7ED', borderColor: isDark ? 'rgba(249,115,22,0.3)' : '#FED7AA' }}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-3xl font-bold" style={{ color: isDark ? '#FB923C' : '#EA580C' }}>{activeRequests}</span>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <p className="font-body text-sm font-medium" style={{ color: isDark ? 'var(--text-primary)' : '#111827' }}>Active</p>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>In progress</p>
        </div>

        <div className="rounded-xl p-5 border" style={cardStyle}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-3xl font-bold" style={{ color: BAYER_GREEN }}>{resolvedRequests}</span>
            <CheckCircle size={18} style={{ color: BAYER_GREEN }} />
          </div>
          <p className="font-body text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Resolved</p>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{resolutionRate}% resolution rate</p>
        </div>

        <div className="rounded-xl p-5 border" style={cardStyle}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-3xl font-bold" style={{ color: BAYER_CYAN }}>{totalFeedbacks}</span>
            <MessageSquare size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="font-body text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Feedbacks</p>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Total submitted</p>
        </div>
      </div>

      {/* Primary Action + Quick Access */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Primary CTA */}
        <Link
          to="/app/dashboard/new-ticket"
          style={{ background: `linear-gradient(135deg, ${BAYER_GREEN} 0%, #45b000 100%)` }}
          className="lg:col-span-2 group relative overflow-hidden rounded-2xl p-8 sm:p-10 transition-all hover:shadow-2xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-white">Quick Action</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
              Report an Issue
            </h2>
            <p className="font-body text-sm text-white/90 mb-6 max-w-md">
              Submit a facilities maintenance request. We'll route it to the right team and keep you updated.
            </p>
            <div className="inline-flex items-center gap-2 text-white font-display text-sm font-semibold">
              <span>Create ticket</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        </Link>

        {/* Secondary Actions Compact */}
        <div className="flex flex-col gap-3">
          <Link
            to="/app/dashboard/ticket-history"
            className="group flex items-center gap-4 rounded-xl p-5 border transition-all hover:shadow-md"
            style={cardStyle}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(1,190,255,0.12)' : '#EFF6FF' }}>
              <History size={22} style={{ color: BAYER_CYAN }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>My Tickets</h3>
              <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>Track requests</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} className="group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/app/dashboard/feedback"
            className="group flex items-center gap-4 rounded-xl p-5 border transition-all hover:shadow-md"
            style={cardStyle}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB' }}>
              <MessageSquare size={22} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Give Feedback</h3>
              <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>Rate service</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} className="group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/app/dashboard/feedback-history"
            className="group flex items-center gap-4 rounded-xl p-5 border transition-all hover:shadow-md"
            style={cardStyle}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? 'var(--surface-light)' : '#F3F4F6' }}>
              <FileText size={22} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>My Feedbacks</h3>
              <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>Past feedback</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} className="group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentTickets.length > 0 && (
        <div className="rounded-xl border p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            <Link to="/app/dashboard/ticket-history" style={{ color: BAYER_CYAN }} className="font-body text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentTickets.map((t, index) => (
              <div key={t.id} className="flex items-start gap-3 pb-4" style={{ borderBottom: index !== recentTickets.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  t.status === 'Resolved' || t.status === 'Closed' ? 'bg-[#56D500]' :
                  t.status === 'In Progress' ? 'bg-orange-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm" style={{ color: 'var(--text-primary)' }}>Ticket <span className="font-mono font-semibold">{t.id.substring(0,8).toUpperCase()}</span> - {t.status}</p>
                  <p className="font-body text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>{t.description.substring(0,50)} — {new Date(t.updated_at || t.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="dashboard-shell min-h-screen flex" style={{ backgroundColor: isDark ? 'var(--surface-dark)' : '#F9FAFB' }}>
      <AppSidebar
        portalLabel="Employee Portal"
        accent="#01BEFF"
        items={employeeMenu}
        storageKey="facilitydesk-emp-sidebar-collapsed"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={{
          name: currentEmployee.displayName,
          subtitle: currentEmployee.department,
          avatar: currentEmployee.profilePic,
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="border-b px-6 py-4 lg:hidden"
          style={{
            backgroundColor: isDark ? 'var(--surface-mid)' : '#FFFFFF',
            borderColor: isDark ? 'var(--border-subtle)' : '#E5E7EB',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Menu size={24} style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }} />
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/new-ticket" element={<NewTicket user={mockUser} />} />
            <Route path="/ticket-history" element={<TicketHistory />} />
            <Route path="/ticket-history/:id" element={<TicketDetail />} />
            <Route path="/feedback" element={<FeedbackForm user={mockUser} />} />
            <Route path="/feedback-history" element={<FeedbackHistory />} />
            <Route path="/feedback-history/:id" element={<FeedbackDetail user={mockUser} />} />
            <Route path="/edit-feedback/:id" element={<EditFeedback />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export { mockUser };
