import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../client/dist");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1;

  res.status(dbConnected ? 200 : 503).json({
    ok: dbConnected,
    message: dbConnected ? "InvoiceFlow API is running" : "Database not connected",
    database: {
      connected: dbConnected,
      state: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(express.static(clientDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      console.error(`Failed to serve index.html from ${clientDistPath}:`, err.message);
      next();
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    process.exit(1);
  }

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`InvoiceFlow server running on port ${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other server or set a different PORT in .env`);
    } else {
      console.error("Server failed to start:", error.message);
    }
    process.exit(1);
  });
};

startServer();
