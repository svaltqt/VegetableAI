import { cn } from "@/lib/utils"

export function BrandMark({ className, size = 40 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="VegetableAI"
    >
      <defs>
        <radialGradient id="vegRing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf6dc" />
          <stop offset="100%" stopColor="#efe1b3" />
        </radialGradient>
        <linearGradient id="vegLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <path
          id="vegTopArc"
          d="M 28,100 a 72,72 0 0 1 144,0"
          fill="none"
        />
        <path
          id="vegBottomArc"
          d="M 32,108 a 68,68 0 0 0 136,0"
          fill="none"
        />
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#vegRing)" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#1f2c45" strokeWidth="2" />
      <circle cx="100" cy="100" r="74" fill="#fffaf0" stroke="#1f2c45" strokeWidth="1.5" />

      <text
        fill="#1f2c45"
        fontFamily="Inter, sans-serif"
        fontSize="14"
        fontWeight="800"
        letterSpacing="3"
      >
        <textPath href="#vegTopArc" startOffset="50%" textAnchor="middle">
          VEGETABLEAI
        </textPath>
      </text>

      <text
        fill="#1f2c45"
        fontFamily="Inter, sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="4"
      >
        <textPath href="#vegBottomArc" startOffset="50%" textAnchor="middle">
          AI Y ALIMENTOS
        </textPath>
      </text>

      <circle cx="100" cy="60" r="2.4" fill="#1f2c45" />

      <g fill="#1f2c45" fontFamily="Inter, sans-serif" fontWeight="900">
        <text x="78" y="118" fontSize="46" letterSpacing="-1">A</text>
        <text x="112" y="118" fontSize="46" letterSpacing="-1">I</text>
      </g>

      <path
        d="M 96 78 q 6 -10 16 -8 q -2 10 -10 14 z"
        fill="url(#vegLeaf)"
      />
      <path
        d="M 130 102 q 8 -2 14 4 q -6 8 -16 4 z"
        fill="url(#vegLeaf)"
        opacity="0.85"
      />

      <line x1="40" y1="100" x2="56" y2="100" stroke="#1f2c45" strokeWidth="1.5" />
      <line x1="144" y1="100" x2="160" y2="100" stroke="#1f2c45" strokeWidth="1.5" />
    </svg>
  )
}

export function Logo({ className, withText = true, size = "md" }) {
  const sizes = {
    sm: { mark: 32, title: "text-sm", caption: "text-[10px]" },
    md: { mark: 38, title: "text-base", caption: "text-[10px]" },
    lg: { mark: 56, title: "text-xl", caption: "text-[11px]" },
  }
  const sz = sizes[size] ?? sizes.md

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={sz.mark} />
      {withText ? (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-semibold tracking-tight text-foreground", sz.title)}>
            VegetableAI
          </span>
          <span className={cn("uppercase tracking-[0.18em] text-muted-foreground", sz.caption)}>
            AI · Alimentos
          </span>
        </div>
      ) : null}
    </div>
  )
}
