import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";
import PageLayout from "../layout/PageLayout";
import { downloadInvoicePdf } from "../utils/downloadPdf";

const STATUS_OPTIONS = ["DRAFT", "SENT", "PAID", "OVERDUE"];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invoices");
      setInvoices(res.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load invoices"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Standard data load on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchInvoices();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setSavingId(id);
      await api.put(`/invoices/${id}/status`, { status });
      await fetchInvoices();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update status"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      setDownloadingId(id);
      await downloadInvoicePdf(api, id, invoiceNumber);
    } catch (err) {
      alert(err.message || "Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PageLayout title="Invoices">
      {loading && <p>Loading invoices...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && invoices.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <InvoiceRow
                    key={inv._id}
                    inv={inv}
                    downloading={downloadingId === inv._id}
                    saving={savingId === inv._id}
                    onStatusChange={updateStatus}
                    onDownload={handleDownloadPDF}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {invoices.map((inv) => (
              <InvoiceCard
                key={inv._id}
                inv={inv}
                downloading={downloadingId === inv._id}
                saving={savingId === inv._id}
                onStatusChange={updateStatus}
                onDownload={handleDownloadPDF}
              />
            ))}
          </div>
        </>
      )}

      {!loading && invoices.length === 0 && <p>No invoices yet.</p>}
    </PageLayout>
  );
}

function InvoiceRow({ inv, downloading, saving, onStatusChange, onDownload }) {
  return (
    <tr>
      <td>{inv.invoiceNumber}</td>
      <td>{inv.customerId?.name || "—"}</td>
      <td>R{inv.total?.toFixed(2).replace(".", ",")}</td>
      <td>{inv.status}</td>
      <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
      <td>
        <InvoiceActions
          key={`${inv._id}-${inv.status}`}
          inv={inv}
          downloading={downloading}
          saving={saving}
          onStatusChange={onStatusChange}
          onDownload={onDownload}
          className="table-actions"
        />
      </td>
    </tr>
  );
}

function InvoiceCard({ inv, downloading, saving, onStatusChange, onDownload }) {
  return (
    <article className="mobile-card">
      <div className="mobile-card-row">
        <span className="mobile-card-label">Invoice #</span>
        <strong>{inv.invoiceNumber}</strong>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Customer</span>
        <span>{inv.customerId?.name || "—"}</span>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Total</span>
        <strong>R{inv.total?.toFixed(2).replace(".", ",")}</strong>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Due</span>
        <span>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</span>
      </div>
      <InvoiceActions
        key={`${inv._id}-${inv.status}`}
        inv={inv}
        downloading={downloading}
        saving={saving}
        onStatusChange={onStatusChange}
        onDownload={onDownload}
        className="mobile-card-actions"
      />
    </article>
  );
}

function InvoiceActions({ inv, downloading, saving, onStatusChange, onDownload, className }) {
  const currentStatus = STATUS_OPTIONS.includes(inv.status) ? inv.status : "DRAFT";
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const hasChanges = selectedStatus !== currentStatus;

  return (
    <div className={className}>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!hasChanges || saving}
        onClick={() => onStatusChange(inv._id, selectedStatus)}
      >
        {saving ? "Saving..." : "Save Status"}
      </button>
      <button
        type="button"
        className="btn-success"
        disabled={downloading}
        onClick={() => onDownload(inv._id, inv.invoiceNumber)}
      >
        {downloading ? "Preparing PDF..." : "Download PDF"}
      </button>
    </div>
  );
}
