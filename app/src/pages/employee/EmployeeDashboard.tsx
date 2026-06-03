import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, LogOut, Ticket, History, MessageSquare, FileText, ChevronRight, ChevronLeft, CheckCircle, Home, Sun, Moon, Briefcase, MapPin, Mail, Hash, Loader2 } from 'lucide-react';
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
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

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
        <div className="flex flex-col h-full bg-white lg:rounded-2xl lg:shadow-2xl lg:border border-slate-200 overflow-hidden transition-all duration-300 relative">

          {/* Header */}
          <div className="h-20 flex items-center px-6 gap-3 flex-shrink-0 border-b border-slate-100 relative z-10">
            <img src="/Bayer-Logo.wine.svg" alt="Bayer" className="h-10 w-auto flex-shrink-0 drop-shadow-sm" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-lg font-bold tracking-tight text-[#00314E] truncate leading-tight">
                FacilityDesk
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-[#01BEFF] leading-tight">
                Employee Portal
              </span>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-500" />
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
                    active ? 'text-[#00314E]' : 'text-slate-600 group-hover:text-slate-900'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 flex flex-col gap-2 border-t border-slate-100 z-10 bg-slate-50/50">
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
              <span className="font-display text-xs uppercase tracking-wider font-semibold text-slate-600 group-hover:text-red-600 transition-colors">Log Out</span>
            </button>
          </div>

          {/* Premium Azure AD Badge */}
          <div className="p-4 border-t border-slate-100 bg-white z-10 relative overflow-hidden group">
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#56D500]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
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
                <p className="font-display text-sm font-bold text-slate-900 truncate">
                  {currentEmployee.displayName}
                </p>
                <p className="font-mono text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
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
        <p className="font-body text-sm text-gray-500 mb-1">{greeting}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1 text-[#00314E] ">
          {mockUser.name}
        </h1>
        <p className="font-body text-sm text-gray-600">
          {mockUser.designation} · {mockUser.department}
        </p>
      </div>

      {/* Stats Overview - Top Priority */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-3xl font-bold text-[#00314E] ">{totalRequests}</span>
            <Ticket size={18} className="text-gray-400" />
          </div>
          <p className="font-body text-sm font-medium text-gray-700">Total Requests</p>
          <p className="font-body text-xs text-gray-500 mt-1">Overall</p>
        </div>

        <div   style={{ backgroundColor: '#FFF7ED' }} className="bg-white rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-3xl font-bold text-orange-600">{activeRequests}</span>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <p className="font-body text-sm font-medium text-gray-900">Active</p>
          <p className="font-body text-xs text-gray-600 mt-1">In progress</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-baseline justify-between mb-1">
            <span   style={{ color: BAYER_GREEN }} className="font-display text-3xl font-bold">{resolvedRequests}</span>
            <CheckCircle size={18}  style={{ color: BAYER_GREEN }} />
          </div>
          <p className="font-body text-sm font-medium text-gray-700">Resolved</p>
          <p className="font-body text-xs text-gray-500 mt-1">{resolutionRate}% resolution rate</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-baseline justify-between mb-1">
            <span   style={{ color: BAYER_CYAN }} className="font-display text-3xl font-bold">{totalFeedbacks}</span>
            <MessageSquare size={18} className="text-gray-400" />
          </div>
          <p className="font-body text-sm font-medium text-gray-700">Feedbacks</p>
          <p className="font-body text-xs text-gray-500 mt-1">Total submitted</p>
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
            className="group flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <History size={22}  style={{ color: BAYER_CYAN }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-gray-900">My Tickets</h3>
              <p className="font-body text-xs text-gray-600">Track requests</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/app/dashboard/feedback"
            className="group flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-50 group-hover:bg-amber-100 transition-colors">
              <MessageSquare size={22} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-gray-900">Give Feedback</h3>
              <p className="font-body text-xs text-gray-600">Rate service</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/app/dashboard/feedback-history"
            className="group flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <FileText size={22} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-gray-900">My Feedbacks</h3>
              <p className="font-body text-xs text-gray-600">Past feedback</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentTickets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-base font-bold text-gray-900">Recent Activity</h3>
            <Link to="/app/dashboard/ticket-history"   style={{ color: BAYER_CYAN }} className="font-body text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentTickets.map((t, index) => (
              <div key={t.id} className={`flex items-start gap-3 pb-4 ${index !== recentTickets.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  t.status === 'Resolved' || t.status === 'Closed' ? 'bg-[#56D500]' :
                  t.status === 'In Progress' ? 'bg-orange-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-gray-900">Ticket <span className="font-mono font-semibold">{t.id.substring(0,8).toUpperCase()}</span> - {t.status}</p>
                  <p className="font-body text-xs text-gray-500 mt-0.5 truncate">{t.description.substring(0,50)} — {new Date(t.updated_at || t.created_at).toLocaleDateString()}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} className="text-[#00314E] " />
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
