import { useEffect, useState } from "react";

import api from "../services/api";

import PageLayout from "../layout/PageLayout";



export default function Dashboard() {

  const [stats, setStats] = useState(null);

  const [error, setError] = useState("");



  useEffect(() => {

    api

      .get("/dashboard")

      .then((res) => setStats(res.data))

      .catch(() => setError("Failed to load dashboard stats"));

  }, []);



  return (

    <PageLayout title="Dashboard">

      {error && <p className="error">{error}</p>}

      {stats && (

        <div className="stat-grid">

          <StatCard label="Customers" value={stats.customers} />

          <StatCard label="Total Invoices" value={stats.totalInvoices} />

          <StatCard label="Revenue" value={`R ${stats.totalRevenue?.toFixed(2)}`} />

          <StatCard label="Paid" value={stats.paid} />

          <StatCard label="Unpaid" value={stats.unpaid} />

        </div>

      )}

    </PageLayout>

  );

}



function StatCard({ label, value }) {

  return (

    <div className="card">

      <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>{label}</p>

      <p style={{ margin: "8px 0 0", fontSize: "1.5rem", fontWeight: 600 }}>{value}</p>

    </div>

  );

}

