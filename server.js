// TSOAM Church Management System - Local Server
// This server runs when the system is downloaded and used locally

const express = require("express");
const path = require("path");
const cors = require("cors");
const { DatabaseManager } = require("./database/config");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dist")); // Serve built frontend

// Database instance
let db;

// Initialize database
async function initDatabase() {
  try {
    db = new DatabaseManager();
    await db.connect("sqlite"); // Use SQLite for local deployment
    await db.initializeSchema();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "TSOAM Church Management System is running",
    database: db ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Members API
app.get("/api/members", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const members = await db.query(
      "SELECT * FROM members ORDER BY created_at DESC",
      [],
      includeDemo,
    );
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/members", async (req, res) => {
  try {
    const isDemo = req.body.is_demo || false;
    const result = await db.insert("members", req.body, isDemo);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Financial transactions API
app.get("/api/transactions", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const transactions = await db.query(
      "SELECT * FROM financial_transactions ORDER BY transaction_date DESC",
      [],
      includeDemo,
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const isDemo = req.body.is_demo || false;
    const result = await db.insert("financial_transactions", req.body, isDemo);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employees API
app.get("/api/employees", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const employees = await db.query(
      "SELECT * FROM employees ORDER BY created_at DESC",
      [],
      includeDemo,
    );
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory API
app.get("/api/inventory", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const items = await db.query(
      "SELECT * FROM inventory_items ORDER BY created_at DESC",
      [],
      includeDemo,
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const isDemo = req.body.is_demo || false;
    const result = await db.insert("inventory_items", req.body, isDemo);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Maintenance records API
app.post("/api/maintenance", async (req, res) => {
  try {
    const isDemo = req.body.is_demo || false;
    const result = await db.insert("maintenance_records", req.body, isDemo);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disposal records API
app.post("/api/disposal", async (req, res) => {
  try {
    const isDemo = req.body.is_demo || false;
    const result = await db.insert("disposal_records", req.body, isDemo);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Welfare API
app.get("/api/welfare", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const requests = await db.query(
      "SELECT * FROM welfare_requests ORDER BY created_at DESC",
      [],
      includeDemo,
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Messages API
app.get("/api/messages", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const messages = await db.query(
      "SELECT * FROM message_history ORDER BY created_at DESC",
      [],
      includeDemo,
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System settings API
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await db.query("SELECT * FROM system_settings");
    const settingsObj = {};
    settings.forEach((setting) => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Check if setting is editable
    const setting = await db.query(
      "SELECT is_editable FROM system_settings WHERE setting_key = ?",
      [key],
    );
    if (setting.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }
    if (!setting[0].is_editable) {
      return res.status(403).json({ error: "Setting is not editable" });
    }

    await db.update(
      "system_settings",
      { setting_value: value },
      "setting_key = ?",
      [key],
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data management APIs
app.post("/api/admin/clean-demo-data", async (req, res) => {
  try {
    await db.cleanDemoData();
    res.json({ success: true, message: "Demo data cleaned successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/export-data", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const data = await db.exportData(includeDemo);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  if (db) {
    await db.close();
  }
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(
        `🚀 TSOAM Church Management System running on http://localhost:${PORT}`,
      );
      console.log(`📊 Database: SQLite (local)`);
      console.log(`🌐 Access the system at: http://localhost:${PORT}`);
      console.log("💡 Press Ctrl+C to stop the server");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
