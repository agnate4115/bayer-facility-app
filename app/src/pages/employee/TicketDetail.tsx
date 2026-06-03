import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailView from '@/components/TicketDetailView';
import { Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offices, setOffices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, officesRes] = await Promise.all([
          fetch(`${API_URL}/api/tickets/${id}`),
          fetch(`${API_URL}/api/offices/`)
        ]);
        
        if (ticketRes.ok) {
          setTicket(await ticketRes.json());
        }
        if (officesRes.ok) {
          setOffices(await officesRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <h1 className="font-display text-xl font-semibold mb-2 text-gray-900">Ticket not found</h1>
          <p className="font-body text-sm text-gray-600 mb-6">
            The ticket you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/app/dashboard/ticket-history')}
            className="px-6 py-3 rounded-lg font-display text-sm font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: '#56D500' }}
          >
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  const office = offices.find(o => o.id === ticket.office_id);
  const assignee = azureAdPeople.find(p => p.id === ticket.assigned_to);
  const assigneeName = assignee ? assignee.displayName : ticket.assigned_to;
  
  const mappedTicket = {
    id: ticket.id,
    ticketNumber: ticket.id.substring(0, 13).toUpperCase(),
    subject: ticket.description.substring(0, 50),
    description: ticket.description,
    status: ticket.status || 'Open',
    priority: ticket.priority,
    office: office ? office.name : 'Unknown',
    floor: ticket.floor || '',
    zone: ticket.zone || '',
    location: `Floor ${ticket.floor}, ${ticket.zone}`,
    createdAt: ticket.created_at,
    category: ticket.category_name || 'Uncategorized',
    department: ticket.category_name || 'Uncategorized',
    team: ticket.category_name || 'Uncategorized',
    assignee: assigneeName,
    reportedBy: ticket.user_name || 'Anonymous',
    reportedByEmail: `${(ticket.user_name || 'user').toLowerCase().replace(' ', '.')}@bayer.com`,
    aiSummary: ticket.ai_summary || '',
    locationId: ticket.id.substring(0, 8),
    photos: ticket.image_urls ? (typeof ticket.image_urls === 'string' ? JSON.parse(ticket.image_urls) : ticket.image_urls) : []
  };

  return (
    <div className="max-w-6xl mx-auto">
      <TicketDetailView
        ticket={mappedTicket}
        backLink="/app/dashboard/ticket-history"
        backLabel="Back to My Tickets"
        isAdminView={false}
      />
    </div>
  );
}
