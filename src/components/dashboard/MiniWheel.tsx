import { WheelDomain } from '@/types/alignment';
import { WHEEL_DOMAINS } from '@/data/wheel-domains';

interface MiniWheelProps {
  scores: Record<WheelDomain, number>;
  onClick?: () => void;
  size?: number;
}

export function MiniWheel({ scores, onClick, size = 80 }: MiniWheelProps) {
  const center = size / 2;
  const maxRadius = (size - 8) / 2;
  const numDomains = WHEEL_DOMAINS.length;

  // Calculate points for the filled polygon based on scores
  const getPolygonPoints = () => {
    return WHEEL_DOMAINS.map((domain, index) => {
      const angle = (index * 360 / numDomains - 90) * (Math.PI / 180);
      const score = scores[domain.id] || 1;
      const radius = (score / 10) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };


  return (
    <button
      onClick={onClick}
      className="relative group hover:scale-105 transition-transform"
      aria-label="View Life Wheel"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={maxRadius}
          fill="hsl(var(--muted))"
          opacity={0.3}
        />
        
        {/* Filled polygon based on scores */}
        <polygon
          points={getPolygonPoints()}
          fill="hsl(var(--primary))"
          opacity={0.6}
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
        />
        
        {/* Center point */}
        <circle
          cx={center}
          cy={center}
          r={3}
          fill="hsl(var(--primary))"
        />
        
        {/* Grid circles at 33% and 66% */}
        {[0.33, 0.66].map((ratio) => (
          <circle
            key={ratio}
            cx={center}
            cy={center}
            r={maxRadius * ratio}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            opacity={0.5}
          />
        ))}
        
        {/* Spokes */}
        {WHEEL_DOMAINS.map((_, index) => {
          const angle = (index * 360 / numDomains - 90) * (Math.PI / 180);
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.3}
            />
          );
        })}
      </svg>
      
      {/* Label overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight pointer-events-none">
        <span className="text-[9px] font-semibold text-foreground">Life</span>
        <span className="text-[9px] font-semibold text-foreground">Balance</span>
      </div>
    </button>
  );
}
