// UiBits.jsx
import { motion } from "framer-motion";

// UiBits.jsx
export function BrandLogo({ isVisible, theme = "whiteAccent" }) {
  const THEMES = {
    whiteAccent: {
      textClass: "text-white",                          // solid white
      glow: "0 0 28px rgba(255,255,255,0.35)",          // soft white glow
      underline: true,
    },
    cyan: {
      textClass: "bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent",
      glow: "0 0 30px rgba(34,211,238,0.6)",
      underline: false,
    },
    duo: {
      textClass: "bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent",
      glow: "0 0 28px rgba(165,243,252,0.5)",
      underline: false,
    },
    warm: {
      textClass: "bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent",
      glow: "0 0 28px rgba(251,191,36,0.45)",
      underline: false,
    },
  };
  const { textClass, glow, underline } = THEMES[theme] ?? THEMES.whiteAccent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
        filter: isVisible ? `drop-shadow(${glow})` : "none",
      }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
    >
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4">
          <span className={textClass}>CribConnect</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 0.8 : 0, y: isVisible ? 0 : 20 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-white/90 font-medium"
        >
          Find your perfect home
        </motion.p>
      </div>
    </motion.div>
  );
}


export function PropertyCard({
  listing,
  position,
  offset = { x: 0, y: -100 },
  extOpacity = 1,
  tilt = { x: 12, y: -10 },
  slide = { x: 0, y: 0 },
  size = { w: 180, h: 160 },  // from MapStage tokens
  fontScale = 0.55,           // from MapStage tokens
}) {
  if (!position) return null;

  const anchorStyle = {
    left: position.x + (offset?.x || 0),
    top: position.y + (offset?.y || 0),
    transform: "translate(-50%, -100%)",
  };

  const offsetX = offset?.x || 0;
  const stemLen = Math.max(6, Math.abs(offset?.y || 0));
  const dotRadius = 3;

  const baseFont = Math.max(10, Math.round(13 * fontScale));
  const tagFont  = Math.max(9,  Math.round(9.5 * fontScale));
  const imgH     = Math.max(32, Math.round(size.h * 0.62)); // ~42% of card height

  // Conditional blur to reduce GPU load while animating
  const dynamicCardStyles = {
    transformStyle: "preserve-3d",
    width: `${size.w}px`,
    minHeight: `${size.h}px`,
    fontSize: `${baseFont}px`,
    lineHeight: 1.15,
    willChange: "transform, opacity",
    backdropFilter: extOpacity > 0.9 ? "blur(6px)" : "none",
    background: "rgba(12,18,28,0.72)",
  };

  return (
    <div className="absolute z-[100] pointer-events-none" style={{ ...anchorStyle, perspective: 1000 }}>
{/* Flowing cyan stem (CSS glints) */}
<div
  className="absolute pointer-events-none"
  style={{ top: "100%", left: "50%", transform: "translateX(-50%)", height: stemLen }}
>
  <div className="relative w-[2px] h-full overflow-hidden" style={{width:3}}>
    {/* base line + glow */}
    <div className="absolute inset-0 bg-cyan-400/70" />
    <div className="absolute inset-0 bg-cyan-400/40 blur-[2px]" />

    {/* animated glints */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(34,211,238,0.9) 50%, rgba(0,0,0,0) 100%)",
        backgroundSize: "100% 25px",    // glint height (tweak)
        animation: "cc-flow 0.3s linear infinite",
        mixBlendMode: "screen",
      }}
    />
  </div>

  <div
    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
    style={{ width: dotRadius * 2, height: dotRadius * 2 }}
  />

  <style>{`
    @keyframes cc-flow { to { background-position-y: 18px; } }
  `}</style>
</div>


      {/* The card */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97, rotateX: tilt.x, rotateY: tilt.y }}
        animate={{ opacity: extOpacity, x: slide.x, y: slide.y, scale: 1, rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
// or go to 1.0 if you want a silkier trail
        className="
          relative rounded-2xl
          border border-white/10 ring-0 shadow-none drop-shadow-none
          pointer-events-auto
        "
        style={dynamicCardStyles}
      >
        <div className="absolute -top-6 -left-6 w-[150%] h-16 rotate-[-12deg] bg-gradient-to-r from-white/10 via-white/0 to-transparent rounded-xl pointer-events-none" />

        <div className="overflow-hidden rounded-t-2xl" style={{ height: `${imgH}px` }}>
          <img src={listing.photoUrl} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
        </div>

        <div className="p-2.5 text-white">
          <div className="mb-1.5 truncate" style={{ opacity: 0.7 }}>{listing.title}</div>
          <div className="flex items-center justify-between">
            <div className="font-semibold tracking-tight">₹{listing.price.toLocaleString("en-IN")}</div>
            <div style={{ opacity: 0.6 }}>{listing.distanceKm} km</div>
          </div>
          {listing.verified && (
            <div
              className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full
                         bg-emerald-400/15 border border-emerald-400/30 text-emerald-300"
              style={{ fontSize: `${tagFont}px` }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
