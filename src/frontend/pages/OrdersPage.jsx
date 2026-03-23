import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function OrdersPage() {
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("latest");
  const [status, setStatus] = useState("Loading orders...");

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams();

      if (dateFilter) params.append("date", dateFilter);
      if (areaFilter.trim()) params.append("area", areaFilter.trim());
      if (sortFilter) params.append("sort", sortFilter);

      const res = await fetch(`${API}/orders?${params.toString()}`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setStatus("Orders API returned invalid response");
        return;
      }

      if (!res.ok) {
        setStatus(data.message || "Failed to load orders");
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
      setStatus("");
    } catch {
      setStatus("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, [dateFilter, areaFilter, sortFilter]);

  const clearFilters = () => {
    setDateFilter("");
    setAreaFilter("");
    setSortFilter("latest");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ marginTop: 0 }}>{t("orders")}</h1>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              {t("filterByOrderDate")}
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              {t("filterByArea")}
            </label>
            <input
              type="text"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              placeholder={t("enterAreaName")}
              style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              {t("sortBy")}
            </label>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
            >
              <option value="latest">{t("latestCheckout")}</option>
              <option value="oldest">{t("oldestCheckout")}</option>
              <option value="highest">{t("mostCheckoutMoney")}</option>
              <option value="lowest">{t("lessCheckoutMoney")}</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={clearFilters}
              style={{
                background: "#475569",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {t("clearFilters")}
            </button>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>{t("savedOrderList")}</h2>

          {status && <p>{status}</p>}
          {!status && orders.length === 0 && (
            <p style={{ color: "#64748b" }}>No orders found.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>
                      {new Date(order.orderDate).toLocaleString()}
                    </div>
                    <div style={{ color: "#64748b", marginTop: "4px" }}>
                      {t("orderId")}: {order._id}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div><b>{t("revenue")}:</b> ¥{Number(order.salesAmount || 0).toLocaleString()}</div>
                    <div><b>{t("investment")}:</b> ¥{Number(order.investmentAmount || 0).toLocaleString()}</div>
                    <div style={{ fontWeight: "bold", color: Number(order.profit || 0) >= 0 ? "#16a34a" : "#dc2626" }}>
                      {t("profit")}: ¥{Number(order.profit || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <div><b>{t("totalUnits")}:</b> {Number(order.totalUnits || 0).toLocaleString()}</div>
                  <div><b>{t("fuelCost")}:</b> ¥{Number(order.fuelCost || 0).toLocaleString()}</div>
                  <div><b>{t("laborCost")}:</b> ¥{Number(order.laborCost || 0).toLocaleString()}</div>
                  <div><b>{t("minutes")}:</b> {Number(order.avgMinutesNeeded || 0).toLocaleString()}</div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <b>{t("orderedAreas")}</b>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(order.items || []).map((item, index) => (
                      <div
                        key={`${order._id}-${index}`}
                        style={{
                          padding: "10px",
                          background: "white",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>{item.area}</div>
                        <div style={{ color: "#475569", marginTop: "4px" }}>
                          {t("type")}: {item.desc}
                        </div>
                        <div style={{ color: "#475569" }}>
                          {t("unitPrice")}: ¥{Number(item.unitPrice || 0).toLocaleString()}
                        </div>
                        <div style={{ color: "#475569" }}>
                          Qty: {Number(item.qty || 0).toLocaleString()}
                        </div>
                        <div style={{ fontWeight: "bold", marginTop: "4px" }}>
                          {t("subtotal")}: ¥{Number(item.subtotal || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}