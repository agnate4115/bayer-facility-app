import type { Ticket } from '@/data/mockData';

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  Submitted: { bg: '#0055FF14', text: '#0055FF', border: '#0055FF30' },
  Acknowledged: { bg: '#0055FF0D', text: '#0055FF', border: '#0055FF20' },
  Assigned: { bg: '#0055FF14', text: '#0055FF', border: '#0055FF30' },
  'In Progress': { bg: '#0055FF14', text: '#0055FF', border: '#0055FF30' },
  'On Hold': { bg: '#F59E0B14', text: '#F59E0B', border: '#F59E0B30' },
  Resolved: { bg: '#009B7714', text: '#009B77', border: '#009B7730' },
  Closed: { bg: '#52525B14', text: '#52525B', border: '#52525B30' },
  Escalated: { bg: '#EF444414', text: '#EF4444', border: '#EF444430' },
};

interface StatusBadgeProps {
  status: Ticket['status'];
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['Submitted'];
  const isInProgress = status === 'In Progress';

  return (
    <span
      className="inline-flex items-center gap-1.5 font-display uppercase"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: '6px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '10px' : '11px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        lineHeight: 1,
      }}
    >
      <span
        className={isInProgress ? 'animate-pulse-glow' : ''}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          display: 'inline-block',
        }}
      />
      {status}
    </span>
  );
}
