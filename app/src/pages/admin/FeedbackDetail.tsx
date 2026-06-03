import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackDetailView from '@/components/FeedbackDetailView';
import { Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

export default function FeedbackDetail() {
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
      <div className="p-6 lg:p-8" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center py-16">
          <p className="font-body text-lg" style={{ color: 'oklch(0.45 0.01 250)' }}>Feedback not found</p>
          <a
            href="/admin/feedback"
            className="mt-4 inline-block font-display text-xs uppercase tracking-widest"
            style={{ color: '#01BEFF' }}
          >
            Back to feedback
          </a>
        </div>
      </div>
    );
  }

  const user = azureAdPeople.find(p => p.id === feedback.user_id || p.email === ticket?.user_name || p.displayName === ticket?.user_name);
  
  const feedbackForView = {
    id: feedback.id,
    ticketId: feedback.ticket_id.substring(0,8).toUpperCase(),
    ticketTitle: ticket?.description.substring(0,50) + "...",
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
    office: ticket?.office || 'Unknown Office',
    submittedBy: user?.displayName || ticket?.user_name || 'Anonymous',
    submittedByEmail: user?.email,
    submittedByDesignation: user?.designation || 'Employee',
    submittedByDepartment: user?.department,
    aiSummary: `Based on this ${feedback.overall_rating}-star rating, the customer experienced ${
      feedback.overall_rating >= 4 ? 'excellent' : feedback.overall_rating >= 3 ? 'satisfactory' : 'unsatisfactory'
    } service. ${ticket ? `The issue was categorized as ${ticket.category_name} and resolved by ${ticket.assigned_to}.` : ''} ${
      feedback.comments || ''
    }`,
  };

  return (
    <div className="p-6 lg:p-8">
      <FeedbackDetailView
        feedback={feedbackForView}
        backLink="/admin/feedback"
        backLabel="Back to feedback"
        showTicketLink={true}
        isAdminView={true}
      />
    </div>
  );
}
