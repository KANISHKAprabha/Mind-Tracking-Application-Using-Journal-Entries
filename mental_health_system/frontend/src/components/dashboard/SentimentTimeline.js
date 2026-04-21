import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { getEntryDisplay } from "../../utils/emotionMeta";

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const display = d.display;
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        maxWidth: 260,
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {formatDate(d.date)}
      </div>
      {d.snippet && (
        <div
          style={{
            fontSize: 13,
            color: "var(--text)",
            fontStyle: "italic",
            marginBottom: 8,
            lineHeight: 1.4,
          }}
        >
          "{d.snippet}"
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--text)",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: display.color,
            display: "inline-block",
          }}
        />
        <span style={{ fontWeight: 600 }}>{display.label}</span>
        <span style={{ color: "var(--muted)" }}>
          {d.score >= 0 ? "+" : ""}
          {d.score.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

/**
 * Sentiment-over-time area chart.
 * Gradient fill from green (top) to red (bottom), indigo stroke.
 */
export default function SentimentTimeline({ entries }) {
  const data = (entries || []).map((e) => ({
    date: e.created_at,
    dateLabel: formatDate(e.created_at),
    score: e.sentiment_score ?? 0,
    snippet: e.snippet || e.content?.slice(0, 80) || "",
    display: getEntryDisplay(e),
  }));

  return (
    <div className="mt-card fade-in delay-3">
      <div className="mt-section-label">SENTIMENT OVER TIME</div>
      {data.length < 2 ? (
        <div
          style={{
            color: "var(--muted)",
            fontSize: 14,
            textAlign: "center",
            padding: "32px 0",
          }}
        >
          Keep writing — your timeline appears after a few more entries.
        </div>
      ) : (
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                domain={[-1, 1]}
                ticks={[-1, 0, 1]}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeOpacity: 0.2 }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#sentimentGrad)"
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
