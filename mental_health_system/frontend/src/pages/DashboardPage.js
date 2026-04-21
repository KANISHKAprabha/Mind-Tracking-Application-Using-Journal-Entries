import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../api/dashboard";
import { getEntries } from "../api/journal";
import WellnessRing from "../components/dashboard/WellnessRing";
import StatCardsRow from "../components/dashboard/StatCardsRow";
import SentimentTimeline from "../components/dashboard/SentimentTimeline";
import EmotionBreakdown from "../components/dashboard/EmotionBreakdown";
import RecentEntries from "../components/dashboard/RecentEntries";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

const TREND_LABEL = {
  improving: "Improving",
  declining: "Shifting",
  stable: "Steady",
  insufficient_data: "Building",
};

const VARIATION_LABEL = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  insufficient_data: "Building",
};

/**
 * The wellness dashboard.
 * Loads dashboard summary + full journal entries, then renders all sections.
 */
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getDashboard(), getEntries()])
      .then(([dashRes, entriesRes]) => {
        if (cancelled) return;
        if (dashRes.status === "fulfilled") {
          setData(dashRes.value.data.data);
        } else {
          setError("We couldn't load your dashboard right now.");
        }
        if (entriesRes.status === "fulfilled") {
          // Filter to entries that have a sentiment_score so the chart works
          const list = (entriesRes.value.data.data || []).filter(
            (e) => e.sentiment_score != null
          );
          // Sort oldest → newest for the timeline
          list.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          setTimelineEntries(list);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      {loading ? (
        <DashboardSkeleton />
      ) : error || !data ? (
        <div className="mt-card" style={{ textAlign: "center", padding: 40 }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>
            We're having trouble loading your dashboard
          </h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {error || "Please try again in a moment."}
          </p>
        </div>
      ) : (
        <DashboardContent
          data={data}
          timelineEntries={timelineEntries}
          onWriteEntry={() => navigate("/journal")}
        />
      )}
    </div>
  );
}

function DashboardContent({ data, timelineEntries, onWriteEntry }) {
  const wellness = data.wellness || {};
  const analytics = data.analytics || {};
  const trend = analytics.trend || { direction: "insufficient_data", change: 0 };
  const volatility = analytics.volatility || { level: "insufficient_data", volatility: 0 };
  const distribution = analytics.distribution || {};
  const recentEntries = data.recent_entries || [];

  // Trend display
  const trendValue = TREND_LABEL[trend.direction] || "Building";
  const trendSub =
    trend.change != null && trend.direction !== "insufficient_data"
      ? `${trend.change > 0 ? "+" : ""}${trend.change.toFixed(2)}`
      : "Keep writing";

  // Variation display
  const variationValue = VARIATION_LABEL[volatility.level] || "Building";
  const variationSub =
    volatility.level !== "insufficient_data"
      ? `σ ${volatility.volatility.toFixed(2)}`
      : "Keep writing";

  // Wellness percentage from API
  const wellnessPct = wellness.score_pct ?? 0;
  const wellnessLabel = wellness.label || "Your wellness";
  const wellnessDescription =
    wellness.explanation ||
    "Your wellness picture grows clearer with every entry you write.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
      <WellnessRing
        percent={wellnessPct}
        label={wellnessLabel}
        description={wellnessDescription}
      />

      <StatCardsRow
        trend={{ value: trendValue, sub: trendSub }}
        variation={{ value: variationValue, sub: variationSub }}
        entryCount={analytics.entry_count ?? 0}
      />

      <SentimentTimeline entries={timelineEntries} />

      <EmotionBreakdown
        entries={timelineEntries}
        distribution={distribution}
      />

      <RecentEntries entries={recentEntries} />

      <button
        type="button"
        className="mt-btn mt-btn-cta fade-in delay-6"
        onClick={onWriteEntry}
        style={{
          position: "fixed",
          right: 32,
          bottom: 32,
          zIndex: 50,
        }}
      >
        ✎ Write Entry
      </button>
    </div>
  );
}
