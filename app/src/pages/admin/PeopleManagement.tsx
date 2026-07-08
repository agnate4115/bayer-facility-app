import { useState } from 'react';
import { Search, Filter, Users, Shield, UserCheck, UserX, Mail, Briefcase, MapPin, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { azureAdPeople, type AzureAdPerson } from '@/data/azureAdPeople';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

function PersonCard({ person }: { person: AzureAdPerson }) {
  const roleColors: Record<string, { bg: string; text: string }> = {
    'Super Admin': { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' },
    'Admin': { bg: `${BAYER_CYAN}15`, text: BAYER_CYAN },
    'Employee': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280' },
  };

  const statusColor = person.status === 'Active' ? '#22C55E' : '#EF4444';
  const colors = roleColors[person.role] || roleColors['Employee'];

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md group bg-white  border border-slate-200 "
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={person.profilePic}
            alt={person.displayName}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div
              style={{ backgroundColor: statusColor }}
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-body text-sm font-bold text-gray-900 truncate">
                {person.displayName}
              </h3>
              <p className="font-body text-xs text-gray-500 truncate">
                {person.designation}
              </p>
            </div>
            <span
                style={{ backgroundColor: colors.bg, color: colors.text }}
             className="font-display text-[7px] uppercase tracking-widest px-2.5 py-1 rounded-md font-semibold flex-shrink-0">
              {person.role}
            </span>
          </div>

          {/* Details */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
              <span className="font-body text-[9px] text-gray-600 truncate">{person.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span className="font-body text-[9px] text-gray-600 truncate">{person.office} Office</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-gray-400 flex-shrink-0" />
              <span className="font-body text-[9px] text-gray-500 truncate">{person.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={12} className="text-gray-400 flex-shrink-0" />
              <span className="font-mono text-[8px] text-gray-400 truncate">{person.employeeId}</span>
            </div>
          </div>

          {/* Teams Team Name */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-body text-[8px] text-gray-400 truncate">
                Teams: {person.teamsTeamName}
              </span>
              <span
                  style={{ backgroundColor: person.status === 'Active' ? '#22C55E15' : '#EF444415',
                  color: person.status === 'Active' ? '#16A34A' : '#DC2626' }}
               className="font-display text-[7px] uppercase tracking-wider px-2 py-0.5 rounded font-medium">
                {person.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PeopleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const uniqueDepartments = Array.from(new Set(azureAdPeople.map(p => p.department))).sort();
  const uniqueOffices = Array.from(new Set(azureAdPeople.map(p => p.office))).sort();

  const filtered = azureAdPeople.filter((person) => {
    if (roleFilter !== 'all' && person.role !== roleFilter) return false;
    if (departmentFilter !== 'all' && person.department !== departmentFilter) return false;
    if (officeFilter !== 'all' && person.office !== officeFilter) return false;
    if (statusFilter !== 'all' && person.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        person.displayName.toLowerCase().includes(q) ||
        person.email.toLowerCase().includes(q) ||
        person.designation.toLowerCase().includes(q) ||
        person.department.toLowerCase().includes(q) ||
        person.employeeId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const superAdminCount = azureAdPeople.filter(p => p.role === 'Super Admin').length;
  const adminCount = azureAdPeople.filter(p => p.role === 'Admin').length;
  const activeCount = azureAdPeople.filter(p => p.status === 'Active').length;

  return (
    <div   style={{ minHeight: '100vh' }} className="p-4 sm:p-6 lg:p-8 bg-slate-50 ">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-xl lg:text-2xl font-semibold text-[#00314E] ">
          People Management
        </h1>
        <p className="font-body text-sm mt-1 text-slate-500 ">
          Manage admin portal access and user roles — connected with Azure Active Directory
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: `${BAYER_CYAN}10` }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Users size={18}  style={{ color: BAYER_CYAN }} />
            </div>
          </div>
          <span className="font-mono text-2xl font-bold text-[#00314E] ">
            {azureAdPeople.length}
          </span>
          <p   style={{ color: 'oklch(0.5 0.01 250)' }} className="font-body text-xs mt-1">Total People</p>
        </div>

        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Shield size={18}  style={{ color: '#7C3AED' }} />
            </div>
          </div>
          <span   style={{ color: '#7C3AED' }} className="font-mono text-2xl font-bold">
            {superAdminCount}
          </span>
          <p   style={{ color: 'oklch(0.5 0.01 250)' }} className="font-body text-xs mt-1">Super Admins</p>
        </div>

        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: `${BAYER_CYAN}10` }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <UserCheck size={18}  style={{ color: BAYER_CYAN }} />
            </div>
          </div>
          <span   style={{ color: BAYER_CYAN }} className="font-mono text-2xl font-bold">
            {adminCount}
          </span>
          <p   style={{ color: 'oklch(0.5 0.01 250)' }} className="font-body text-xs mt-1">Admins</p>
        </div>

        <div className="rounded-2xl p-5 bg-white  border border-slate-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div   style={{ backgroundColor: '#22C55E10' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
              <UserCheck size={18}  style={{ color: '#22C55E' }} />
            </div>
          </div>
          <span   style={{ color: '#22C55E' }} className="font-mono text-2xl font-bold">
            {activeCount}
          </span>
          <p   style={{ color: 'oklch(0.5 0.01 250)' }} className="font-body text-xs mt-1">Active Users</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl p-5 mb-6 bg-white  border border-slate-200 ">
        {/* Search */}
        <div   style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)' }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, designation, or employee ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="bg-transparent outline-none font-body text-sm flex-1 text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <span className="font-display text-[8px] uppercase tracking-wider text-gray-500">Filters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]"
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={officeFilter}
            onChange={(e) => { setOfficeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]"
          >
            <option value="all">All Offices</option>
            {uniqueOffices.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg font-body text-sm bg-white border border-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:border-[#01BEFF]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> people
        </p>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {paginated.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white  border border-slate-200 ">
          <UserX size={48} className="mx-auto mb-3 text-gray-300" />
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">No people found</h3>
          <p className="font-body text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="font-body text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-30 bg-white text-gray-700 border border-gray-200 transition-colors hover:bg-gray-50"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg font-body text-xs transition-colors"  style={{ backgroundColor: p === page ? BAYER_GREEN : 'white',
                  color: p === page ? '#FFFFFF' : '#374151',
                  border: p === page ? 'none' : '1px solid #E5E7EB' }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-30 bg-white text-gray-700 border border-gray-200 transition-colors hover:bg-gray-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
