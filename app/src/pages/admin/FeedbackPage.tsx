import { useState, useEffect } from 'react';
import { Star, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/config';

export default function FeedbackPage() {
  const [period, setPeriod] = useState('monthly');
  const [aiReport, setAiReport] = useState<string>('Generating report...');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setIsLoading(true);
    setAiReport('Generating AI Report from Azure OpenAI...');
    try {
      const [feedbackRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/api/feedback/`),
        fetch(`${API_URL}/api/tickets/`)
      ]);
      
      if (feedbackRes.ok && ticketsRes.ok) {
        setFeedbacks(await feedbackRes.json());
        setTickets(await ticketsRes.json());
      }
      
      // AI Report simulation (since AI summarization is not strictly required right now, we can mock or call a real endpoint if we had one)
      setTimeout(() => {
        setAiReport('Mock AI Report: Overall feedback is positive. Real AI summarization can be added by passing all feedback texts to Azure OpenAI.');
      }, 1000);
    } catch (err) {
      console.error(err);
      setAiReport('Error generating report.');
    } finally {
      setIsLoading(false);
    }
  };

  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.overall_rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
            stroke={star <= rating ? '#F59E0B' : 'var(--text-tertiary)'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>Feedback</h1>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>AI-generated feedback reports and ratings</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg font-body text-sm outline-none"
            style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-xs uppercase tracking-widest"
            style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}>
          <span className="font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Avg Rating</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-2xl" style={{ color: 'var(--text-primary)' }}>{avgRating}</span>
            <span className="text-lg" style={{ color: '#F59E0B' }}>★</span>
          </div>
        </div>
        <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}>
          <span className="font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Total Reviews</span>
          <span className="block font-mono text-2xl mt-2" style={{ color: 'var(--text-primary)' }}>{feedbacks.length}</span>
        </div>
        <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}>
          <span className="font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>5-Star Reviews</span>
          <span className="block font-mono text-2xl mt-2" style={{ color: '#009B77' }}>{feedbacks.filter(f => f.overall_rating === 5).length}</span>
        </div>
        <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}>
          <span className="font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Response Rate</span>
          <span className="block font-mono text-2xl mt-2" style={{ color: '#0055FF' }}>--%</span>
        </div>
      </div>

      {/* AI Report Preview */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>AI Trend Analysis</h2>
          <span className="px-2 py-1 rounded text-[8px] uppercase tracking-widest" style={{ backgroundColor: 'rgba(0,155,119,0.1)', color: '#009B77' }}>
            {period} Report
          </span>
        </div>
        <div className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#01BEFF]" />
              {aiReport}
            </div>
          ) : (
            <p>{aiReport}</p>
          )}
        </div>
      </div>

      {/* Feedback List */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="px-6 py-4 font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Ticket</th>
                <th className="px-6 py-4 font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>User</th>
                <th className="px-6 py-4 font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Rating</th>
                <th className="px-6 py-4 font-display text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Date</th>
                <th className="px-6 py-4 font-display text-[8px] uppercase tracking-widest text-right" style={{ color: 'var(--text-tertiary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f, i) => {
                const ticket = tickets.find(t => t.id === f.ticket_id);
                const ticketDisplay = ticket ? ticket.id.substring(0,8).toUpperCase() : f.ticket_id.substring(0,8).toUpperCase();
                const userName = ticket ? ticket.user_name || 'Anonymous' : 'Anonymous';
                
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                        {ticketDisplay}
                      </div>
                      <div className="font-body text-xs mt-1 truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                        {f.comments || "No comment"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body text-sm" style={{ color: 'var(--text-primary)' }}>
                        {userName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(f.overall_rating)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/feedback/${f.id}`}
                        className="inline-block px-3 py-1.5 rounded font-display text-[8px] uppercase tracking-widest transition-colors"
                        style={{ backgroundColor: 'var(--surface-light)', color: 'var(--text-primary)' }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {feedbacks.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center font-body text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    No feedback found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
