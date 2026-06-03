import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';

interface RatingCategory {
  id: string;
  label: string;
  description: string;
}

const ratingCategories: RatingCategory[] = [
  { id: 'resolution_quality', label: 'Resolution Quality', description: 'How well was your issue resolved?' },
  { id: 'response_time', label: 'Response Time', description: 'Speed of response' },
  { id: 'communication', label: 'Communication', description: 'Clarity of communication' },
  { id: 'professionalism', label: 'Professionalism', description: 'Service professionalism' },
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

export default function EditFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${API_URL}/api/feedback/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOverallRating(data.overall_rating);
          setRatings({
            resolution_quality: data.resolution_quality || 0,
            response_time: data.response_time || 0,
            communication: data.communication || 0,
            professionalism: data.professionalism || 0,
          });
          setComments(data.comments || '');
          setWentWell(data.went_well || '');
          setImprovements(data.improvements || '');
          setTicketId(data.ticket_id);
        } else {
          alert('Feedback not found');
          navigate('/app/dashboard/feedback-history');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFeedback();
    }
  }, [id, navigate]);

  const handleRatingChange = (categoryId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [categoryId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updateData = {
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
      const res = await fetch(`${API_URL}/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        alert('Feedback updated successfully!');
        navigate('/app/dashboard/feedback-history');
      } else {
        alert('Failed to update feedback');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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
        onClick={() => navigate('/app/dashboard/feedback-history')}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-body text-sm font-medium">Back to Feedback History</span>
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: BAYER_BLUE }}>
          Edit Feedback
        </h1>
        <p className="font-body text-gray-600">
          Update your feedback for ticket {ticketId.substring(0,8).toUpperCase()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <label className="flex items-center gap-2 font-display text-sm font-bold mb-4 text-gray-900 uppercase tracking-wider">
            <Star size={16} className="text-yellow-500" />
            Overall Rating
            <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-4">
            <StarRating rating={Math.round(overallRating)} onRatingChange={setOverallRating} />
            {overallRating > 0 && (
              <span className="font-display text-2xl font-bold" style={{ color: BAYER_GREEN }}>
                {overallRating}.0
              </span>
            )}
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900 mb-5">
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
                  rating={ratings[category.id as keyof typeof ratings]}
                  onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
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
            disabled={isSaving || overallRating === 0}
            className="flex-1 py-4 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl flex items-center justify-center gap-2"
            style={{ backgroundColor: BAYER_GREEN }}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/dashboard/feedback-history')}
            className="px-6 py-4 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
