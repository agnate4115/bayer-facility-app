import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import PriorityIndicator from '@/components/PriorityIndicator';
import { Search, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_CYAN = '#01BEFF';

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState<any[]>([]);
  const [officesList, setOfficesList] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const perPage = 10;

  useEffect(() => {
    fetchOffices();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, priorityFilter, officeFilter]);

  const fetchOffices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/offices/`);
      if (res.ok) {
        const data = await res.json();
        setOfficesList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (priorityFilter !== 'all') queryParams.append('priority', priorityFilter);
      if (officeFilter !== 'all') queryParams.append('office_id', officeFilter);

      const res = await fetch(`${API_URL}/api/tickets/?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        
        let filtered = data;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = data.filter((t: any) => 
            t.id.toLowerCase().includes(query) ||
            (t.ai_summary && t.ai_summary.toLowerCase().includes(query)) ||
            (t.category_name && t.category_name.toLowerCase().includes(query))
          );
        }
        
        setTickets(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    setPage(1);
    fetchTickets();
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    if (statusFilter !== 'all') queryParams.append('status', statusFilter);
    if (priorityFilter !== 'all') queryParams.append('priority', priorityFilter);
    if (officeFilter !== 'all') queryParams.append('office_id', officeFilter);
    
    // Trigger download
    window.open(`${API_URL}/api/tickets/export?${queryParams.toString()}`, '_blank');
  };

  const start = (page - 1) * perPage;
  const paginated = tickets.slice(start, start + perPage);
  const totalPages = Math.ceil(tickets.length / perPage) || 1;

  // Helper to get person name
  const getAssigneeName = (id: string) => {
    if (!id) return 'Unassigned';
    const person = azureAdPeople.find(p => p.id === id);
    return person ? person.displayName : id;
  };
  
  // Helper to get office name
  const getOfficeName = (id: string) => {
    const off = officesList.find(o => o.id === id);
    return off ? off.name : 'Unknown';
  };

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }} className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-medium text-gray-900">Tickets</h1>
          <p className="font-body text-sm mt-1 text-gray-600">Manage and track all facility tickets</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm text-white transition-colors" style={{ backgroundColor: BAYER_GREEN }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45AA00')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BAYER_GREEN)}
        >
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg flex-1 bg-white border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, summary, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              className="bg-transparent outline-none font-body text-sm flex-1 text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSearchClick}
            className="px-6 py-2.5 rounded-lg font-body text-sm text-white transition-colors bg-[#01BEFF] hover:bg-[#00A0DD]"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-lg border border-gray-300 font-body text-sm text-gray-700 bg-white outline-none"
        >
          <option value="all">All Status</option>
          <option value="Open">Open</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-lg border border-gray-300 font-body text-sm text-gray-700 bg-white outline-none"
        >
          <option value="all">All Priority</option>
          <option value="P1">P1 - Critical</option>
          <option value="P2">P2 - High</option>
          <option value="P3">P3 - Low</option>
        </select>

        <select
          value={officeFilter}
          onChange={(e) => { setOfficeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-lg border border-gray-300 font-body text-sm text-gray-700 bg-white outline-none"
        >
          <option value="all">All Offices</option>
          {officesList.map((office) => (
            <option key={office.id} value={office.id}>{office.name}</option>
          ))}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F8F9FA' }}>
              <tr>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">Summary</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">Office</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-gray-600">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 size={24} className="animate-spin text-[#01BEFF] mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading tickets...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/tickets/${ticket.id}`} style={{ color: BAYER_CYAN }} className="font-mono text-xs font-bold hover:underline" title={ticket.id}>
                        {ticket.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-sm font-semibold text-gray-900">
                        {ticket.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={ticket.ai_summary}>
                      <span className="font-body text-sm text-gray-700">
                        {ticket.ai_summary || ticket.description.substring(0, 30)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityIndicator priority={ticket.priority} showLabel={false} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-sm text-gray-700">{getOfficeName(ticket.office_id)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-sm text-gray-700">{getAssigneeName(ticket.assigned_to)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="font-body text-sm text-gray-600">
          Showing {tickets.length} tickets
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="font-body text-sm text-gray-700 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

    </div>
  );
}
