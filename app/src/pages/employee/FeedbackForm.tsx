import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

interface User {
  name: string;
  email: string;
  profilePic: string;
  designation: string;
  department: string;
  office: string;
}

interface FeedbackFormProps {
  user: User;
}

interface RatingCategory {
  id: string;
  label: string;
  description: string;
}

const ratingCategories: RatingCategory[] = [
  { id: 'resolution_quality', label: 'Resolution Quality', description: 'How well was your issue resolved?' },
  { id: 'response_time', label: 'Response Time', description: 'How satisfied are you with the speed of response?' },
  { id: 'communication', label: 'Communication', description: 'How clear and helpful was the communication?' },
  { id: 'professionalism', label: 'Professionalism', description: 'How professional was the technician?' },
];

function StarRating({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110 focus:outline-none p-1"
          >
            <Star
              size={32}
              fill={isActive ? BAYER_GREEN : 'transparent'}
              stroke={isActive ? BAYER_GREEN : '#D1D5DB'}
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackForm({ user }: FeedbackFormProps) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({
    resolution_quality: 0,
    response_time: 0,
    communication: 0,
    professionalism: 0,
  });
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState('');
  const [wentWell, setWentWell] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingExisting, setCheckingExisting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Find current user's AD object ID based on email or name (mocked user doesn't have ID, so we use azureAdPeople)
      const currentUser = azureAdPeople.find(p => p.email === user.email || p.displayName === user.name);
      const user_id = currentUser ? currentUser.id : "user-123";

      const res = await fetch(`${API_URL}/api/tickets/`);
      if (res.ok) {
        const data = await res.json();
        // Filter tickets that belong to the user and are Resolved/Closed
        const resolved = data.filter((t: any) => 
          (t.user_id === user_id || t.user_name === user.name) && 
          (t.status === 'Resolved' || t.status === 'Closed')
        );
        setTickets(resolved);
      }
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if feedback already exists when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) return;

    const checkExistingFeedback = async () => {
      setCheckingExisting(true);
      try {
        const res = await fetch(`${API_URL}/api/feedback/ticket/${selectedTicket}`);
        if (res.ok) {
          const feedback = await res.json();
          // Feedback exists, redirect to edit page
          alert('You have already submitted feedback for this ticket. Redirecting to edit mode.');
          navigate(`/app/dashboard/edit-feedback/${feedback.id}`);
        }
      } catch (err) {
        // 404 means no feedback exists yet, which is fine
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingFeedback();
  }, [selectedTicket, navigate]);

  const handleRatingChange = (categoryId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [categoryId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket) {
      alert('Please select a ticket to provide feedback for');
      return;
    }

    if (overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    const currentUser = azureAdPeople.find(p => p.email === user.email || p.displayName === user.name);
    const user_id = currentUser ? currentUser.id : "user-123";

    const feedbackData = {
      ticket_id: selectedTicket,
      user_id: user_id,
      overall_rating: overallRating,
      resolution_quality: ratings.resolution_quality,
      response_time: ratings.response_time,
      communication: ratings.communication,
      professionalism: ratings.professionalism,
      comments: comments,
      went_well: wentWell,
      improvements: improvements
    };

    try {
      const res = await fetch(`${API_URL}/api/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });

      if (res.ok) {
        alert('Feedback submitted successfully!');
        navigate('/app/dashboard/feedback-history');
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/app/dashboard')}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-body text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2 text-[#00314E] ">
          Submit Feedback
        </h1>
        <p className="font-body text-gray-600">
          Share your experience to help us improve our services
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <h3 className="font-display text-sm font-bold mb-4 text-gray-900 uppercase tracking-wider">
            Your Information
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1">
              <p className="font-body text-base font-bold text-gray-900">{user.name}</p>
              <p className="font-body text-sm text-gray-600">{user.designation}</p>
              <p className="font-body text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Select Ticket */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <label className="flex items-center gap-2 font-display text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">
            <CheckCircle size={16} className="text-green-600" />
            Select Resolved Ticket
            <span className="text-red-600">*</span>
          </label>

          {tickets.length === 0 ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm font-medium text-yellow-900">No resolved tickets found</p>
                <p className="font-body text-xs text-yellow-700 mt-1">
                  You can only provide feedback for tickets that have been resolved or closed.
                </p>
              </div>
            </div>
          ) : (
            <>
              <select
                value={selectedTicket}
                onChange={(e) => setSelectedTicket(e.target.value)}
                required
                disabled={checkingExisting}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm transition-all mb-4"
              >
                <option value="">-- Select a ticket --</option>
                {tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.id.substring(0,8)} - {ticket.description.substring(0,50)}
                  </option>
                ))}
              </select>

              {checkingExisting && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                  <Loader2 size={16} className="animate-spin" /> Checking feedback status...
                </div>
              )}

              {selectedTicketData && !checkingExisting && (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span   style={{ color: BAYER_CYAN }} className="font-mono text-xs font-semibold">
                      {selectedTicketData.id.substring(0,8).toUpperCase()}
                    </span>
                    <span
                        style={{ backgroundColor: '#10B98120', color: '#10B981' }}
                     className="px-2 py-1 rounded text-xs font-semibold">
                      {selectedTicketData.status}
                    </span>
                  </div>
                  <p className="font-body text-sm font-medium text-gray-900 mb-1">
                    {selectedTicketData.description.substring(0,100)}...
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {tickets.length > 0 && selectedTicket && !checkingExisting && (
          <>
            {/* Overall Rating */}
            <div className="rounded-xl p-6 bg-white border border-gray-200">
              <label className="flex items-center gap-2 font-display text-sm font-bold mb-4 text-gray-900 uppercase tracking-wider">
                <Star size={16} className="text-yellow-500" />
                Overall Rating
                <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-4">
                <StarRating rating={overallRating} onRatingChange={setOverallRating} />
                {overallRating > 0 && (
                  <span   style={{ color: BAYER_GREEN }} className="font-display text-2xl font-bold">
                    {overallRating}.0
                  </span>
                )}
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="rounded-xl p-6 bg-white border border-gray-200">
              <h3 className="font-display text-sm font-bold mb-5 text-gray-900 uppercase tracking-wider">
                Detailed Ratings (Optional)
              </h3>
              <div className="space-y-6">
                {ratingCategories.map((category) => (
                  <div key={category.id}>
                    <div className="mb-3">
                      <h4 className="font-body text-sm font-semibold text-gray-900 mb-1">
                        {category.label}
                      </h4>
                      <p className="font-body text-xs text-gray-600">
                        {category.description}
                      </p>
                    </div>
                    <StarRating
                      rating={ratings[category.id]}
                      onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="rounded-xl p-6 bg-white border border-gray-200">
              <h3 className="font-display text-sm font-bold mb-4 text-gray-900 uppercase tracking-wider">
                Additional Comments
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium mb-2 text-gray-700">
                    General Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Share your overall experience..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium mb-2 text-gray-700">
                    What Went Well?
                  </label>
                  <textarea
                    value={wentWell}
                    onChange={(e) => setWentWell(e.target.value)}
                    placeholder="What did you appreciate about the service?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium mb-2 text-gray-700">
                    Areas for Improvement
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="How can we improve our service?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedTicket || overallRating === 0}
                  style={{ backgroundColor: BAYER_GREEN }}
               className="flex-1 py-4 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-4 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
