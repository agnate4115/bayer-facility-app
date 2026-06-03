import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Building,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  Clock,
  Tag,
  Shield,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityIndicator from './PriorityIndicator';

interface TicketData {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  office: string;
  floor: string;
  zone: string;
  locationId: string;
  reportedBy: string;
  reportedByEmail: string;
  department: string;
  assignee?: string;
  team?: string;
  createdAt: string;
  aiSummary: string;
  photos?: string[];
}

interface TicketDetailViewProps {
  ticket: TicketData;
  backLink: string;
  backLabel: string;
  isAdminView?: boolean;
  onStatusChange?: (status: string) => void;
  onAssigneeChange?: (assignee: string) => void;
  onTeamChange?: (team: string) => void;
  onDepartmentChange?: (department: string) => void;
  assignees?: string[];
  teams?: string[];
  departments?: string[];
}

export default function TicketDetailView({
  ticket,
  backLink,
  backLabel,
  isAdminView = false,
  onStatusChange,
  onAssigneeChange,
  onTeamChange,
  onDepartmentChange,
  assignees = [],
  teams = [],
  departments = [],
}: TicketDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, setStatus] = useState(ticket.status);
  const [assignee, setAssignee] = useState(ticket.assignee || 'Unassigned');
  const [team, setTeam] = useState(ticket.team || '');

  const statusOptions = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed', 'Escalated'];
  const stages = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentStageIndex = stages.indexOf(status);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get accent color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'from-red-500 to-red-600';
      case 'P2': return 'from-orange-500 to-orange-600';
      case 'P3': return 'from-[#01BEFF] to-blue-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getPriorityGlow = (priority: string) => {
    switch (priority) {
      case 'P1': return 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case 'P2': return 'shadow-[0_0_15px_rgba(249,115,22,0.5)]';
      case 'P3': return 'shadow-[0_0_15px_rgba(1,190,255,0.5)]';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 ] text-slate-900  font-body pb-12">
      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <img src={selectedImage} alt="Enlarged view" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80  backdrop-blur-md border-b border-slate-200  px-6 py-4 flex items-center justify-between shadow-sm">
        <Link 
          to={backLink}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900  :text-white transition-colors font-medium text-sm group"
        >
          <div className="p-1.5 rounded-lg bg-slate-100  group-hover:bg-slate-200 :bg-slate-700 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to {backLabel}
        </Link>
        <div className="font-mono text-xs font-bold tracking-widest text-slate-400  uppercase">
          TICKET {ticket.id}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white ] border border-slate-200  shadow-sm">
          {/* Priority Gradient Top Bar */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${getPriorityColor(ticket.priority)}`} />
          
          <div className="p-8 md:p-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white tracking-widest bg-gradient-to-r ${getPriorityColor(ticket.priority)} ${getPriorityGlow(ticket.priority)}`}>
                    {ticket.priority} PRIORITY
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-100  border border-slate-200  text-xs font-semibold text-slate-600  flex items-center gap-1.5">
                    <Tag size={12} /> {ticket.category}
                  </div>
                  <StatusBadge status={status as any} />
                </div>
                
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900  leading-tight tracking-tight">
                  {ticket.subject}
                </h1>
                
                <div className="flex items-center gap-2 text-sm text-slate-500  font-medium">
                  <Clock size={14} />
                  Reported on {formatDate(ticket.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary Card - Premium Glowing Design */}
        <div className="relative rounded-3xl p-[1px] overflow-hidden group">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#01BEFF] via-[#56D500] to-[#01BEFF] opacity-40  rounded-3xl" />
          
          <div className="relative h-full bg-white ] rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#01BEFF]/20 to-[#56D500]/20 border border-[#01BEFF]/30  shadow-[0_0_15px_rgba(1,190,255,0.1)]">
              <Sparkles className="text-[#01BEFF] ]" size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-slate-900  flex items-center gap-2">
                AI Quick Summary
                <span className="px-2 py-0.5 rounded-full bg-[#56D500]/10 text-[#56D500] text-[10px] uppercase font-bold tracking-wider">Beta</span>
              </h3>
              <p className="text-slate-600  leading-relaxed font-medium">
                {ticket.aiSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="bg-white ] rounded-3xl p-8 border border-slate-200  shadow-sm overflow-hidden">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-slate-500  mb-8">Ticket Lifecycle</h3>
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100  -z-10" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-[#01BEFF] to-[#56D500] transition-all duration-500 ease-out -z-10" 
              style={{ width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%` }}
            />
            
            {stages.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;
              
              return (
                <div key={stage} className="flex flex-col items-center gap-3 relative z-10">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4
                    ${isCompleted ? 'bg-[#56D500] border-white ] text-white shadow-[0_0_10px_rgba(86,213,0,0.4)]' : ''}
                    ${isCurrent ? 'bg-white ] border-[#01BEFF] text-[#01BEFF] shadow-[0_0_15px_rgba(1,190,255,0.4)]' : ''}
                    ${isPending ? 'bg-white ] border-slate-200  text-slate-300 ' : ''}
                  `}>
                    {isCompleted ? <CheckCircle2 size={20} className="text-white" /> : <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-[#01BEFF]' : 'bg-slate-300 '}`} />}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider text-center max-w-[80px]
                    ${isCompleted ? 'text-[#56D500]' : ''}
                    ${isCurrent ? 'text-[#01BEFF] ' : ''}
                    ${isPending ? 'text-slate-400 ' : ''}
                  `}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white ] rounded-3xl p-8 border border-slate-200  shadow-sm h-full">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-slate-500  mb-6 flex items-center gap-2">
                <AlertCircle size={16} /> Detailed Description
              </h3>
              <div className="prose prose-slate  max-w-none">
                <p className="text-slate-700  leading-relaxed whitespace-pre-wrap font-medium">
                  {ticket.description}
                </p>
              </div>

              {/* Photos Grid */}
              {ticket.photos && ticket.photos.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-display text-xs font-bold uppercase tracking-widest text-slate-500  mb-4">Attached Evidence</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ticket.photos.map((photo, index) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-2xl overflow-hidden cursor-pointer border border-slate-200  group relative"
                        onClick={() => setSelectedImage(photo)}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                          <Sparkles className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                        </div>
                        <img 
                          src={photo} 
                          alt={`Evidence ${index + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-slate-100" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'; // Generic fallback image
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area (1 col) */}
          <div className="space-y-6">
            
            {/* Admin Management Panel */}
            {isAdminView && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 ] ] rounded-3xl p-8 border border-indigo-100  shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10  pointer-events-none">
                  <Shield size={100} />
                </div>
                
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-indigo-900  mb-6 flex items-center gap-2 relative z-10">
                  <Shield size={16} /> Management Console
                </h3>
                
                <div className="space-y-5 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500  uppercase tracking-widest">Status Update</label>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full bg-white ] border border-slate-200  text-slate-900  rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                    >
                      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500  uppercase tracking-widest">Assign Technician</label>
                    <select
                      value={assignee}
                      onChange={(e) => {
                        setAssignee(e.target.value);
                        onAssigneeChange?.(e.target.value);
                      }}
                      className="w-full bg-white ] border border-slate-200  text-slate-900  rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {assignees.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500  uppercase tracking-widest">Assign Team</label>
                    <select
                      value={team}
                      onChange={(e) => {
                        setTeam(e.target.value);
                        onTeamChange?.(e.target.value);
                      }}
                      className="w-full bg-white ] border border-slate-200  text-slate-900  rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                    >
                      <option value="">No Team Assigned</option>
                      {teams.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Location Data Box */}
            <div className="bg-white ] rounded-3xl p-6 border border-slate-200  shadow-sm flex flex-col gap-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-400  flex items-center gap-2">
                <MapPin size={14} /> Location Details
              </h3>
              
              <div className="p-4 rounded-2xl bg-slate-50 ] border border-slate-100 ">
                <div className="font-mono text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Location ID</div>
                <div className="font-mono text-sm font-semibold text-slate-900 ">{ticket.locationId}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Office</div>
                  <div className="text-sm font-semibold text-slate-900 ">{ticket.office}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Floor</div>
                  <div className="text-sm font-semibold text-slate-900 ">{ticket.floor}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Zone</div>
                  <div className="text-sm font-semibold text-slate-900 ">{ticket.zone}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Dept</div>
                  <div className="text-sm font-semibold text-slate-900  truncate" title={ticket.department}>{ticket.department}</div>
                </div>
              </div>
            </div>

            {/* People Box */}
            <div className="bg-white ] rounded-3xl p-6 border border-slate-200  shadow-sm flex flex-col gap-6">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-400  flex items-center gap-2">
                <Users size={14} /> Personnel
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50  flex items-center justify-center border border-blue-100 ">
                  <User size={18} className="text-blue-500 " />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-widest uppercase">Reported By</div>
                  <div className="text-sm font-bold text-slate-900 ">{ticket.reportedBy}</div>
                  <a href={`mailto:${ticket.reportedByEmail}`} className="text-xs text-blue-500 hover:underline">{ticket.reportedByEmail}</a>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 " />

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50  flex items-center justify-center border border-emerald-100 ">
                  <AlertTriangle size={18} className="text-emerald-500 " />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-widest uppercase">Assigned To</div>
                  <div className="text-sm font-bold text-slate-900 ">{assignee}</div>
                  {team && <div className="text-xs text-slate-500 ">{team}</div>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
