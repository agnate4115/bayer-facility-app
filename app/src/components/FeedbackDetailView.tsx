import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  MessageSquare, 
  FileText, 
  User, 
  Building, 
  Sparkles, 
  Mail, 
  Briefcase, 
  ThumbsUp, 
  TrendingUp,
  ExternalLink,
  AlertTriangle,
  Users
} from 'lucide-react';

interface RatingDetails {
  resolution_quality: number;
  response_time: number;
  communication: number;
  professionalism: number;
}

interface FeedbackData {
  id: string;
  ticketId: string;
  ticketFullId?: string;
  ticketTitle?: string;
  submittedDate: string;
  rating: number;
  ratings?: RatingDetails;
  comment: string;
  wentWell?: string;
  improvements?: string;
  technician: string;
  category?: string;
  office?: string;
  aiSummary?: string;
  submittedBy?: string;
  submittedByEmail?: string;
  submittedByDesignation?: string;
  submittedByDepartment?: string;
}

interface FeedbackDetailViewProps {
  feedback: FeedbackData;
  backLink: string;
  backLabel: string;
  showTicketLink?: boolean;
  isAdminView?: boolean;
}

const ratingCategories = [
  { id: 'resolution_quality', label: 'Resolution Quality', description: 'How well was your issue resolved?' },
  { id: 'response_time', label: 'Response Time', description: 'How satisfied are you with the speed of response?' },
  { id: 'communication', label: 'Communication', description: 'How clear and helpful was the communication?' },
  { id: 'professionalism', label: 'Professionalism', description: 'How professional was the technician?' },
];

function StarDisplay({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <Star
            key={star}
            size={size}
            fill={isFilled ? '#F59E0B' : 'transparent'}
            stroke={isFilled ? '#F59E0B' : '#475569'}
            strokeWidth={1.5}
            className={`transition-all duration-300 ${isFilled ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110' : ''}`}
          />
        );
      })}
    </div>
  );
}

function RatingBar({ value, label, description }: { value: number; label: string; description: string }) {
  const percentage = (value / 5) * 100;
  
  const getColorClasses = (v: number) => {
    if (v >= 4) return 'from-[#56D500] to-emerald-400 shadow-[0_0_10px_rgba(86,213,0,0.4)]';
    if (v >= 3) return 'from-amber-400 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]';
    return 'from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
  };

  const getTextColor = (v: number) => {
    if (v >= 4) return 'text-[#56D500]';
    if (v >= 3) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-display text-sm font-bold text-slate-900  tracking-wide">
            {label}
          </p>
          <p className="font-body text-[8px] font-medium text-slate-500  mt-0.5">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StarDisplay rating={value} size={14} />
          <span className={`font-mono text-lg font-bold min-w-[2ch] text-right ${getTextColor(value)}`}>
            {value}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-slate-100  rounded-full overflow-hidden border border-slate-200 ">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getColorClasses(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function FeedbackDetailView({
  feedback,
  backLink,
  backLabel,
  showTicketLink = false,
  isAdminView = false,
}: FeedbackDetailViewProps) {
  const formattedDate = new Date(feedback.submittedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50 ] text-slate-900  font-body pb-12">
      
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
        <div className="font-mono text-xs font-bold tracking-widest text-slate-400  uppercase flex items-center gap-2">
          FEEDBACK <span className="w-1 h-1 rounded-full bg-slate-300 " /> {feedback.id}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white ] border border-slate-200  shadow-sm flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
          {/* Subtle background glow based on rating */}
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3
            ${feedback.rating >= 4 ? 'bg-[#56D500]' : feedback.rating >= 3 ? 'bg-amber-500' : 'bg-red-500'}
          `} />

          <div className="space-y-4 relative z-10 flex-1">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-slate-100  border border-slate-200  text-xs font-bold tracking-widest text-slate-500  uppercase flex items-center gap-1.5">
                <Calendar size={12} /> {formattedDate}
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100  border border-slate-200  text-xs font-bold tracking-widest text-slate-500  uppercase flex items-center gap-1.5">
                <Building size={12} /> {feedback.office || 'Corporate'}
              </div>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900  leading-tight">
              Customer Feedback
            </h1>
            
            {showTicketLink && feedback.ticketTitle && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm font-medium text-slate-500 ">Related to:</span>
                <Link
                  to={`/admin/tickets/${feedback.ticketFullId || feedback.ticketId}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#01BEFF] hover:text-blue-500 transition-colors"
                >
                  <FileText size={14} />
                  {feedback.ticketTitle}
                  <ExternalLink size={12} className="ml-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Large Rating Display */}
          <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 ] border border-slate-100  min-w-[240px]">
            <span className="font-mono text-6xl font-black text-slate-900  mb-4 tracking-tighter">
              {feedback.rating.toFixed(1)}
            </span>
            <StarDisplay rating={feedback.rating} size={28} />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400 mt-4">Overall Score</span>
          </div>
        </div>

        {/* AI Summary Card */}
        {feedback.aiSummary && (
          <div className="relative rounded-3xl p-[1px] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#01BEFF] via-[#56D500] to-[#01BEFF] opacity-40  rounded-3xl" />
            <div className="relative h-full bg-white ] rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#01BEFF]/20 to-[#56D500]/20 border border-[#01BEFF]/30  shadow-[0_0_15px_rgba(1,190,255,0.1)]">
                <Sparkles className="text-[#01BEFF] ]" size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-slate-900  flex items-center gap-2">
                  AI Sentiment Analysis
                  <span className="px-2 py-0.5 rounded-full bg-[#56D500]/10 text-[#56D500] text-[8px] uppercase font-bold tracking-wider">Beta</span>
                </h3>
                <p className="text-slate-600  leading-relaxed font-medium">
                  {feedback.aiSummary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Detailed Ratings & Comments (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Detailed Ratings */}
            {feedback.ratings && (
              <div className="bg-white ] rounded-3xl p-8 border border-slate-200  shadow-sm">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-slate-500  mb-8 flex items-center gap-2">
                  <TrendingUp size={16} /> Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {ratingCategories.map(cat => (
                    <RatingBar 
                      key={cat.id}
                      value={feedback.ratings![cat.id as keyof RatingDetails]}
                      label={cat.label}
                      description={cat.description}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Written Comments */}
            <div className="bg-white ] rounded-3xl p-8 border border-slate-200  shadow-sm">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-slate-500  mb-6 flex items-center gap-2">
                <MessageSquare size={16} /> General Comments
              </h3>
              <div className="p-6 rounded-2xl bg-slate-50 ] border border-slate-100 ">
                <p className="text-slate-700  leading-relaxed italic font-medium">
                  "{feedback.comment}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Went Well */}
                <div className="p-6 rounded-2xl bg-emerald-50  border border-emerald-100  relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#56D500]" />
                  <h4 className="font-display text-sm font-bold uppercase tracking-widest text-emerald-800  mb-3 flex items-center gap-2">
                    <ThumbsUp size={14} /> What went well
                  </h4>
                  <p className="text-emerald-900  text-sm font-medium leading-relaxed">
                    {feedback.wentWell || 'No specific positive notes provided.'}
                  </p>
                </div>

                {/* Improvements */}
                <div className="p-6 rounded-2xl bg-amber-50  border border-amber-100  relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                  <h4 className="font-display text-sm font-bold uppercase tracking-widest text-amber-800  mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} /> Areas for improvement
                  </h4>
                  <p className="text-amber-900  text-sm font-medium leading-relaxed">
                    {feedback.improvements || 'No specific improvements suggested.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Context Panel (1 col) */}
          <div className="space-y-6">
            
            {/* Personnel Card */}
            <div className="bg-white ] rounded-3xl p-6 border border-slate-200  shadow-sm space-y-6">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-slate-400  flex items-center gap-2">
                <Users size={14} /> People Involved
              </h3>

              <div className="space-y-4">
                {/* Reviewer */}
                <div className="p-4 rounded-2xl bg-slate-50 ] border border-slate-100 ">
                  <div className="text-[8px] font-bold text-slate-400 mb-3 tracking-widest uppercase flex items-center gap-1.5">
                    <User size={12} /> Submitted By
                  </div>
                  {feedback.submittedBy ? (
                    <div>
                      <div className="text-sm font-bold text-slate-900  mb-1">{feedback.submittedBy}</div>
                      {feedback.submittedByDesignation && (
                        <div className="text-xs text-slate-500  flex items-center gap-1.5 mb-1">
                          <Briefcase size={10} /> {feedback.submittedByDesignation}
                        </div>
                      )}
                      {feedback.submittedByEmail && (
                        <a href={`mailto:${feedback.submittedByEmail}`} className="text-xs text-[#01BEFF] hover:underline flex items-center gap-1.5">
                          <Mail size={10} /> {feedback.submittedByEmail}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm italic text-slate-500 ">Anonymous</div>
                  )}
                </div>

                {/* Technician */}
                <div className="p-4 rounded-2xl bg-indigo-50  border border-indigo-100 ">
                  <div className="text-[8px] font-bold text-indigo-400  mb-3 tracking-widest uppercase flex items-center gap-1.5">
                    <User size={12} /> Technician Reviewed
                  </div>
                  <div className="text-sm font-bold text-indigo-900 ">{feedback.technician}</div>
                  <div className="text-xs text-indigo-500  mt-1 font-medium">{feedback.category}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
