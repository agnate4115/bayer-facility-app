import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, ShieldCheck, User } from 'lucide-react';
import { API_URL } from '@/config';

interface Comment {
  id: string;
  ticket_id: string;
  author_name: string;
  author_role: string;   // "Admin" | "Employee"
  message: string;
  stage?: string | null;
  created_at: string;
}

interface TicketCommentsProps {
  ticketId: string;
  /** Who is posting on this page */
  currentRole: 'Admin' | 'Employee';
  currentName: string;
  /** Accent for the current viewer's own bubbles */
  accent?: string;
  /** Optional current ticket stage/status, attached to new admin comments */
  stage?: string;
}

const BAYER_GREEN = '#56D500';
const BAYER_CYAN = '#01BEFF';

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(iso: string) {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
    ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function TicketComments({ ticketId, currentRole, currentName, accent, stage }: TicketCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const myAccent = accent || (currentRole === 'Admin' ? BAYER_GREEN : BAYER_CYAN);

  const load = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (e) {
      console.error('load comments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ticketId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [comments]);

  const submit = async () => {
    const text = message.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: currentName,
          author_role: currentRole,
          message: text,
          stage: currentRole === 'Admin' ? (stage || null) : null,
        }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(prev => [...prev, c]);
        setMessage('');
      }
    } catch (e) {
      console.error('post comment', e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface-mid)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${myAccent}1A` }}>
          <MessageSquare size={16} style={{ color: myAccent }} />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Conversation</h3>
          <p className="font-body text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {comments.length === 0 ? 'No messages yet' : `${comments.length} message${comments.length > 1 ? 's' : ''}`} · Facilities team ↔ Reporter
          </p>
        </div>
      </div>

      {/* Thread */}
      <div ref={listRef} className="px-5 py-4 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={22} className="animate-spin" style={{ color: myAccent }} />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={28} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-tertiary)' }} />
            <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>Start the conversation</p>
            <p className="font-body text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {currentRole === 'Admin'
                ? 'Post an update — the reporter will be able to reply.'
                : 'Ask a question or add details — the facilities team will respond.'}
            </p>
          </div>
        ) : (
          comments.map((c) => {
            const isAdmin = c.author_role === 'Admin';
            const mine = c.author_role === currentRole;
            const bubbleAccent = isAdmin ? BAYER_GREEN : BAYER_CYAN;
            return (
              <div key={c.id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-display text-[11px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: bubbleAccent }}
                  title={c.author_name}
                >
                  {initials(c.author_name)}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[78%] ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-1.5 mb-1 ${mine ? 'flex-row-reverse' : ''}`}>
                    <span className="font-display text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                      {c.author_name}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-display text-[8px] uppercase tracking-wider font-bold"
                      style={{ backgroundColor: `${bubbleAccent}1A`, color: bubbleAccent }}
                    >
                      {isAdmin ? <ShieldCheck size={9} /> : <User size={9} />}
                      {isAdmin ? 'Facilities' : 'Reporter'}
                    </span>
                    {c.stage && (
                      <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-light)', color: 'var(--text-tertiary)' }}>
                        {c.stage}
                      </span>
                    )}
                  </div>
                  <div
                    className="px-3.5 py-2.5 rounded-2xl font-body text-[13px] leading-relaxed"
                    style={{
                      backgroundColor: mine ? bubbleAccent : 'var(--surface-light)',
                      color: mine ? '#FFFFFF' : 'var(--text-primary)',
                      borderTopRightRadius: mine ? '4px' : undefined,
                      borderTopLeftRadius: !mine ? '4px' : undefined,
                    }}
                  >
                    {c.message}
                  </div>
                  <span className="font-body text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)' }}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
            rows={1}
            placeholder={currentRole === 'Admin' ? 'Write an update to the reporter…' : 'Reply to the facilities team…'}
            className="flex-1 bg-transparent outline-none resize-none font-body text-[13px] py-1 max-h-28"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            onClick={submit}
            disabled={!message.trim() || posting}
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ backgroundColor: myAccent }}
            title="Send (Enter)"
          >
            {posting ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
          </button>
        </div>
        <p className="font-body text-[10px] mt-1.5 ml-1" style={{ color: 'var(--text-tertiary)' }}>
          Posting as <span className="font-semibold" style={{ color: myAccent }}>{currentName}</span> · Press Enter to send
        </p>
      </div>
    </div>
  );
}
