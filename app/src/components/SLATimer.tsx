import { Clock } from 'lucide-react';

interface SLATimerProps {
  elapsed: number; // 0-100 percentage
  breached?: boolean;
}

export default function SLATimer({ elapsed, breached = false }: SLATimerProps) {
  const getColor = () => {
    if (breached || elapsed >= 100) return '#EF4444';
    if (elapsed >= 75) return '#F59E0B';
    return 'var(--text-secondary)';
  };

  const color = getColor();
  const isCritical = elapsed >= 75 || breached;

  // Format remaining time display
  const hours = Math.max(0, Math.floor((100 - elapsed) / 100 * 8));
  const mins = Math.max(0, Math.floor(((100 - elapsed) / 100 * 8 * 60) % 60));
  const display = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-1.5 font-mono text-[13px] ${isCritical ? 'animate-sla-breach' : ''}`}>
      <Clock size={14} style={{ color }} />
      <span style={{ color }}>{display}</span>
    </div>
  );
}
