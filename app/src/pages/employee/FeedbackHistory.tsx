import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Edit, Loader2 } from 'lucide-react';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';

interface FeedbackItem {
  id: string;
  ticketNumber: string;
  ticketTitle: string;
  submittedDate: string;
  averageRating: number;
}

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

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= Math.round(rating);
        return (
          <Star
            key={star}
            size={16}
            fill={isActive ? BAYER_GREEN : 'transparent'}
            stroke={isActive ? BAYER_GREEN : '#D1D5DB'}
            strokeWidth={2}
          />
        );
      })}
    </div>
  );
}

export default function FeedbackHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [feedbackRes, ticketsRes] = await Promise.all([
          fetch(`${API_URL}/api/feedback/`),
          fetch(`${API_URL}/api/tickets/`)
        ]);
        
        if (feedbackRes.ok && ticketsRes.ok) {
          const allFeedback = await feedbackRes.json();
          const allTickets = await ticketsRes.json();
          
          const mappedFeedbacks = allFeedback.map((fb: any) => {
            const ticket = allTickets.find((t: any) => t.id === fb.ticket_id);
            return {
              id: fb.id,
              ticketNumber: fb.ticket_id.substring(0,8).toUpperCase(),
              ticketTitle: ticket ? ticket.description.substring(0, 50) + "..." : "Unknown Ticket",
              submittedDate: fb.created_at,
              averageRating: fb.overall_rating
            };
          });
          
          setFeedbacks(mappedFeedbacks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = searchQuery === '' ||
      feedback.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, fb) => sum + fb.averageRating, 0) / feedbacks.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-[#00314E] ">
          Feedback History
        </h1>
        <p className="font-body text-sm sm:text-base text-gray-600">
          View and manage all feedback you've submitted
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm transition-all"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Total Feedbacks
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#00314E] ">
            {feedbacks.length}
          </p>
        </div>
        <div className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Recent
          </p>
          <p   style={{ color: BAYER_GREEN }} className="font-display text-2xl sm:text-3xl font-bold">
            {feedbacks.filter((fb) => {
              const diffMs = new Date().getTime() - new Date(fb.submittedDate).getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              return diffDays <= 30;
            }).length}
          </p>
          <p className="font-body text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="rounded-xl p-4 sm:p-6 bg-white border border-gray-200 hover:shadow-lg transition-all"
          >
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
              <span   style={{ color: BAYER_GREEN }} className="font-mono text-xs sm:text-sm font-bold">
                {feedback.ticketNumber}
              </span>
              <span className="font-body text-xs text-gray-500">
                {formatDate(feedback.submittedDate)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display text-base sm:text-lg font-bold mb-4 text-[#00314E] ">
              {feedback.ticketTitle}
            </h3>

            {/* Rating and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <StarDisplay rating={feedback.averageRating} />
                <span   style={{ color: BAYER_GREEN }} className="font-display text-base sm:text-lg font-bold">
                  {feedback.averageRating.toFixed(1)}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/app/dashboard/feedback-history/${feedback.id}`}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-display text-xs font-semibold uppercase tracking-wider text-gray-700 text-center"
                >
                  View Details
                </Link>
                <Link
                  to={`/app/dashboard/edit-feedback/${feedback.id}`}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors font-display text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit size={14} />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFeedbacks.length === 0 && (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
            <Star size={32} stroke="#9CA3AF" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2 text-gray-900">
            {searchQuery ? 'No feedback found' : 'No feedback yet'}
          </h3>
          <p className="font-body text-sm text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'You will see your submitted feedback here'}
          </p>
          {!searchQuery && (
            <Link
              to="/app/dashboard/feedback"
                style={{ backgroundColor: BAYER_GREEN }}
             className="inline-flex items-center px-6 py-3 rounded-lg font-display text-sm font-semibold uppercase tracking-wide text-white transition-shadow hover:shadow-lg">
              Submit Feedback
            </Link>
          )}
        </div>
      )}

      {/* Results Count */}
      {filteredFeedbacks.length > 0 && (
        <div className="mt-6 text-center">
          <p className="font-body text-xs sm:text-sm text-gray-500">
            Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
          </p>
        </div>
      )}
    </div>
  );
}
