import { useEffect, useRef, useState } from "react";

/**
 * Animated circular wellness ring.
 * Fills from 0 → target percentage on mount via requestAnimationFrame (~1.2s ease-out).
 * Number inside ring counts up in sync.
 */
export default function WellnessRing({ percent = 0, label, description }) {
  const target = Math.max(0, Math.min(100, Math.round(percent)));
  const [shown, setShown] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setShown(Math.round(easeOut(t) * target));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target]);

  // Color thresholds
  const ringColor =
    target >= 80 ? "#34d399" : target >= 60 ? "#fbbf24" : "#f87171";

  // SVG geometry
  const size = 200;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (shown / 100) * circumference;

  return (
    <div className="mt-card fade-in" style={{ textAlign: "center", padding: 32 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          margin: "0 auto",
        }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke 0.4s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="serif"
            style={{
              fontSize: 44,
              lineHeight: 1,
              color: "var(--text)",
            }}
          >
            {shown}
            <span style={{ fontSize: 22, color: "var(--muted)" }}>%</span>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: "0.12em",
              marginTop: 6,
            }}
          >
            WELLNESS
          </div>
        </div>
      </div>

      {label && (
        <h3
          style={{
            fontSize: 22,
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          {label}
        </h3>
      )}
      {description && (
        <p
          style={{
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 460,
            margin: "0 auto",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
