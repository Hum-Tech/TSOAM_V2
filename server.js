// TSOAM Church Management System - Production Server
// Version 2.0.0 with MySQL Integration and Network Sharing

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const { DatabaseManager } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0"; // Allow connections from network

// Global database instance
let db;

// Initialize database connection
async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database connection...");
    db = new DatabaseManager();

    // Test connection first
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error("Database connection test failed");
    }

    // Initialize schema
    await db.initializeSchema();

    console.log("✅ Database initialized successfully");
    return db;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error("💡 Please check your MySQL configuration in .env file");
    process.exit(1);
  }
}

// Middleware setup
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ============================================
// API ROUTES
// ============================================

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await db.testConnection();
    const settings = await db.getSettings();

    res.json({
      status: "ok",
      message: "TSOAM Church Management System is running",
      version: "2.0.0",
      database: dbConnected ? "connected" : "disconnected",
      network_sharing: settings.network_sharing?.value === "true",
      church: "TSOAM CHURCH INTERNATIONAL",
      server_time: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// System settings API
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    await db.updateSetting(key, value);

    // Log the setting change
    console.log(`✅ Setting updated: ${key} = ${value}`);

    res.json({
      success: true,
      message: `Setting '${key}' updated successfully`,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Members API
app.get("/api/members", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM members";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY created_at DESC";

    const members = await db.query(sql);
    res.json(members);
  } catch (error) {
    console.error("Members fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/members", async (req, res) => {
  try {
    const memberData = {
      id: `MEM_${Date.now()}`,
      member_number: `TM${Date.now().toString().slice(-6)}`,
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "members",
      memberData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: memberData.id,
      member_number: memberData.member_number,
    });
  } catch (error) {
    console.error("Member creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Financial transactions API
app.get("/api/transactions", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM financial_transactions";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY transaction_date DESC, created_at DESC";

    const transactions = await db.query(sql);
    res.json(transactions);
  } catch (error) {
    console.error("Transactions fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const transactionData = {
      id: `TXN_${Date.now()}`,
      transaction_number: `T${Date.now().toString().slice(-8)}`,
      ...req.body,
      recorded_by: req.body.recorded_by || "system",
      created_at: new Date(),
    };

    const result = await db.insert(
      "financial_transactions",
      transactionData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: transactionData.id,
      transaction_number: transactionData.transaction_number,
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Employees API
app.get("/api/employees", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM employees";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY created_at DESC";

    const employees = await db.query(sql);
    res.json(employees);
  } catch (error) {
    console.error("Employees fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const employeeData = {
      id: `EMP_${Date.now()}`,
      employee_number: `E${Date.now().toString().slice(-6)}`,
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "employees",
      employeeData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: employeeData.id,
      employee_number: employeeData.employee_number,
    });
  } catch (error) {
    console.error("Employee creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Inventory API
app.get("/api/inventory", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM inventory_items";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY created_at DESC";

    const items = await db.query(sql);
    res.json(items);
  } catch (error) {
    console.error("Inventory fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const itemData = {
      id: `INV_${Date.now()}`,
      item_code: `I${Date.now().toString().slice(-6)}`,
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "inventory_items",
      itemData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: itemData.id,
      item_code: itemData.item_code,
    });
  } catch (error) {
    console.error("Inventory creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Maintenance records API
app.post("/api/maintenance", async (req, res) => {
  try {
    const maintenanceData = {
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "maintenance_records",
      maintenanceData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error("Maintenance record creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Disposal records API
app.post("/api/disposal", async (req, res) => {
  try {
    const disposalData = {
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "disposal_records",
      disposalData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error("Disposal record creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Welfare API
app.get("/api/welfare", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM welfare_requests";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY created_at DESC";

    const requests = await db.query(sql);
    res.json(requests);
  } catch (error) {
    console.error("Welfare fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/welfare", async (req, res) => {
  try {
    const welfareData = {
      id: `WEL_${Date.now()}`,
      request_number: `W${Date.now().toString().slice(-6)}`,
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "welfare_requests",
      welfareData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: welfareData.id,
      request_number: welfareData.request_number,
    });
  } catch (error) {
    console.error("Welfare request creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Messages API
app.get("/api/messages", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM message_history";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY created_at DESC";

    const messages = await db.query(sql);
    res.json(messages);
  } catch (error) {
    console.error("Messages fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      sent_time: new Date(),
      created_at: new Date(),
    };

    const result = await db.insert(
      "message_history",
      messageData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error("Message creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Events API
app.get("/api/events", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    let sql = "SELECT * FROM events";
    if (!includeDemo) {
      sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
    }
    sql += " ORDER BY start_date DESC";

    const events = await db.query(sql);
    res.json(events);
  } catch (error) {
    console.error("Events fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const eventData = {
      id: `EVT_${Date.now()}`,
      ...req.body,
      created_at: new Date(),
    };

    const result = await db.insert(
      "events",
      eventData,
      req.body.is_demo || false,
    );
    res.json({
      success: true,
      id: eventData.id,
    });
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Data management APIs
app.post("/api/admin/backup", async (req, res) => {
  try {
    const includeDemo = req.body.include_demo || false;
    const backupData = await db.backupData(includeDemo);

    // Save backup to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `tsoam-backup-${timestamp}.json`;
    const filepath = path.join(__dirname, "backups", filename);

    // Ensure backups directory exists
    const backupsDir = path.dirname(filepath);
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    res.json({
      success: true,
      message: "Backup created successfully",
      filename: filename,
      size: fs.statSync(filepath).size,
      records: Object.keys(backupData.data).reduce(
        (total, table) => total + (backupData.data[table]?.length || 0),
        0,
      ),
    });
  } catch (error) {
    console.error("Backup creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/restore", async (req, res) => {
  try {
    const { backupData } = req.body;

    if (!backupData || !backupData.data) {
      return res.status(400).json({ error: "Invalid backup data" });
    }

    await db.restoreData(backupData);

    res.json({
      success: true,
      message: "Data restored successfully",
    });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/clean-demo-data", async (req, res) => {
  try {
    await db.cleanDemoData();
    res.json({
      success: true,
      message: "Demo data cleaned successfully",
    });
  } catch (error) {
    console.error("Demo data cleanup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Export data
app.get("/api/admin/export-data", async (req, res) => {
  try {
    const includeDemo = req.query.include_demo === "true";
    const data = await db.backupData(includeDemo);
    res.json(data);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Network info API
app.get("/api/network-info", (req, res) => {
  const os = require("os");
  const interfaces = os.networkInterfaces();
  const networkInfo = [];

  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((interface) => {
      if (interface.family === "IPv4" && !interface.internal) {
        networkInfo.push({
          interface: name,
          ip: interface.address,
          url: `http://${interface.address}:${PORT}`,
        });
      }
    });
  });

  res.json({
    server_port: PORT,
    network_interfaces: networkInfo,
    local_url: `http://localhost:${PORT}`,
    server_time: new Date().toISOString(),
  });
});

// Serve the frontend for all other routes
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: 'Frontend not found. Please run "npm run build" first.',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// ============================================
// AUTOMATED BACKUP SCHEDULING
// ============================================

function scheduleAutomaticBackups() {
  // Daily backup at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("🔄 Starting automatic backup...");
      const settings = await db.getSettings();

      if (settings.auto_backup?.value === "true") {
        const backupData = await db.backupData(false); // Exclude demo data

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `auto-backup-${timestamp}.json`;
        const filepath = path.join(__dirname, "backups", filename);

        const backupsDir = path.dirname(filepath);
        if (!fs.existsSync(backupsDir)) {
          fs.mkdirSync(backupsDir, { recursive: true });
        }

        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
        console.log(`✅ Automatic backup completed: ${filename}`);
      }
    } catch (error) {
      console.error("❌ Automatic backup failed:", error.message);
    }
  });

  console.log("📅 Automatic backup scheduler initialized");
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    if (db) {
      await db.close();
    }
    console.log("✅ Database connections closed");

    console.log("✅ Server shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    console.log("🚀 Starting TSOAM Church Management System...");
    console.log("📊 Version: 2.0.0");
    console.log("🏢 Church: TSOAM CHURCH INTERNATIONAL");

    // Initialize database
    await initializeDatabase();

    // Start server
    const server = app.listen(PORT, HOST, () => {
      console.log("");
      console.log("✅ Server started successfully!");
      console.log(`🌐 Local access: http://localhost:${PORT}`);
      console.log(`🌍 Network access: http://${HOST}:${PORT}`);
      console.log(
        "📱 The system can now be accessed from other computers on the network",
      );
      console.log("🔧 MySQL database connected and ready");
      console.log("💾 Automatic backups scheduled for 2:00 AM daily");
      console.log("");
      console.log("💡 Press Ctrl+C to stop the server");
      console.log("📖 Check README.md for setup instructions");
    });

    // Schedule automatic backups
    scheduleAutomaticBackups();

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please try a different port.`,
        );
        console.error(`💡 Set PORT environment variable: export PORT=3002`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("💡 Please check your configuration and try again");
    process.exit(1);
  }
}

// Start the server
startServer();
