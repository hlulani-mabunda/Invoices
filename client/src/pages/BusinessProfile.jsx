import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";
import PageLayout from "../layout/PageLayout";

export default function BusinessProfile() {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    logoUrl: "",
    address: { line1: "", city: "", postalCode: "" },
    banking: {
      bankName: "",
      accountNumber: "",
      branchCode: "",
      accountHolder: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/business")
      .then((res) => {
        if (res.data) {
          setForm({
            companyName: res.data.companyName || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            logoUrl: res.data.logoUrl || "",
            address: {
              line1: res.data.address?.line1 || "",
              city: res.data.address?.city || "",
              postalCode: res.data.address?.postalCode || "",
            },
            banking: {
              bankName: res.data.banking?.bankName || "",
              accountNumber: res.data.banking?.accountNumber || "",
              branchCode: res.data.banking?.branchCode || "",
              accountHolder: res.data.banking?.accountHolder || "",
            },
          });
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load business profile")))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name.startsWith("banking.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        banking: { ...prev.banking, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSaving(true);
      await api.put("/business", form);
      setMessage("Business profile saved");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save business profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Business Profile">
        <p>Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Business Profile">
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: "16px", maxWidth: "600px" }}>
        <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Field label="Logo URL" name="logoUrl" value={form.logoUrl} onChange={handleChange} />
        <Field label="Address Line 1" name="address.line1" value={form.address.line1} onChange={handleChange} />
        <Field label="City" name="address.city" value={form.address.city} onChange={handleChange} />
        <Field label="Postal Code" name="address.postalCode" value={form.address.postalCode} onChange={handleChange} />
        <h3>Banking</h3>
        <Field label="Bank Name" name="banking.bankName" value={form.banking.bankName} onChange={handleChange} />
        <Field label="Account Number" name="banking.accountNumber" value={form.banking.accountNumber} onChange={handleChange} />
        <Field label="Branch Code" name="banking.branchCode" value={form.banking.branchCode} onChange={handleChange} />
        <Field label="Account Holder" name="banking.accountHolder" value={form.banking.accountHolder} onChange={handleChange} />
        <button type="submit" style={{ marginTop: "16px" }} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </PageLayout>
  );
}

function Field({ label, name, value, onChange, required }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", marginBottom: "4px" }}>{label}</label>
      <input name={name} value={value} onChange={onChange} required={required} />
    </div>
  );
}
