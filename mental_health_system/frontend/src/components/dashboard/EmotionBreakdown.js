import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  EMOTION_COLORS,
  EMOTION_LABELS,
  EMOTION_ORDER,
  hexToRgba,
} from "../../utils/emotionMeta";

// Legacy fallback colors when only POSITIVE/NEGATIVE distribution exists
const FALLBACK_COLORS = {
  Positive: "#34d399",
  Neutral: "#94a3b8",
  Negative: "#f87171",
};

/**
 * Donut chart of mood distribution.
 * Prefers per-entry 7-emotion aggregation when entries are available.
 * Falls back to the backend's positive/neutral/negative distribution otherwise.
 * Hover a slice or legend row to highlight that segment.
 */
export default function EmotionBreakdown({ entries, distribution }) {
  const [hovered, setHovered] = useState(null);

  // Aggregate emotions from per-entry labels (preferred path).
  const data = useMemo(() => {
    if (entries && entries.length) {
      const counts = {};
      entries.forEach((e) => {
        const raw = (e.sentiment_label || "").toLowerCase();
        if (EMOTION_COLORS[raw]) {
          counts[raw] = (counts[raw] || 0) + 1;
        }
      });

      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      if (total > 0) {
        return EMOTION_ORDER.filter((k) => counts[k]).map((k) => ({
          name: EMOTION_LABELS[k],
          value: Math.round((counts[k] / total) * 100),
          rawCount: counts[k],
          color: EMOTION_COLORS[k],
        }));
      }
    }

    // Fallback: backend's 3-bucket distribution (legacy entries only)
    if (distribution) {
      return [
        {
          name: "Positive",
          value: distribution.positive_pct ?? 0,
          color: FALLBACK_COLORS.Positive,
        },
        {
          name: "Neutral",
          value: distribution.neutral_pct ?? 0,
          color: FALLBACK_COLORS.Neutral,
        },
        {
          name: "Negative",
          value: distribution.negative_pct ?? 0,
          color: FALLBACK_COLORS.Negative,
        },
      ].filter((d) => d.value > 0);
    }

    return [];
  }, [entries, distribution]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mt-card fade-in delay-4">
      <div className="mt-section-label">EMOTION BREAKDOWN</div>
      {total === 0 ? (
        <div
          style={{
            color: "var(--muted)",
            fontSize: 14,
            textAlign: "center",
            padding: "32px 0",
          }}
        >
          Keep writing — your mood mix appears after a few more entries.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 200, height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  onMouseLeave={() => setHovered(null)}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="var(--card)"
                      strokeWidth={3}
                      opacity={
                        hovered === null || hovered === entry.name ? 1 : 0.3
                      }
                      onMouseEnter={() => setHovered(entry.name)}
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.25s ease",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minWidth: 160,
            }}
          >
            {data.map((d) => (
              <div
                key={d.name}
                onMouseEnter={() => setHovered(d.name)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  opacity: hovered === null || hovered === d.name ? 1 : 0.3,
                  transition: "opacity 0.25s ease",
                  background:
                    hovered === d.name ? hexToRgba(d.color, 0.08) : "transparent",
                  borderRadius: 8,
                  padding: "4px 8px",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: d.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text)",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {d.name}
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {Math.round(d.value)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
