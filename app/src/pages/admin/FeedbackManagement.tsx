import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Star, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

export default function FeedbackManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportPeriod, setExportPeriod] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [exportOffice, setExportOffice] = useState<string>('all');
  
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const perPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fbRes, tRes, oRes] = await Promise.all([
        fetch(`${API_URL}/api/feedback/`),
        fetch(`${API_URL}/api/tickets/`),
        fetch(`${API_URL}/api/offices/`)
      ]);
      
      if (fbRes.ok && tRes.ok && oRes.ok) {
        setFeedbacks(await fbRes.json());
        setTickets(await tRes.json());
        setOffices(await oRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCombinedData = () => {
    return feedbacks.map(fb => {
      const ticket = tickets.find(t => t.id === fb.ticket_id);
      const user = azureAdPeople.find(p => p.id === fb.user_id || p.email === ticket?.user_name || p.displayName === ticket?.user_name);
      const office = offices.find(o => o.id === ticket?.office_id);
      
      return {
        ...fb,
        ticket: ticket || null,
        office_name: office?.name || 'Unknown',
        submitted_by: user?.displayName || ticket?.user_name || 'Anonymous'
      };
    });
  };

  const combinedData = getCombinedData();

  const getFilteredData = (dataToFilter: any[], currentExportPeriod?: string) => {
    let filtered = [...dataToFilter];
    
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.comments && f.comments.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.ticket && f.ticket.assigned_to && f.ticket.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.submitted_by.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(f => f.overall_rating === parseInt(ratingFilter));
    }
    
    if (officeFilter !== 'all') {
      filtered = filtered.filter(f => f.office_name === officeFilter);
    }
    
    const applyDateFilter = (period: string) => {
      if (period === 'all') return;
      const now = new Date();
      filtered = filtered.filter(f => {
        const d = new Date(f.created_at);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        if (period === 'today') return diffDays < 1;
        if (period === 'week') return diffDays <= 7;
        if (period === 'month') return diffDays <= 30;
        if (period === 'year') return diffDays <= 365;
        return true;
      });
    };
    
    // UI filter vs Export Filter
    if (currentExportPeriod) {
      applyDateFilter(currentExportPeriod);
    } else {
      applyDateFilter(dateFilter);
    }
    
    return filtered;
  };

  const filtered = getFilteredData(combinedData);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  const avgRating = filtered.length > 0
    ? (filtered.reduce((sum, f) => sum + f.overall_rating, 0) / filtered.length).toFixed(1)
    : '0.0';

  const handleExport = () => {
    let dataToExport = combinedData;
    
    // Apply export office filter
    if (exportOffice !== 'all') {
      dataToExport = dataToExport.filter(f => f.office_name === exportOffice);
    }
    
    // Apply export date filter
    dataToExport = getFilteredData(dataToExport, exportPeriod);

    if (dataToExport.length === 0) {
      alert("No data to export for selected filters.");
      return;
    }

    const headers = ['Feedback ID', 'Ticket ID', 'Submitted By', 'Office', 'Rating', 'Resolution Quality', 'Response Time', 'Communication', 'Professionalism', 'Comments', 'What Went Well', 'Improvements', 'Date'];
    
    const rows = dataToExport.map(f => [
      f.id,
      f.ticket_id,
      f.submitted_by,
      f.office_name,
      f.overall_rating,
      f.resolution_quality || '',
      f.response_time || '',
      f.communication || '',
      f.professionalism || '',
      `"${(f.comments || '').replace(/"/g, '""')}"`,
      `"${(f.went_well || '').replace(/"/g, '""')}"`,
      `"${(f.improvements || '').replace(/"/g, '""')}"`,
      new Date(f.created_at).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportMenu(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? BAYER_GREEN : 'transparent'}
            stroke={star <= rating ? BAYER_GREEN : '#D1D5DB'}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: 'var(--surface-dark)' }}>
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--surface-dark)', minHeight: '100vh' }} className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-medium text-gray-900">
            Feedback Management
          </h1>
          <p className="font-body text-sm mt-1 text-gray-600">
            View and analyze feedback across all offices
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm text-white transition-colors" style={{ backgroundColor: BAYER_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45AA00')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BAYER_GREEN)}
          >
            <Download size={16} />
            Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
              <h3 className="font-display text-xs uppercase tracking-wider text-gray-900 mb-3">Export Options</h3>

              <div className="mb-3">
                <label className="block font-body text-xs text-gray-600 mb-2">Period</label>
                <select
                  value={exportPeriod}
                  onChange={(e) => setExportPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 font-body text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-body text-xs text-gray-600 mb-2">Office</label>
                <select
                  value={exportOffice}
                  onChange={(e) => setExportOffice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 font-body text-sm"
                >
                  <option value="all">All Offices</option>
                  {offices.map(office => (
                    <option key={office.id} value={office.name}>{office.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExport}
                style={{ backgroundColor: BAYER_GREEN }}
                className="w-full px-4 py-2 rounded-lg font-body text-sm text-white transition-colors">
                Download CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <span className="font-display text-[8px] uppercase tracking-widest text-gray-500">
            Avg Rating
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-2xl text-gray-900">{avgRating}</span>
            <Star size={20} fill={BAYER_GREEN} stroke={BAYER_GREEN} />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <span className="font-display text-[8px] uppercase tracking-widest text-gray-500">
            Total Reviews
          </span>
          <span className="block font-mono text-2xl mt-2 text-gray-900">
            {filtered.length}
          </span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <span className="font-display text-[8px] uppercase tracking-widest text-gray-500">
            5-Star Reviews
          </span>
          <span style={{ color: BAYER_GREEN }} className="block font-mono text-2xl mt-2">
            {filtered.filter(f => f.overall_rating === 5).length}
          </span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <span className="font-display text-[8px] uppercase tracking-widest text-gray-500">
            1-Star Reviews
          </span>
          <span style={{ color: '#EF4444' }} className="block font-mono text-2xl mt-2">
            {filtered.filter(f => f.overall_rating === 1).length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg flex-1 bg-white border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, technician, or submitter..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="bg-transparent outline-none font-body text-sm flex-1 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg font-body text-sm outline-none cursor-pointer bg-white border border-gray-200 text-gray-900"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select
          value={officeFilter}
          onChange={(e) => { setOfficeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg font-body text-sm outline-none cursor-pointer bg-white border border-gray-200 text-gray-900"
        >
          <option value="all">All Offices</option>
          {offices.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg font-body text-sm outline-none cursor-pointer bg-white border border-gray-200 text-gray-900"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200">
          <Calendar size={14} className="text-gray-400" />
          <span className="font-body text-sm text-gray-600">
            Showing {filtered.length} feedbacks
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Ticket ID', 'Rating', 'Submitted By', 'Technician', 'Office', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-display text-[8px] uppercase tracking-wider whitespace-nowrap text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((fb) => (
                <tr
                  key={fb.id}
                  className="transition-colors border-b border-gray-100"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <span style={{ color: BAYER_CYAN }} className="font-mono text-xs">
                      {fb.ticket_id.substring(0,8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {renderStars(fb.overall_rating)}
                      <span className="font-mono text-xs text-gray-600">
                        ({fb.overall_rating})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: BAYER_GREEN }} className="font-body text-sm font-bold">
                      {fb.submitted_by}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-600">
                    {fb.ticket?.assigned_to || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      style={{ backgroundColor: `${BAYER_CYAN}15`, color: BAYER_CYAN }}
                      className="font-display text-[8px] uppercase tracking-wider px-2 py-0.5 rounded">
                      {fb.office_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-gray-500">
                    {new Date(fb.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/feedback/${fb.id}`}
                      style={{ color: BAYER_CYAN }}
                      className="font-display text-xs uppercase tracking-wider hover:underline transition-colors">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-body text-sm">
                    No feedback found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="font-body text-xs text-gray-600">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-30 bg-white text-gray-700 border border-gray-200"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 flex items-center justify-center rounded-md font-body text-xs transition-colors" style={{
                      backgroundColor: p === page ? BAYER_GREEN : 'white',
                      color: p === page ? '#FFFFFF' : '#374151',
                      border: p === page ? 'none' : '1px solid #E5E7EB'
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-30 bg-white text-gray-700 border border-gray-200"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
