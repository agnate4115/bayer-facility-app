/**
 * Bayer logo inside a white circular badge.
 * Keeps the official logo colours intact (no recolour) while guaranteeing
 * visibility on dark / black surfaces where the navy wordmark would vanish.
 */
interface BayerLogoBadgeProps {
  size?: number;   // outer circle diameter in px
  className?: string;
}

export default function BayerLogoBadge({ size = 44, className = '' }: BayerLogoBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full flex-shrink-0 shadow-sm ${className}`}
      style={{ width: size, height: size, backgroundColor: '#FFFFFF' }}
    >
      <img
        src="/Bayer-Logo.wine.svg"
        alt="Bayer"
        style={{ width: size * 0.92, height: size * 0.92, objectFit: 'contain' }}
      />
    </div>
  );
}
