import { WheelDomain } from '@/types/alignment';
import { WHEEL_DOMAINS } from '@/data/wheel-domains';
import { cn } from '@/lib/utils';

interface WheelDiagramProps {
  scores: Record<WheelDomain, number>;
  size?: number;
  showLabels?: boolean;
  showGraduation?: boolean;
  className?: string;
}

// Domain colors matching the reference image
const DOMAIN_COLORS: Record<WheelDomain, string> = {
  physical: '#5BA4D4',   // Light blue
  career: '#F5C842',     // Yellow/Gold
  finances: '#7ED321',   // Green
  health: '#F5A623',     // Orange
  family: '#4A7C3A',     // Dark green
  romance: '#E74C3C',    // Red
  growth: '#9B59B6',     // Purple
  fun: '#CD853F',        // Bronze/Brown
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function WheelDiagram({
  scores,
  size = 300,
  showLabels = true,
  showGraduation = true,
  className,
}: WheelDiagramProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - (showLabels ? 65 : 10);
  const segmentAngle = (2 * Math.PI) / 8;

  // Calculate label positions outside the wheel
  const getLabelPosition = (index: number) => {
    const angle = index * segmentAngle + segmentAngle / 2 - Math.PI / 2;
    const labelRadius = maxRadius + 35;
    return {
      x: cx + labelRadius * Math.cos(angle),
      y: cy + labelRadius * Math.sin(angle),
      angle: angle,
    };
  };

  // Get text anchor based on position
  const getTextAnchor = (angle: number): 'start' | 'middle' | 'end' => {
    const normalizedAngle = ((angle + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (normalizedAngle < Math.PI * 0.25 || normalizedAngle > Math.PI * 1.75) return 'middle';
    if (normalizedAngle < Math.PI * 0.75) return 'start';
    if (normalizedAngle < Math.PI * 1.25) return 'middle';
    return 'end';
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn('w-full h-auto max-w-[320px] mx-auto', className)}
    >
      {/* Background segments (full 10/10) */}
      {WHEEL_DOMAINS.map((domain, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        return (
          <path
            key={`bg-${domain.id}`}
            d={describeArc(cx, cy, maxRadius, startAngle, endAngle)}
            fill={DOMAIN_COLORS[domain.id]}
            fillOpacity={0.15}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}

      {/* Graduation circles */}
      {showGraduation && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={maxRadius * 0.5}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
          <text
            x={cx + 8}
            y={cy - maxRadius * 0.5 + 4}
            fontSize={10}
            fill="hsl(var(--muted-foreground))"
            className="select-none"
          >
            5
          </text>
          <text
            x={cx + 8}
            y={cy - maxRadius + 4}
            fontSize={10}
            fill="hsl(var(--muted-foreground))"
            className="select-none"
          >
            10
          </text>
        </>
      )}

      {/* Score segments (filled proportionally) */}
      {WHEEL_DOMAINS.map((domain, index) => {
        const score = scores[domain.id] || 0;
        const fillRadius = (score / 10) * maxRadius;
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        
        return (
          <path
            key={`score-${domain.id}`}
            d={describeArc(cx, cy, fillRadius, startAngle, endAngle)}
            fill={DOMAIN_COLORS[domain.id]}
            fillOpacity={0.85}
            stroke={DOMAIN_COLORS[domain.id]}
            strokeWidth={2}
            className="transition-all duration-500 ease-out"
            style={{
              animation: `wheel-segment-fill 0.6s ease-out ${index * 0.08}s both`,
            }}
          />
        );
      })}

      {/* Segment divider lines */}
      {WHEEL_DOMAINS.map((_, index) => {
        const angle = index * segmentAngle - Math.PI / 2;
        const endPoint = polarToCartesian(cx, cy, maxRadius, index * segmentAngle);
        return (
          <line
            key={`line-${index}`}
            x1={cx}
            y1={cy}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
        );
      })}

      {/* Center circle */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth={2}
      />

      {/* Labels */}
      {showLabels &&
        WHEEL_DOMAINS.map((domain, index) => {
          const pos = getLabelPosition(index);
          const textAnchor = getTextAnchor(pos.angle);
          const score = scores[domain.id] || 0;

          return (
            <g key={`label-${domain.id}`}>
              <text
                x={pos.x}
                y={pos.y - 6}
                fontSize={10}
                fontWeight={500}
                fill="hsl(var(--foreground))"
                textAnchor={textAnchor}
                className="select-none"
              >
                {domain.emoji} {domain.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                fontSize={12}
                fontWeight={600}
                fill={DOMAIN_COLORS[domain.id]}
                textAnchor={textAnchor}
                className="select-none"
              >
                {score}/10
              </text>
            </g>
          );
        })}

      <style>
        {`
          @keyframes wheel-segment-fill {
            from {
              opacity: 0;
              transform: scale(0);
              transform-origin: ${cx}px ${cy}px;
            }
            to {
              opacity: 1;
              transform: scale(1);
              transform-origin: ${cx}px ${cy}px;
            }
          }
        `}
      </style>
    </svg>
  );
}
