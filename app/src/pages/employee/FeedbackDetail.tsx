import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackDetailView from '@/components/FeedbackDetailView';
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/config';

interface User {
  name: string;
  email: string;
  profilePic: string;
  designation: string;
  department: string;
  office: string;
}

interface FeedbackDetailProps {
  user?: User;
}

export default function FeedbackDetail({ user }: FeedbackDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fbRes = await fetch(`${API_URL}/api/feedback/${id}`);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          setFeedback(fbData);
          
          const tRes = await fetch(`${API_URL}/api/tickets/${fbData.ticket_id}`);
          if (tRes.ok) {
            setTicket(await tRes.json());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <h1 className="font-display text-xl font-semibold mb-2 text-gray-900">Feedback not found</h1>
          <p className="font-body text-sm text-gray-600 mb-6">
            The feedback you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/app/dashboard/feedback-history')}
            className="px-6 py-3 rounded-lg font-display text-sm font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: '#56D500' }}
          >
            Back to Feedback History
          </button>
        </div>
      </div>
    );
  }

  const feedbackForView = {
    id: feedback.id,
    ticketId: feedback.ticket_id.substring(0,8).toUpperCase(),
    ticketTitle: ticket ? ticket.description.substring(0, 50) : "Unknown Ticket",
    submittedDate: feedback.created_at,
    rating: feedback.overall_rating,
    ratings: {
      resolution_quality: feedback.resolution_quality || 0,
      response_time: feedback.response_time || 0,
      communication: feedback.communication || 0,
      professionalism: feedback.professionalism || 0,
    },
    comment: feedback.comments,
    wentWell: feedback.went_well,
    improvements: feedback.improvements,
    technician: ticket?.assigned_to || 'Service Team',
    category: ticket?.category_name || 'Uncategorized',
    office: user?.office || 'Unknown Office',
    aiSummary: `Your feedback shows an overall rating of ${feedback.overall_rating}/5.0 for this ticket.`,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <FeedbackDetailView
        feedback={feedbackForView}
        backLink="/app/dashboard/feedback-history"
        backLabel="Back to Feedback History"
        showTicketLink={true}
      />
    </div>
  );
}
