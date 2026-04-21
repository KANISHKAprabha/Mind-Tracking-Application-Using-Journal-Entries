/**
 * Three side-by-side stat cards showing trend, variation, and entry count.
 * Each card has a hover lift and a staggered fade-in.
 */
export default function StatCardsRow({ trend, variation, entryCount }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <StatCard
        label="Trend"
        value={trend.value}
        sub={trend.sub}
        subColor="var(--accent)"
        delayClass="delay-2"
      />
      <StatCard
        label="Emotional Variation"
        value={variation.value}
        sub={variation.sub}
        delayClass="delay-3"
      />
      <StatCard
        label="Entries Analyzed"
        value={entryCount}
        delayClass="delay-4"
      />
    </div>
  );
}

function StatCard({ label, value, sub, subColor, delayClass }) {
  return (
    <div
      className={`mt-card mt-card-hover fade-in ${delayClass}`}
      style={{
        flex: "1 1 180px",
        textAlign: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        className="serif"
        style={{
          fontSize: 24,
          color: "var(--text)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: subColor || "var(--muted)",
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
