/**
 * Skeleton placeholder shown while the dashboard is loading.
 * Mirrors the real dashboard's section shapes.
 */
export default function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Wellness ring placeholder */}
      <div className="mt-card" style={{ textAlign: "center", padding: 32 }}>
        <div
          className="mt-skeleton"
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            margin: "0 auto",
          }}
        />
        <div
          className="mt-skeleton"
          style={{ height: 18, width: "50%", margin: "20px auto 8px" }}
        />
        <div
          className="mt-skeleton"
          style={{ height: 12, width: "70%", margin: "0 auto" }}
        />
      </div>

      {/* Stat cards row */}
      <div style={{ display: "flex", gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mt-card"
            style={{ flex: 1, padding: 20 }}
          >
            <div
              className="mt-skeleton"
              style={{ height: 10, width: "60%", marginBottom: 14 }}
            />
            <div
              className="mt-skeleton"
              style={{ height: 22, width: "80%", marginBottom: 8 }}
            />
            <div className="mt-skeleton" style={{ height: 10, width: "40%" }} />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="mt-card">
        <div
          className="mt-skeleton"
          style={{ height: 12, width: 160, marginBottom: 16 }}
        />
        <div className="mt-skeleton" style={{ height: 220 }} />
      </div>

      {/* Donut + entries placeholder */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div className="mt-card" style={{ flex: "1 1 280px" }}>
          <div
            className="mt-skeleton"
            style={{ height: 12, width: 160, marginBottom: 16 }}
          />
          <div
            className="mt-skeleton"
            style={{
              height: 180,
              width: 180,
              borderRadius: "50%",
              margin: "0 auto",
            }}
          />
        </div>
        <div className="mt-card" style={{ flex: "1 1 280px" }}>
          <div
            className="mt-skeleton"
            style={{ height: 12, width: 160, marginBottom: 16 }}
          />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="mt-skeleton"
              style={{ height: 60, marginBottom: 10 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
