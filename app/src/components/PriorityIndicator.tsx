import type { Ticket } from '@/data/mockData';

const priorityConfig: Record<string, { color: string; label: string }> = {
  P1: { color: '#EF4444', label: 'Critical' },
  P2: { color: '#F59E0B', label: 'High' },
  P3: { color: '#0055FF', label: 'Low' },
};

interface PriorityIndicatorProps {
  priority: Ticket['priority'];
  showLabel?: boolean;
}

export default function PriorityIndicator({ priority, showLabel = true }: PriorityIndicatorProps) {
  const config = priorityConfig[priority];

  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          width: '3px',
          height: '16px',
          borderRadius: '2px',
          backgroundColor: config.color,
          display: 'inline-block',
        }}
      />
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
        }}
      />
      {showLabel && (
        <span className="font-body text-xs font-medium" style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </div>
  );
}
