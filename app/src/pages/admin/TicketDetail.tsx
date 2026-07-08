import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TicketDetailView from '@/components/TicketDetailView';
import { Loader2 } from 'lucide-react';
import { azureAdPeople } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

const teams = ['HVAC Team', 'Electrical Team', 'Plumbing Team', 'IT Team', 'Facilities Team', 'Security Team'];
const assignees = azureAdPeople.map(p => p.displayName);

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [offices, setOffices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, officesRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/tickets/${id}`),
        fetch(`${API_URL}/api/offices/`),
        fetch(`${API_URL}/api/settings/categories`)
      ]);
      
      if (ticketRes.ok) {
        setTicket(await ticketRes.json());
      }
      if (officesRes.ok) {
        setOffices(await officesRes.json());
      }
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicket = async (updates: any) => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setTicket(await res.json());
      }
    } catch (err) {
      console.error('Failed to update ticket', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex justify-center items-center" style={{ backgroundColor: 'var(--surface-dark)', minHeight: '100vh' }}>
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 lg:p-8" style={{ backgroundColor: 'var(--surface-dark)' }}>
        <div className="text-center py-16">
          <p className="font-body text-lg" style={{ color: 'oklch(0.45 0.01 250)' }}>Ticket not found</p>
          <Link to="/admin/tickets" className="mt-4 inline-block font-display text-xs uppercase tracking-widest" style={{ color: '#01BEFF' }}>
            Back to tickets
          </Link>
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

  const handleStatusChange = (newStatus: string) => {
    updateTicket({ status: newStatus });
  };

  const handleAssigneeChange = (newAssigneeName: string) => {
    // Find AD user id
    const adPerson = azureAdPeople.find(p => p.displayName === newAssigneeName);
    if (adPerson) {
      updateTicket({ assigned_to: adPerson.id });
    }
  };

  const handleTeamChange = (newTeam: string) => {
    // Look up the category ID for the chosen team name if needed
    const cat = categories.find(c => c.name === newTeam);
    if (cat) {
      updateTicket({ category_id: cat.id, category_name: cat.name });
    }
  };

  const dynamicTeams = categories.map(c => c.name);

  return (
    <TicketDetailView
      ticket={mappedTicket}
      backLink="/admin/tickets"
      backLabel="Back to tickets"
      isAdminView={true}
      onStatusChange={handleStatusChange}
      onAssigneeChange={handleAssigneeChange}
      onTeamChange={handleTeamChange}
      assignees={assignees}
      teams={dynamicTeams}
    />
  );
}
