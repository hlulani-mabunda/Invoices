import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import PageLayout from "../layout/PageLayout";



const emptyItem = { description: "", quantity: 1, price: 0, unit: "" };



export default function CreateInvoice() {

  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);

  const [customerId, setCustomerId] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [items, setItems] = useState([{ ...emptyItem }]);

  const [error, setError] = useState("");



  useEffect(() => {

    api

      .get("/customers")

      .then((res) => setCustomers(res.data))

      .catch(() => setError("Failed to load customers"));

  }, []);



  const updateItem = (index, field, value) => {

    setItems((prev) =>

      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))

    );

  };



  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");



    try {

      await api.post("/invoices", {

        customerId,

        dueDate: dueDate || undefined,

        items: items.map((item) => ({

          description: item.description,

          quantity: Number(item.quantity),

          price: Number(item.price),

          unit: item.unit || "",

        })),

      });

      navigate("/invoices");

    } catch {

      setError("Failed to create invoice");

    }

  };



  return (

    <PageLayout title="Create Invoice">

      {error && <p className="error">{error}</p>}



      <form onSubmit={handleSubmit} className="card" style={{ marginTop: "16px" }}>

        <div style={{ marginBottom: "16px" }}>

          <label>

            Customer

            <select

              value={customerId}

              onChange={(e) => setCustomerId(e.target.value)}

              required

              style={{ display: "block", marginTop: "6px" }}

            >

              <option value="">Select customer</option>

              {customers.map((c) => (

                <option key={c._id} value={c._id}>

                  {c.name}{c.companyName ? ` (${c.companyName})` : ""}

                </option>

              ))}

            </select>

          </label>

        </div>



        <div style={{ marginBottom: "16px" }}>

          <label>

            Due Date

            <input

              type="date"

              value={dueDate}

              onChange={(e) => setDueDate(e.target.value)}

              style={{ display: "block", marginTop: "6px" }}

            />

          </label>

        </div>



        <h3>Line Items</h3>

        {items.map((item, index) => (

          <div key={index} className="line-item">

            <input

              placeholder="Description"

              value={item.description}

              onChange={(e) => updateItem(index, "description", e.target.value)}

              required

            />

            <input

              placeholder="Unit (e.g. kg, pcs)"

              value={item.unit || ""}

              onChange={(e) => updateItem(index, "unit", e.target.value)}

            />

            <input

              type="number"

              placeholder="Qty"

              value={item.quantity}

              onChange={(e) => updateItem(index, "quantity", e.target.value)}

              min="1"

              required

            />

            <input

              type="number"

              placeholder="Price"

              value={item.price}

              onChange={(e) => updateItem(index, "price", e.target.value)}

              min="0"

              step="0.01"

              required

            />

          </div>

        ))}



        <button type="button" onClick={addItem} style={{ marginBottom: "16px" }}>

          Add Item

        </button>



        <div>

          <button type="submit">Create Invoice</button>

        </div>

      </form>

    </PageLayout>

  );

}

