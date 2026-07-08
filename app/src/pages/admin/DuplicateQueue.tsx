import { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import PriorityIndicator from '@/components/PriorityIndicator';

interface DuplicateTicket {
  id: string;
  originalTicketId: string;
  potentialDuplicateId: string;
  similarityScore: number;
  flaggedAt: string;
  status: 'pending' | 'confirmed' | 'dismissed';

  // Original ticket details
  original: {
    id: string;
    subject: string;
    description: string;
    status: 'Submitted' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed' | 'Escalated';
    priority: 'P1' | 'P2' | 'P3';
    category: string;
    office: string;
    floor: string;
    zone: string;
    createdAt: string;
    assignee: string;
    reportedBy: string;
  };

  // Potential duplicate details
  duplicate: {
    id: string;
    subject: string;
    description: string;
    status: 'Submitted' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed' | 'Escalated';
    priority: 'P1' | 'P2' | 'P3';
    category: string;
    office: string;
    floor: string;
    zone: string;
    createdAt: string;
    assignee: string;
    reportedBy: string;
  };
}

// Mock data for duplicate tickets
const mockDuplicateTickets: DuplicateTicket[] = [
  {
    id: 'dup-001',
    originalTicketId: 'BYR-THN-2026-003847',
    potentialDuplicateId: 'BYR-THN-2026-003860',
    similarityScore: 94,
    flaggedAt: '2026-05-29T10:15:00Z',
    status: 'pending',
    original: {
      id: 'BYR-THN-2026-003847',
      subject: 'Air conditioning unit non-functional',
      description: 'The AC unit in the cafeteria area on Floor 3 has not been operational since morning. Multiple employees are affected. Immediate attention required.',
      status: 'In Progress',
      priority: 'P2',
      category: 'HVAC / AC',
      office: 'Thane',
      floor: '3',
      zone: 'Cafeteria',
      createdAt: '2026-05-25T09:14:33Z',
      assignee: 'Rahul Sharma',
      reportedBy: 'Priya Patel',
    },
    duplicate: {
      id: 'BYR-THN-2026-003860',
      subject: 'AC not working in cafeteria',
      description: 'The air conditioning in the Floor 3 cafeteria is not cooling. Room temperature is very uncomfortable. Need urgent fix.',
      status: 'Submitted',
      priority: 'P2',
      category: 'HVAC / AC',
      office: 'Thane',
      floor: '3',
      zone: 'Cafeteria',
      createdAt: '2026-05-29T09:45:00Z',
      assignee: 'Unassigned',
      reportedBy: 'Amit Verma',
    },
  },
  {
    id: 'dup-002',
    originalTicketId: 'BYR-THN-2026-003849',
    potentialDuplicateId: 'BYR-THN-2026-003861',
    similarityScore: 87,
    flaggedAt: '2026-05-29T11:30:00Z',
    status: 'pending',
    original: {
      id: 'BYR-THN-2026-003849',
      subject: 'Washroom out of order on Floor 4',
      description: 'The men\'s washroom on Floor 4 near the conference area is completely out of order. The toilet is clogged and there is water leaking.',
      status: 'Acknowledged',
      priority: 'P2',
      category: 'Plumbing',
      office: 'Thane',
      floor: '4',
      zone: 'Conference Area',
      createdAt: '2026-05-28T07:15:00Z',
      assignee: 'Suresh Reddy',
      reportedBy: 'Neha Joshi',
    },
    duplicate: {
      id: 'BYR-THN-2026-003861',
      subject: 'Floor 4 bathroom flooding',
      description: 'Water is leaking from the men\'s bathroom near conference rooms on Floor 4. The floor is wet and toilet appears clogged.',
      status: 'Submitted',
      priority: 'P2',
      category: 'Plumbing',
      office: 'Thane',
      floor: '4',
      zone: 'Conference Area',
      createdAt: '2026-05-29T10:20:00Z',
      assignee: 'Unassigned',
      reportedBy: 'Karthik Srinivasan',
    },
  },
  {
    id: 'dup-003',
    originalTicketId: 'BYR-THN-2026-003850',
    potentialDuplicateId: 'BYR-THN-2026-003862',
    similarityScore: 91,
    flaggedAt: '2026-05-29T08:45:00Z',
    status: 'pending',
    original: {
      id: 'BYR-THN-2026-003850',
      subject: 'Conference Room B projector not working',
      description: 'The projector in Conference Room B on Floor 5 is displaying a blue screen only. HDMI connection is not being detected.',
      status: 'In Progress',
      priority: 'P2',
      category: 'IT Infrastructure',
      office: 'Thane',
      floor: '5',
      zone: 'Conference Room B',
      createdAt: '2026-05-28T06:00:00Z',
      assignee: 'Deepak Nair',
      reportedBy: 'Karan Shah',
    },
    duplicate: {
      id: 'BYR-THN-2026-003862',
      subject: 'Projector malfunction in Conference Room B',
      description: 'Cannot get the projector to work in Conference Room B, Floor 5. It shows only blue screen and won\'t detect laptop connection.',
      status: 'Submitted',
      priority: 'P2',
      category: 'IT Infrastructure',
      office: 'Thane',
      floor: '5',
      zone: 'Conference Room B',
      createdAt: '2026-05-29T08:30:00Z',
      assignee: 'Unassigned',
      reportedBy: 'Sarah Williams',
    },
  },
  {
    id: 'dup-004',
    originalTicketId: 'BYR-THN-2026-003851',
    potentialDuplicateId: 'BYR-THN-2026-003863',
    similarityScore: 78,
    flaggedAt: '2026-05-29T12:00:00Z',
    status: 'pending',
    original: {
      id: 'BYR-THN-2026-003851',
      subject: 'Light flickering in corridor near pantry',
      description: 'The corridor lights between the pantry and the elevator on Floor 2 have been flickering for the past two days.',
      status: 'Submitted',
      priority: 'P3',
      category: 'Electrical',
      office: 'Thane',
      floor: '2',
      zone: 'Pantry Corridor',
      createdAt: '2026-05-28T09:00:00Z',
      assignee: 'Unassigned',
      reportedBy: 'Anita Desai',
    },
    duplicate: {
      id: 'BYR-THN-2026-003863',
      subject: 'Electrical issue with hallway lights',
      description: 'The lights in the hallway near the Floor 2 pantry are flickering and sometimes turning off completely.',
      status: 'Submitted',
      priority: 'P3',
      category: 'Electrical',
      office: 'Thane',
      floor: '2',
      zone: 'Pantry Corridor',
      createdAt: '2026-05-29T11:15:00Z',
      assignee: 'Unassigned',
      reportedBy: 'Mohammed Ali',
    },
  },
  {
    id: 'dup-005',
    originalTicketId: 'BYR-MUM-2026-001923',
    potentialDuplicateId: 'BYR-MUM-2026-001930',
    similarityScore: 82,
    flaggedAt: '2026-05-29T07:30:00Z',
    status: 'pending',
    original: {
      id: 'BYR-MUM-2026-001923',
      subject: 'Chair is wobbly and unstable',
      description: 'My office chair has a broken wheel and wobbles when I sit. It is becoming uncomfortable to work. Could someone please fix or replace it?',
      status: 'Assigned',
      priority: 'P3',
      category: 'Furniture',
      office: 'Mumbai',
      floor: '2',
      zone: 'Workstation A',
      createdAt: '2026-05-27T14:22:00Z',
      assignee: 'Vikram Singh',
      reportedBy: 'Arjun Mehta',
    },
    duplicate: {
      id: 'BYR-MUM-2026-001930',
      subject: 'Broken office chair wheel',
      description: 'One of the wheels on my chair is broken and the chair wobbles. Difficult to sit properly. Please replace.',
      status: 'Submitted',
      priority: 'P3',
      category: 'Furniture',
      office: 'Mumbai',
      floor: '2',
      zone: 'Workstation A',
      createdAt: '2026-05-29T07:00:00Z',
      assignee: 'Unassigned',
      reportedBy: 'Priya Nambiar',
    },
  },
];

export default function DuplicateQueue() {
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'dismissed'>('pending');
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateTicket | null>(null);
  const [duplicateTickets, setDuplicateTickets] = useState(mockDuplicateTickets);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const getSimilarityLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };

  const filtered = duplicateTickets.filter((dup) => {
    if (statusFilter !== 'all' && dup.status !== statusFilter) return false;
    if (scoreFilter !== 'all') {
      const level = getSimilarityLevel(dup.similarityScore);
      if (level !== scoreFilter) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleConfirmDuplicate = (dupId: string) => {
    setDuplicateTickets((prev) =>
      prev.map((dup) =>
        dup.id === dupId ? { ...dup, status: 'confirmed' as const } : dup
      )
    );
    setSelectedDuplicate(null);
    // In real app: merge tickets, close duplicate, update original ticket
    console.log(`Confirmed duplicate: ${dupId}`);
  };

  const handleAddToQueue = (dupId: string) => {
    setDuplicateTickets((prev) =>
      prev.map((dup) =>
        dup.id === dupId ? { ...dup, status: 'dismissed' as const } : dup
      )
    );
    setSelectedDuplicate(null);
    // In real app: dismiss duplicate flag, add to queue as separate ticket
    console.log(`Added to queue as separate ticket: ${dupId}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 lg:p-8" style={{ backgroundColor: 'var(--surface-dark)', minHeight: '100vh' }}>
      <div className="mb-6">
        <h1 className="font-display text-xl lg:text-2xl font-medium text-gray-900">Duplicate Tickets</h1>
        <p className="font-body text-sm mt-1 text-gray-600">Review AI-flagged potential duplicate tickets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2 rounded-lg font-body text-sm outline-none cursor-pointer bg-white border border-gray-200 text-gray-900"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="confirmed">Confirmed Duplicate</option>
          <option value="dismissed">Added to Queue</option>
        </select>

        <select
          value={scoreFilter}
          onChange={(e) => { setScoreFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2 rounded-lg font-body text-sm outline-none cursor-pointer bg-white border border-gray-200 text-gray-900"
        >
          <option value="all">All Similarity Scores</option>
          <option value="high">High (85%+)</option>
          <option value="medium">Medium (70-84%)</option>
          <option value="low">Low (&lt;70%)</option>
        </select>

        <div className="ml-auto font-body text-sm text-gray-600">
          {filtered.filter(d => d.status === 'pending').length} pending reviews
        </div>
      </div>

      {/* Duplicate List */}
      <div className="space-y-4">
        {paginated.map((dup) => (
          <div
            key={dup.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle size={20} style={{ color: '#3B82F6' }} />
                    <h3 className="font-display text-base font-medium text-gray-900">
                      Potential Duplicate Detected
                    </h3>
                    <span
                      className="px-3 py-1 rounded-full font-display text-xs font-medium"
                      style={{
                        backgroundColor: '#3B82F614',
                        color: '#3B82F6',
                      }}
                    >
                      {dup.similarityScore}% Match
                    </span>
                  </div>
                  <p className="font-body text-xs text-gray-500">
                    Flagged on {formatDate(dup.flaggedAt)} at {formatTime(dup.flaggedAt)}
                  </p>
                </div>

                {dup.status === 'pending' && (
                  <button
                    onClick={() => setSelectedDuplicate(selectedDuplicate?.id === dup.id ? null : dup)}
                    className="px-4 py-2 rounded-lg font-body text-sm text-white transition-colors"
                    style={{ backgroundColor: '#3B82F6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3B82F6')}
                  >
                    {selectedDuplicate?.id === dup.id ? 'Close' : 'Review'}
                  </button>
                )}

                {dup.status === 'confirmed' && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body text-sm" style={{ backgroundColor: '#10B98114', color: '#10B981' }}>
                    <CheckCircle size={16} />
                    Confirmed Duplicate
                  </span>
                )}

                {dup.status === 'dismissed' && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body text-sm" style={{ backgroundColor: '#64748B14', color: '#64748B' }}>
                    <Send size={16} />
                    Added to Queue
                  </span>
                )}
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original Ticket */}
                <div className="rounded-lg border-2 border-gray-200 p-4" style={{ backgroundColor: 'var(--surface-light)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-xs uppercase tracking-wider font-medium text-gray-500">Original Ticket</h4>
                    <span className="font-mono text-xs text-blue-600">{dup.original.id}</span>
                  </div>

                  <h5 className="font-body text-sm font-medium text-gray-900 mb-2">{dup.original.subject}</h5>
                  <p className="font-body text-xs text-gray-600 mb-3 line-clamp-2">{dup.original.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Status:</span>
                      <StatusBadge status={dup.original.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Priority:</span>
                      <PriorityIndicator priority={dup.original.priority} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Category:</span>
                      <span className="font-display uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: '#3B82F614', color: '#3B82F6', fontSize: '8px' }}>
                        {dup.original.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Location:</span>
                      <span className="font-body text-gray-900">{dup.original.office} - Floor {dup.original.floor}, {dup.original.zone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Assignee:</span>
                      <span className="font-body text-gray-900">{dup.original.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Reported by:</span>
                      <span className="font-body text-gray-900">{dup.original.reportedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Created:</span>
                      <span className="font-body text-gray-900">{formatDate(dup.original.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Potential Duplicate */}
                <div className="rounded-lg border-2 p-4" style={{ borderColor: '#3B82F6', backgroundColor: 'var(--surface-mid)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-xs uppercase tracking-wider font-medium" style={{ color: '#3B82F6' }}>Potential Duplicate</h4>
                    <span className="font-mono text-xs" style={{ color: '#3B82F6' }}>{dup.duplicate.id}</span>
                  </div>

                  <h5 className="font-body text-sm font-medium text-gray-900 mb-2">{dup.duplicate.subject}</h5>
                  <p className="font-body text-xs text-gray-600 mb-3 line-clamp-2">{dup.duplicate.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Status:</span>
                      <StatusBadge status={dup.duplicate.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Priority:</span>
                      <PriorityIndicator priority={dup.duplicate.priority} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Category:</span>
                      <span className="font-display uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: '#3B82F614', color: '#3B82F6', fontSize: '8px' }}>
                        {dup.duplicate.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Location:</span>
                      <span className="font-body text-gray-900">{dup.duplicate.office} - Floor {dup.duplicate.floor}, {dup.duplicate.zone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Assignee:</span>
                      <span className="font-body text-gray-900">{dup.duplicate.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Reported by:</span>
                      <span className="font-body text-gray-900">{dup.duplicate.reportedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-gray-500">Created:</span>
                      <span className="font-body text-gray-900">{formatDate(dup.duplicate.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons - shown when expanded */}
              {selectedDuplicate?.id === dup.id && dup.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3 justify-end">
                  <button
                    onClick={() => handleAddToQueue(dup.id)}
                    className="px-6 py-2.5 rounded-lg font-body text-sm text-white transition-colors"
                    style={{ backgroundColor: '#10B981' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
                  >
                    Add to Queue
                  </button>
                  <button
                    onClick={() => handleConfirmDuplicate(dup.id)}
                    className="px-6 py-2.5 rounded-lg font-body text-sm text-white transition-colors"
                    style={{ backgroundColor: '#10B981' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
                  >
                    Confirm Duplicate
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {paginated.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="font-display text-lg font-medium text-gray-900 mb-2">No duplicate tickets found</h3>
            <p className="font-body text-sm text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="font-body text-xs text-gray-600">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-30 bg-white text-gray-700 border border-gray-200"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-md font-body text-xs transition-colors"
                style={{
                  backgroundColor: p === page ? '#3B82F6' : 'white',
                  color: p === page ? '#FFFFFF' : '#374151',
                  border: p === page ? 'none' : '1px solid #E5E7EB',
                }}
              >
                {p}
              </button>
            ))}
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
  );
}
