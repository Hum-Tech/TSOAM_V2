#!/usr/bin/env node

// TSOAM Church Management System - Database Connection Test
require("dotenv").config();
const { DatabaseManager } = require("../config/database");

async function testConnection() {
  const db = new DatabaseManager();

  try {
    console.log("🔄 Testing MySQL database connection...");
    console.log(`📊 Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`📊 Port: ${process.env.DB_PORT || "3306"}`);
    console.log(`📊 Database: ${process.env.DB_NAME || "tsoam_church"}`);
    console.log(`📊 User: ${process.env.DB_USER || "church_admin"}`);

    const isConnected = await db.testConnection();

    if (isConnected) {
      console.log("✅ Database connection successful!");

      // Test basic query
      const result = await db.query(
        "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = ?",
        [process.env.DB_NAME || "tsoam_church"],
      );
      console.log(`📊 Database contains ${result[0].table_count} tables`);

      // Check if system is initialized
      try {
        const settings = await db.query(
          "SELECT COUNT(*) as count FROM system_settings",
        );
        if (settings[0].count > 0) {
          console.log("✅ Database is properly initialized");
        } else {
          console.log("⚠️  Database exists but is not initialized");
          console.log("💡 Run: npm run init-db");
        }
      } catch (error) {
        console.log("⚠️  Database exists but schema is not initialized");
        console.log("💡 Run: npm run init-db");
      }

      return true;
    } else {
      console.error("❌ Database connection failed!");
      console.error("💡 Please check:");
      console.error("   - MySQL server is running");
      console.error("   - Database credentials are correct");
      console.error("   - Database exists");
      console.error("   - User has proper permissions");
      return false;
    }
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("💡 Access denied - check username and password");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("💡 Database does not exist - create it first");
    } else if (error.code === "ECONNREFUSED") {
      console.error("💡 Connection refused - MySQL server may not be running");
    } else if (error.code === "ENOTFOUND") {
      console.error("💡 Host not found - check DB_HOST setting");
    }

    return false;
  } finally {
    await db.close();
  }
}

// Run the test if called directly
if (require.main === module) {
  testConnection().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testConnection };
