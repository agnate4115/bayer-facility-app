import { useState, useEffect } from 'react';
import {
import { API_URL } from '@/config';
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Clock,
  User,
  Ticket,
  Building2,
  QrCode,
  Star,
  Monitor,
  FileText,
  LogIn,
  LogOut,
  UserPlus,
  Trash2,
  Eye,
  Edit3,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Activity,
  Shield,
  Calendar,
} from 'lucide-react';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  userAvatar: string;
  action: string;
  actionType: 'Create' | 'Update' | 'Delete' | 'View' | 'Export' | 'Login' | 'Logout' | 'Assign' | 'Escalate';
  entity: string;
  entityType: 'Ticket' | 'User' | 'Office' | 'QR Code' | 'Feedback' | 'System' | 'Report';
  details: string;
}

function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00314E&color=fff&size=64&bold=true`;
}

// Removed mockAuditLogs

const getActionIcon = (actionType: string) => {
  const icons: Record<string, typeof Activity> = {
    Create: UserPlus,
    Update: Edit3,
    Delete: Trash2,
    View: Eye,
    Export: ArrowUpRight,
    Login: LogIn,
    Logout: LogOut,
    Assign: Users,
    Escalate: AlertTriangle,
  };
  return icons[actionType] || Activity;
};

const getActionColor = (actionType: string): string => {
  const colors: Record<string, string> = {
    Create: '#22C55E',
    Update: '#3B82F6',
    Delete: '#EF4444',
    View: '#6B7280',
    Export: '#8B5CF6',
    Login: '#22C55E',
    Logout: '#9CA3AF',
    Assign: '#F59E0B',
    Escalate: '#EF4444',
  };
  return colors[actionType] || '#6B7280';
};

const getEntityIcon = (entityType: string) => {
  const icons: Record<string, typeof Ticket> = {
    Ticket: Ticket,
    User: User,
    Office: Building2,
    'QR Code': QrCode,
    Feedback: Star,
    System: Monitor,
    Report: FileText,
  };
  return icons[entityType] || FileText;
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const perPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/audit-logs/`);
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user_name)));
  const uniqueActionTypes = Array.from(new Set(logs.map(log => log.action_type)));
  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entity_type)));

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action_type !== actionFilter) return false;
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
    if (userFilter !== 'all' && log.user_name !== userFilter) return false;
    if (dateFrom) {
      if (new Date(log.timestamp) < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(log.timestamp) > toDate) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.user_name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        log.user_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const formatTimeOnly = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const handleExportToExcel = () => {
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Action Type', 'Entity', 'Entity Type', 'Details'];
    const rows = filtered.map(log => [
      formatTimestamp(log.timestamp), log.user_name, log.user_email, log.action, log.action_type, log.entity, log.entity_type, log.details || '',
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div   style={{ minHeight: '100vh' }} className="p-4 sm:p-6 lg:p-8 bg-slate-50 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-semibold text-[#00314E] ">
            Audit Logs
          </h1>
          <p className="font-body text-sm mt-1 text-slate-500 ">
            Complete activity trail — every action tracked in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('timeline')}
              className="px-3 py-2 font-display text-[10px] uppercase tracking-wider transition-colors"  style={{ backgroundColor: viewMode === 'timeline' ? BAYER_BLUE : '#FFFFFF',
                color: viewMode === 'timeline' ? '#FFFFFF' : '#6B7280' }}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="px-3 py-2 font-display text-[10px] uppercase tracking-wider transition-colors"  style={{ backgroundColor: viewMode === 'table' ? BAYER_BLUE : '#FFFFFF',
                color: viewMode === 'table' ? '#FFFFFF' : '#6B7280' }}
            >
              Table
            </button>
          </div>
          <button
            onClick={handleExportToExcel}
              style={{ backgroundColor: BAYER_GREEN }}
           className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-[10px] uppercase tracking-wider font-semibold text-white transition-colors">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: `${BAYER_CYAN}10` }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Activity size={18}  style={{ color: BAYER_CYAN }} />
            </div>
          </div>
          <span className="font-mono text-2xl font-bold text-[#00314E] ">{filtered.length}</span>
          <p className="font-body text-xs mt-1 text-gray-500">Total Logs</p>
        </div>
        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: `${BAYER_GREEN}15` }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Users size={18}  style={{ color: BAYER_GREEN }} />
            </div>
          </div>
          <span className="font-mono text-2xl font-bold text-[#00314E] ">{new Set(filtered.map(l => l.user_name)).size}</span>
          <p className="font-body text-xs mt-1 text-gray-500">Unique Users</p>
        </div>
        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: '#F59E0B10' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Clock size={18}  style={{ color: '#F59E0B' }} />
            </div>
          </div>
          <span className="font-mono text-2xl font-bold text-[#00314E] ">
            {filtered.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
          </span>
          <p className="font-body text-xs mt-1 text-gray-500">Today's Actions</p>
        </div>
        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: '#EF444410' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Shield size={18}  style={{ color: '#EF4444' }} />
            </div>
          </div>
          <span   style={{ color: '#EF4444' }} className="font-mono text-2xl font-bold">
            {filtered.filter(l => l.action_type === 'Delete' || l.action_type === 'Escalate').length}
          </span>
          <p className="font-body text-xs mt-1 text-gray-500">Critical Actions</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl p-5 mb-6 bg-white  border border-slate-200 ">
        <div   style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, action, entity, or details..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="bg-transparent outline-none font-body text-sm flex-1 text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <span className="font-display text-[10px] uppercase tracking-wider text-gray-500">Filters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]">
            <option value="all">All Actions</option>
            {uniqueActionTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]">
            <option value="all">All Entities</option>
            {uniqueEntityTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]">
            <option value="all">All Users</option>
            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex-1 min-w-0 px-2 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-[#01BEFF]" />
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex-1 min-w-0 px-2 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-[#01BEFF]" />
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-3">
          {paginated.map((log, idx) => {
            const ActionIcon = getActionIcon(log.action_type);
            const EntityIcon = getEntityIcon(log.entity_type);
            const actionColor = getActionColor(log.action_type);

            return (
              <div
                key={log.id}
                className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md group bg-white  border border-slate-200 "
              >
                <div className="flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <div
                        style={{ backgroundColor: `${actionColor}12` }}
                     className="w-10 h-10 rounded-xl flex items-center justify-center">
                      <ActionIcon size={18}  style={{ color: actionColor }} />
                    </div>
                    {idx < paginated.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Action Title */}
                        <p className="font-body text-sm font-semibold text-gray-900">
                          {log.action}
                        </p>
                        {/* Details */}
                        <p className="font-body text-xs text-gray-500 mt-1 leading-relaxed">
                          {log.details}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Clock size={12} className="text-gray-400" />
                        <span className="font-mono text-[11px] text-gray-400 whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {/* User */}
                      <div className="flex items-center gap-2">
                        <img src={log.user_avatar} alt={log.user_name} className="w-5 h-5 rounded-full" />
                        <span className="font-body text-xs font-medium text-gray-700">{log.user_name}</span>
                      </div>

                      {/* Action Type Badge */}
                      <span
                          style={{ backgroundColor: `${actionColor}12`, color: actionColor }}
                       className="font-display text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md font-semibold">
                        {log.action_type}
                      </span>

                      {/* Entity */}
                      <div className="flex items-center gap-1.5">
                        <EntityIcon size={12} className="text-gray-400" />
                        <span   style={{ color: BAYER_CYAN }} className="font-mono text-[11px]">
                          {log.entity}
                        </span>
                        <span className="font-body text-[10px] text-gray-400">({log.entity_type})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl overflow-hidden bg-white  border border-slate-200 ">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr  style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E1E8ED' }}>
                  <th className="text-left px-4 py-3 font-display text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap">Time</th>
                  <th className="text-left px-4 py-3 font-display text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap">User</th>
                  <th className="text-left px-4 py-3 font-display text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap">Action</th>
                  <th className="text-left px-4 py-3 font-display text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap">Entity</th>
                  <th className="text-left px-4 py-3 font-display text-[10px] uppercase tracking-wider text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => {
                  const actionColor = getActionColor(log.action_type);
                  return (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <img src={log.user_avatar} alt={log.user_name} className="w-6 h-6 rounded-full" />
                          <div>
                            <span className="font-body text-sm text-gray-900 block">{log.user_name}</span>
                            <span className="font-body text-[10px] text-gray-400">{log.user_email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-body text-sm text-gray-900 block">{log.action}</span>
                        <span
                            style={{ backgroundColor: `${actionColor}12`, color: actionColor }}
                         className="font-display text-[9px] uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 font-semibold">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span   style={{ color: BAYER_CYAN }} className="font-mono text-xs block">{log.entity}</span>
                        <span className="font-body text-[10px] text-gray-400">{log.entity_type}</span>
                      </td>
                      <td className="px-4 py-3.5 font-body text-xs text-gray-600 max-w-xs">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty / Loading State */}
      {isLoading ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#56D500] mx-auto mb-4"></div>
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">Loading audit logs...</h3>
          <p className="font-body text-sm text-gray-500">Please wait while we fetch the latest records</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
          <Activity size={48} className="mx-auto mb-3 text-gray-300" />
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">No logs found</h3>
          <p className="font-body text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <span className="font-body text-xs text-gray-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-30 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg font-body text-xs transition-colors"  style={{ backgroundColor: pageNum === page ? BAYER_GREEN : 'white',
                    color: pageNum === page ? '#FFFFFF' : '#374151',
                    border: pageNum === page ? 'none' : '1px solid #E5E7EB' }}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-30 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
