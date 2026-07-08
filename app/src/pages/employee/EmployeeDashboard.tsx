import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, LogOut, Ticket, History, MessageSquare, FileText, ChevronRight, CheckCircle, Home, Sun, Moon, Briefcase, Loader2 } from 'lucide-react';
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
import BayerLogoBadge from '@/components/BayerLogoBadge';

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

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { path: '/app/dashboard', icon: Home, label: 'Home' },
    { path: '/app/dashboard/new-ticket', icon: Ticket, label: 'New Ticket' },
    { path: '/app/dashboard/ticket-history', icon: History, label: 'My Tickets' },
    { path: '/app/dashboard/feedback', icon: MessageSquare, label: 'Feedback' },
    { path: '/app/dashboard/feedback-history', icon: FileText, label: 'My Feedbacks' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
          lg:p-4 lg:bg-transparent
        `}
        style={{ width: '280px' }}
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
            className="h-20 flex items-center px-6 gap-3 flex-shrink-0 border-b relative z-10"
            style={{ borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9' }}
          >
            <BayerLogoBadge size={42} />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-lg font-bold tracking-tight truncate leading-tight" style={{ color: isDark ? 'var(--text-primary)' : '#00314E' }}>
                FacilityDesk
              </span>
              <span className="font-mono text-[8px] uppercase tracking-widest font-semibold text-[#01BEFF] leading-tight">
                Employee Portal
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
          <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto z-10 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                    ${active ? 'bg-gradient-to-r from-[#56D500]/15 to-transparent' : 'hover:bg-black/5 dark:hover:bg-white/[0.06]'}
                  `}
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#56D500] rounded-r-full shadow-[0_0_8px_rgba(86,213,0,0.5)]" />
                  )}

                  <Icon
                    size={20}
                    className="flex-shrink-0 transition-colors duration-300"
                    style={{ color: active ? '#56D500' : 'var(--text-tertiary)' }}
                  />

                  <span
                    className="font-display text-sm font-semibold tracking-wide truncate transition-colors duration-300"
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
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="w-full flex items-center justify-center gap-[8px] h-[34px] rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/[0.06]"
            >
              {isDark
                ? <Sun size={16} className="flex-shrink-0 text-[#38CFFF]" />
                : <Moon size={16} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
              <span className="font-display text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Logout — slim */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to log out?')) {
                  window.location.href = '/';
                }
              }}
              className="w-full flex items-center gap-[10px] px-[10px] h-[34px] rounded-lg transition-all duration-200 group hover:bg-red-500/10"
            >
              <LogOut size={16} className="flex-shrink-0 transition-colors group-hover:text-red-500" style={{ color: 'var(--text-tertiary)' }} />
              <span className="font-display text-[10px] uppercase tracking-wider font-semibold group-hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>Log Out</span>
            </button>
          </div>

          {/* Premium Azure AD Badge */}
          <div
            className="p-4 border-t z-10 relative overflow-hidden group"
            style={{
              borderColor: isDark ? 'var(--border-subtle)' : '#F1F5F9',
              backgroundColor: isDark ? 'var(--surface-dark)' : '#FFFFFF',
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex-shrink-0">
                <img
                  src={currentEmployee.profilePic}
                  alt={currentEmployee.displayName}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                  title={currentEmployee.displayName}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#56D500] rounded-full border-2 border-white shadow-[0_0_8px_rgba(86,213,0,0.6)]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentEmployee.displayName}
                </p>
                <p className="font-mono text-[8px] truncate flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  <Briefcase size={10} className="text-[#56D500]" />
                  {currentEmployee.department}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
