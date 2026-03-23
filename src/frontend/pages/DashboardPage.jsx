import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StatCard({ title, value, color = "#0f172a" }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

function SimpleBarChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  const maxValue = useMemo(() => {
    if (!safeData.length) return 1;
    return Math.max(
      ...safeData.map((d) =>
        Math.max(
          Number(d?.revenue || 0),
          Number(d?.investment || 0),
          Math.max(Number(d?.profit || 0), 0),
          Number(d?.orders || 0)
        )
      )
    );
  }, [safeData]);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Monthly Chart</h3>

      <div
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "flex-end",
          height: "280px",
          overflowX: "auto",
          paddingTop: "20px",
        }}
      >
        {safeData.map((item) => {
          const revenue = Number(item?.revenue || 0);
          const investment = Number(item?.investment || 0);
          const profit = Math.max(Number(item?.profit || 0), 0);
          const orders = Number(item?.orders || 0);

          return (
            <div
              key={item?.month || Math.random()}
              style={{
                minWidth: "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "flex-end",
                  height: "220px",
                }}
              >
                <div
                  title={`Revenue: ¥${revenue.toLocaleString()}`}
                  style={{
                    width: "18px",
                    height: `${(revenue / maxValue) * 200}px`,
                    background: "#3b82f6",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <div
                  title={`Investment: ¥${investment.toLocaleString()}`}
                  style={{
                    width: "18px",
                    height: `${(investment / maxValue) * 200}px`,
                    background: "#f59e0b",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <div
                  title={`Profit: ¥${profit.toLocaleString()}`}
                  style={{
                    width: "18px",
                    height: `${(profit / maxValue) * 200}px`,
                    background: "#10b981",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
              </div>

              <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                {item?.month || "-"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {orders} orders
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "16px",
          flexWrap: "wrap",
          fontSize: "0.9rem",
        }}
      >
        <span><span style={{ color: "#3b82f6" }}>■</span> Revenue</span>
        <span><span style={{ color: "#f59e0b" }}>■</span> Investment</span>
        <span><span style={{ color: "#10b981" }}>■</span> Profit</span>
      </div>
    </div>
  );
}

function PieChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, d) => sum + Number(d?.value || 0), 0) || 1;
  const colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  let cumulative = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Cost / Profit Circle</h3>

      <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <g transform="translate(90,90) rotate(-90)">
            {safeData.map((item, index) => {
              const value = Number(item?.value || 0);
              const dash = (value / total) * circumference;
              const gap = circumference - dash;
              const circle = (
                <circle
                  key={item?.name || index}
                  r={radius}
                  cx="0"
                  cy="0"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="24"
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-cumulative}
                />
              );
              cumulative += dash;
              return circle;
            })}
          </g>
          <text x="90" y="86" textAnchor="middle" fontSize="14" fill="#64748b">
            Total
          </text>
          <text
            x="90"
            y="108"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#0f172a"
          >
            ¥{total.toLocaleString()}
          </text>
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {safeData.map((item, index) => (
            <div key={item?.name || index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  background: colors[index % colors.length],
                  borderRadius: "50%",
                }}
              />
              <div>
                <div style={{ fontWeight: "bold" }}>{item?.name || "-"}</div>
                <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  ¥{Number(item?.value || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("Loading dashboard...");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/dashboard/summary`);
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("Non-JSON response:", text);
          setStatus("Dashboard API not found or returned invalid response");
          return;
        }

        console.log("Dashboard summary:", data);

        if (!res.ok) {
          setStatus(data.message || "Failed to load dashboard");
          return;
        }

        setSummary(data);
        setStatus("");
      } catch (err) {
        console.error(err);
        setStatus("Failed to load dashboard");
      }
    };

    load();
  }, []);

  const totalOrders = Number(summary?.totalOrders || 0);
  const totalRevenue = Number(summary?.totalRevenue || 0);
  const totalInvestment = Number(summary?.totalInvestment || 0);
  const totalProfit = Number(summary?.totalProfit || 0);
  const totalUnits = Number(summary?.totalUnits || 0);
  const avgMinutesPerOrder = Number(summary?.avgMinutesPerOrder || 0);
  const avgRevenuePerHour = Number(summary?.avgRevenuePerHour || 0);

  // support both new and old backend field names
  const totalFuelCost = Number(
    summary?.totalFuelCost ??
    summary?.totalGasFee ??
    0
  );

  const monthlyStats = Array.isArray(summary?.monthlyStats) ? summary.monthlyStats : [];
  const costBreakdown = Array.isArray(summary?.costBreakdown) ? summary.costBreakdown : [];
  const topAreas = Array.isArray(summary?.topAreas) ? summary.topAreas : [];
  const recentOrders = Array.isArray(summary?.recentOrders) ? summary.recentOrders : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>

        {status && <p>{status}</p>}

        {summary && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <StatCard title="Total Orders" value={totalOrders.toLocaleString()} />
              <StatCard title="Total Revenue" value={`¥${totalRevenue.toLocaleString()}`} color="#2563eb" />
              <StatCard title="Total Investment" value={`¥${totalInvestment.toLocaleString()}`} color="#d97706" />
              <StatCard
                title="Total Profit"
                value={`¥${totalProfit.toLocaleString()}`}
                color={totalProfit >= 0 ? "#16a34a" : "#dc2626"}
              />
              <StatCard title="Total Units" value={totalUnits.toLocaleString()} />
              <StatCard title="Avg Minutes / Order" value={avgMinutesPerOrder.toFixed(1)} />
              <StatCard title="Revenue / Hour" value={`¥${avgRevenuePerHour.toFixed(0)}`} />
              <StatCard title="Fuel Total" value={`¥${totalFuelCost.toLocaleString()}`} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <SimpleBarChart data={monthlyStats} />
              <PieChart data={costBreakdown} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Most Checked Out Areas</h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>Area</th>
                        <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>Orders</th>
                        <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>Units</th>
                        <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAreas.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ padding: "14px", color: "#64748b" }}>
                            No checkout data yet.
                          </td>
                        </tr>
                      )}

                      {topAreas.map((area) => (
                        <tr key={area?.area || Math.random()}>
                          <td style={{ padding: "10px", borderBottom: "1px solid #f1f5f9" }}>
                            {area?.area || "-"}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>
                            {Number(area?.orderCount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>
                            {Number(area?.units || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>
                            ¥{Number(area?.revenue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Recent Orders</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentOrders.length === 0 && (
                    <p style={{ color: "#64748b" }}>No orders yet.</p>
                  )}

                  {recentOrders.slice(0, 3).map((order) => (
                    <div
                      key={order?._id || Math.random()}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "12px",
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>
                        {order?.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}
                      </div>
                      <div style={{ marginTop: "6px", color: "#334155" }}>
                        Units: {Number(order?.totalUnits || 0).toLocaleString()}
                      </div>
                      <div style={{ color: "#334155" }}>
                        Revenue: ¥{Number(order?.salesAmount || 0).toLocaleString()}
                      </div>
                      <div style={{ color: "#334155" }}>
                        Investment: ¥{Number(order?.investmentAmount || 0).toLocaleString()}
                      </div>
                      <div
                        style={{
                          color: Number(order?.profit || 0) >= 0 ? "#16a34a" : "#dc2626",
                          fontWeight: "bold",
                          marginTop: "4px",
                        }}
                      >
                        Profit: ¥{Number(order?.profit || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}