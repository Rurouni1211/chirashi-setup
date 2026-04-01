import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StatCard({ title, value, color = "#0f172a", isMobile }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: isMobile ? "16px" : "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: isMobile ? "0.88rem" : "0.95rem",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: isMobile ? "1.35rem" : "1.8rem",
          fontWeight: "bold",
          color,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SimpleBarChart({ data = [], t, isMobile, viewMode }) {
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

  const chartTitle =
    viewMode === "overall"
      ? t("overallChart") || "Overall Chart"
      : viewMode === "monthly"
      ? t("dailyChart") || "Daily Chart"
      : t("monthlyChart");

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: isMobile ? "16px" : "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: isMobile ? "1rem" : "1.15rem" }}>
        {chartTitle}
      </h3>

      <div
        style={{
          display: "flex",
          gap: isMobile ? "12px" : "18px",
          alignItems: "flex-end",
          height: isMobile ? "220px" : "280px",
          overflowX: "auto",
          paddingTop: "20px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {safeData.map((item, idx) => {
          const revenue = Number(item?.revenue || 0);
          const investment = Number(item?.investment || 0);
          const profit = Math.max(Number(item?.profit || 0), 0);
          const orders = Number(item?.orders || 0);

          return (
            <div
              key={item?.label || item?.day || item?.month || item?.year || idx}
              style={{
                minWidth: isMobile ? "72px" : "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "flex-end",
                  height: isMobile ? "170px" : "220px",
                }}
              >
                <div
                  style={{
                    width: isMobile ? "14px" : "18px",
                    height: `${(revenue / maxValue) * (isMobile ? 150 : 200)}px`,
                    background: "#3b82f6",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <div
                  style={{
                    width: isMobile ? "14px" : "18px",
                    height: `${(investment / maxValue) * (isMobile ? 150 : 200)}px`,
                    background: "#f59e0b",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <div
                  style={{
                    width: isMobile ? "14px" : "18px",
                    height: `${(profit / maxValue) * (isMobile ? 150 : 200)}px`,
                    background: "#10b981",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
              </div>

              <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                {item?.label || item?.day || item?.month || item?.year || "-"}
              </div>

              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {orders} {t("orders").toLowerCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PieChart({ data = [], isMobile }) {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, d) => sum + Number(d?.value || 0), 0) || 1;
  const colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];
  let cumulative = 0;
  const radius = isMobile ? 55 : 70;
  const circumference = 2 * Math.PI * radius;
  const size = isMobile ? 150 : 180;
  const center = size / 2;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${center},${center}) rotate(-90)`}>
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
                strokeWidth={isMobile ? "20" : "24"}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-cumulative}
              />
            );

            cumulative += dash;
            return circle;
          })}
        </g>

        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          fontSize={isMobile ? "12" : "14"}
          fill="#64748b"
        >
          Total
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          fontSize={isMobile ? "13" : "16"}
          fontWeight="bold"
          fill="#0f172a"
        >
          ¥{total.toLocaleString()}
        </text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("Loading dashboard...");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [viewMode, setViewMode] = useState("overall");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y <= currentYear + 5; y++) {
      years.push(String(y));
    }
    return years;
  }, [currentYear]);

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setStatus("Loading dashboard...");

        const params = new URLSearchParams();
        params.set("view", viewMode);

        if (viewMode === "monthly") {
          params.set("year", selectedYear);
          params.set("month", selectedMonth);
        }

        if (viewMode === "yearly") {
          params.set("year", selectedYear);
        }

        const res = await fetch(`${API}/dashboard/summary?${params.toString()}`);
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setStatus("Dashboard API not found or returned invalid response");
          return;
        }

        if (!res.ok) {
          setStatus(data.message || "Failed to load dashboard");
          return;
        }

        setSummary(data);
        setStatus("");
      } catch {
        setStatus("Failed to load dashboard");
      }
    };

    load();
  }, [viewMode, selectedYear, selectedMonth]);

  const totalOrders = Number(summary?.totalOrders || 0);
  const totalRevenue = Number(summary?.totalRevenue || 0);
  const totalInvestment = Number(summary?.totalInvestment || 0);
  const totalProfit = Number(summary?.totalProfit || 0);
  const totalUnits = Number(summary?.totalUnits || 0);
  const avgMinutesPerOrder = Number(summary?.avgMinutesPerOrder || 0);
  const avgRevenuePerHour = Number(summary?.avgRevenuePerHour || 0);
  const totalFuelCost = Number(summary?.totalFuelCost ?? summary?.totalGasFee ?? 0);

  const chartStats = Array.isArray(summary?.chartStats)
    ? summary.chartStats
    : Array.isArray(summary?.monthlyStats)
    ? summary.monthlyStats
    : [];

  const costBreakdown = (Array.isArray(summary?.costBreakdown) ? summary.costBreakdown : []).map((item) => ({
    ...item,
    name:
      item.name === "Fuel"
        ? t("fuelCost")
        : item.name === "Labor"
        ? t("laborCost")
        : item.name === "Profit"
        ? t("profit")
        : item.name,
  }));

  const topAreas = Array.isArray(summary?.topAreas) ? summary.topAreas : [];
  const recentOrders = Array.isArray(summary?.recentOrders) ? summary.recentOrders : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: isMobile ? "14px" : "24px",
          minWidth: 0,
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: isMobile ? "1.4rem" : "2rem" }}>
          {t("dashboard")}
        </h1>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: isMobile ? "14px" : "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              {t("viewMode") || "View Mode"}
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                boxSizing: "border-box",
                fontSize: "16px",
              }}
            >
              <option value="overall">{t("overall") || "Overall"}</option>
              <option value="monthly">{t("monthly") || "Monthly"}</option>
              <option value="yearly">{t("yearly") || "Yearly"}</option>
            </select>
          </div>

          {(viewMode === "monthly" || viewMode === "yearly") && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                {t("year") || "Year"}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "16px",
                }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === "monthly" && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                {t("month") || "Month"}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "16px",
                }}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {status && <p>{status}</p>}

        {summary && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <StatCard title={t("totalOrders")} value={totalOrders.toLocaleString()} isMobile={isMobile} />
              <StatCard title={t("totalRevenue")} value={`¥${totalRevenue.toLocaleString()}`} color="#2563eb" isMobile={isMobile} />
              <StatCard title={t("totalInvestment")} value={`¥${totalInvestment.toLocaleString()}`} color="#d97706" isMobile={isMobile} />
              <StatCard title={t("totalProfit")} value={`¥${totalProfit.toLocaleString()}`} color={totalProfit >= 0 ? "#16a34a" : "#dc2626"} isMobile={isMobile} />
              <StatCard title={t("totalUnits")} value={totalUnits.toLocaleString()} isMobile={isMobile} />
              <StatCard title={t("avgMinutesPerOrder")} value={avgMinutesPerOrder.toFixed(1)} isMobile={isMobile} />
              <StatCard title={t("revenuePerHour")} value={`¥${avgRevenuePerHour.toFixed(0)}`} isMobile={isMobile} />
              <StatCard title={t("fuelTotal")} value={`¥${totalFuelCost.toLocaleString()}`} isMobile={isMobile} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <SimpleBarChart data={chartStats} t={t} isMobile={isMobile} viewMode={viewMode} />

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: isMobile ? "16px" : "20px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: isMobile ? "1rem" : "1.15rem" }}>
                  {t("costProfitCircle")}
                </h3>

                <PieChart data={costBreakdown} isMobile={isMobile} />

                <div style={{ marginTop: "12px" }}>
                  {costBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: isMobile ? "0.92rem" : "1rem",
                        marginBottom: "6px",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.name}: ¥{Number(item.value || 0).toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: isMobile ? "16px" : "20px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                  minWidth: 0,
                }}
              >
                <h3 style={{ marginTop: 0 }}>{t("mostCheckedOutAreas")}</h3>

                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table
                    style={{
                      width: "100%",
                      minWidth: isMobile ? "520px" : "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{t("area")}</th>
                        <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{t("orders")}</th>
                        <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{t("totalUnits")}</th>
                        <th style={{ textAlign: "right", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{t("revenue")}</th>
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

                      {topAreas.map((area, idx) => (
                        <tr key={area?.area || idx}>
                          <td style={{ padding: "10px", borderBottom: "1px solid #f1f5f9" }}>{area?.area || "-"}</td>
                          <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>{Number(area?.orderCount || 0).toLocaleString()}</td>
                          <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>{Number(area?.units || 0).toLocaleString()}</td>
                          <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>¥{Number(area?.revenue || 0).toLocaleString()}</td>
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
                  padding: isMobile ? "16px" : "20px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{t("recentOrders")}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentOrders.length === 0 && <p style={{ color: "#64748b" }}>No orders yet.</p>}

                  {recentOrders.slice(0, 2).map((order, idx) => (
                    <div
                      key={order?._id || idx}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "12px",
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ fontWeight: "bold", wordBreak: "break-word" }}>
                        {order?.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}
                      </div>
                      <div style={{ marginTop: "6px", color: "#334155" }}>
                        {t("totalUnits")}: {Number(order?.totalUnits || 0).toLocaleString()}
                      </div>
                      <div style={{ color: "#334155" }}>
                        {t("revenue")}: ¥{Number(order?.salesAmount || 0).toLocaleString()}
                      </div>
                      <div style={{ color: "#334155" }}>
                        {t("investment")}: ¥{Number(order?.investmentAmount || 0).toLocaleString()}
                      </div>
                      <div
                        style={{
                          color: Number(order?.profit || 0) >= 0 ? "#16a34a" : "#dc2626",
                          fontWeight: "bold",
                          marginTop: "4px",
                        }}
                      >
                        {t("profit")}: ¥{Number(order?.profit || 0).toLocaleString()}
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