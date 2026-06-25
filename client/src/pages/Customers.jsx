import { useEffect, useState } from "react";
import api from "../services/api";
import PageLayout from "../layout/PageLayout";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Standard data load on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/customers", form);
      setForm({ name: "", email: "", phone: "", address: "", companyName: "" });
      await fetchCustomers();
    } catch {
      alert("Failed to create customer");
    }
  };

  return (
    <PageLayout title="Customers">
      <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: "20px" }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <button type="submit">Add Customer</button>
      </form>

      {loading && <p>Loading customers...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && customers.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.companyName || "—"}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {customers.map((c) => (
              <article key={c._id} className="mobile-card">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Name</span>
                  <strong>{c.name}</strong>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Company Name</span>
                  <span>{c.companyName || "—"}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Email</span>
                  <span>{c.email || "—"}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Phone</span>
                  <span>{c.phone || "—"}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Address</span>
                  <span>{c.address || "—"}</span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
