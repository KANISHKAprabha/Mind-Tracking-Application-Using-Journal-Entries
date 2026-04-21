import { useState } from "react";
import { getEntryDisplay } from "../../utils/emotionMeta";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/**
 * Recent entries list. Click any entry to expand and show its details.
 * Pill shows the actual emotion (joy / sadness / anger / etc.) when available,
 * falling back to a Positive/Neutral/Negative bucket for legacy entries.
 */
export default function RecentEntries({ entries }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="mt-card fade-in delay-5">
      <div className="mt-section-label">RECENT ENTRIES</div>
      {(!entries || entries.length === 0) ? (
        <div
          style={{
            color: "var(--muted)",
            fontSize: 14,
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          No entries yet. Your reflections will appear here.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((e) => {
            const display = getEntryDisplay(e);
            const isOpen = expandedId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => setExpandedId(isOpen ? null : e.id)}
                style={{
                  border: `1px solid ${
                    isOpen ? display.color + "40" : "var(--border)"
                  }`,
                  borderRadius: 14,
                  padding: 14,
                  background: isOpen
                    ? "rgba(99, 102, 241, 0.04)"
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {formatDate(e.created_at)}
                  </div>
                  <span
                    style={{
                      background: display.bg,
                      color: display.color,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {display.label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {e.snippet || e.content?.slice(0, 120)}
                </p>

                {isOpen && (
                  <div
                    className="fade-in"
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: display.color,
                          marginRight: 6,
                        }}
                      />
                      {display.isEmotion ? "Emotion" : "Mood"}:{" "}
                      <strong style={{ color: "var(--text)" }}>
                        {display.label}
                      </strong>
                    </div>
                    <div>
                      Sentiment:{" "}
                      <strong style={{ color: "var(--text)" }}>
                        {e.sentiment_score != null
                          ? (e.sentiment_score >= 0 ? "+" : "") +
                            e.sentiment_score.toFixed(2)
                          : "—"}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
