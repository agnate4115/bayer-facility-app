import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, CheckCircle, XCircle, Circle, Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

type TicketStatus = 'Submitted' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed' | 'Escalated';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  'Open': { label: 'Open', icon: Circle, color: BAYER_CYAN, bg: `${BAYER_CYAN}15` },
  'Submitted': { label: 'Submitted', icon: Circle, color: BAYER_CYAN, bg: `${BAYER_CYAN}15` },
  'Acknowledged': { label: 'Acknowledged', icon: Circle, color: BAYER_CYAN, bg: `${BAYER_CYAN}15` },
  'Assigned': { label: 'Assigned', icon: Clock, color: '#F59E0B', bg: '#F59E0B15' },
  'In Progress': { label: 'In Progress', icon: Clock, color: '#F59E0B', bg: '#F59E0B15' },
  'On Hold': { label: 'On Hold', icon: XCircle, color: '#EF4444', bg: '#EF444415' },
  'Resolved': { label: 'Resolved', icon: CheckCircle, color: BAYER_GREEN, bg: `${BAYER_GREEN}15` },
  'Closed': { label: 'Closed', icon: CheckCircle, color: '#6B7280', bg: '#F3F4F6' },
  'Escalated': { label: 'Escalated', icon: XCircle, color: '#EF4444', bg: '#EF444415' },
};

const priorityConfig = {
  P1: { label: 'Critical', color: '#EF4444', bg: '#EF444415' },
  P2: { label: 'High', color: '#F59E0B', bg: '#F59E0B15' },
  P3: { label: 'Low', color: BAYER_CYAN, bg: `${BAYER_CYAN}15` },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TicketHistory() {
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [officesRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/api/offices/`),
        fetch(`${API_URL}/api/tickets/`)
      ]);
      
      if (officesRes.ok) {
        setOffices(await officesRes.json());
      }
      if (ticketsRes.ok) {
        setTickets(await ticketsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOfficeName = (id: string) => {
    const off = offices.find(o => o.id === id);
    return off ? off.name : 'Unknown Office';
  };

  const filters = [
    { key: 'all' as const, label: 'All' },
    { key: 'Open', label: 'Active' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' },
    { key: 'Closed', label: 'Closed' },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const isWait = activeFilter === 'all' || 
                   (activeFilter === 'Open' && ['Open', 'Submitted', 'Acknowledged'].includes(ticket.status)) ||
                   ticket.status === activeFilter;
                   
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === '' ||
      (ticket.ai_summary && ticket.ai_summary.toLowerCase().includes(query)) ||
      ticket.id.toLowerCase().includes(query) ||
      ticket.floor.toLowerCase().includes(query) ||
      ticket.zone.toLowerCase().includes(query);
      
    return isWait && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-[#00314E] ">
          My Tickets
        </h1>
        <p className="font-body text-sm sm:text-base text-gray-600">
          View and track all your facility maintenance requests
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className="px-4 py-2 rounded-lg font-display text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all flex-shrink-0"  
              style={{ 
                backgroundColor: activeFilter === filter.key ? BAYER_GREEN : '#FFFFFF',
                color: activeFilter === filter.key ? '#FFFFFF' : '#374151',
                border: `2px solid ${activeFilter === filter.key ? BAYER_GREEN : '#E5E7EB'}` 
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-gray-200">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-gray-900">{tickets.length}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-orange-50 border border-orange-200">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">Active</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-orange-600">
            {tickets.filter(t => ['Open', 'In Progress', 'Assigned'].includes(t.status)).length}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-green-50 border border-green-200">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Resolved</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'Resolved').length}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Closed</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-gray-700">
            {tickets.filter(t => t.status === 'Closed').length}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold mb-2 text-gray-900">
              {searchQuery ? 'No tickets found' : 'No tickets yet'}
            </h3>
            <p className="font-body text-sm text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search or filter' : 'Create your first facility maintenance request'}
            </p>
            {!searchQuery && (
              <Link
                to="/app/dashboard/new-ticket"
                style={{ backgroundColor: BAYER_GREEN }}
                className="inline-flex items-center px-6 py-3 rounded-lg font-display text-sm font-semibold uppercase tracking-wide text-white transition-shadow hover:shadow-lg">
                Create Ticket
              </Link>
            )}
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusKey = ticket.status || 'Open';
            const statusInfo = statusConfig[statusKey] || statusConfig['Open'];
            const StatusIcon = statusInfo.icon;
            
            const pKey = ticket.priority as keyof typeof priorityConfig;
            const priorityStyle = priorityConfig[pKey] || priorityConfig.P3;

            return (
              <Link
                key={ticket.id}
                to={`/app/dashboard/ticket-history/${ticket.id}`}
                className="block rounded-xl p-4 sm:p-6 transition-all hover:shadow-lg bg-white border border-gray-200"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                  <span style={{ color: BAYER_GREEN }} className="font-mono text-xs sm:text-sm font-bold">
                    {ticket.id.substring(0, 13).toUpperCase()}...
                  </span>
                  <span
                    style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.color }}
                    className="self-start sm:self-auto px-3 py-1 rounded-lg font-display text-xs font-bold uppercase tracking-wider"
                  >
                    {pKey} - {priorityStyle.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-base sm:text-lg font-bold mb-3 text-[#00314E] ">
                  {ticket.ai_summary || ticket.description.substring(0, 50)}
                </h3>

                {/* Location */}
                <div className="flex items-start gap-2 mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="font-body text-sm text-gray-600">
                    {getOfficeName(ticket.office_id)} · Floor {ticket.floor}, {ticket.zone}
                  </span>
                </div>

                {/* Footer Row */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
                  <span
                    style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs font-semibold"
                  >
                    <StatusIcon size={14} />
                    {statusInfo.label}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg font-display text-xs font-medium bg-gray-100 text-gray-700">
                    {ticket.category_name || 'Uncategorized'}
                  </span>
                  <span className="ml-auto font-body text-xs text-gray-500">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Results Count */}
      {filteredTickets.length > 0 && (
        <div className="mt-6 text-center">
          <p className="font-body text-xs sm:text-sm text-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </p>
        </div>
      )}
    </div>
  );
}
