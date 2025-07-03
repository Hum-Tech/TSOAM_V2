#!/usr/bin/env node

// TSOAM Church Management System - Clean Demo Data Script
require("dotenv").config();
const { DatabaseManager } = require("../config/database");

async function cleanDemoData() {
  console.log("🚀 TSOAM Church Management System");
  console.log("🧹 Clean Demo Data Script");
  console.log("=".repeat(50));

  const db = new DatabaseManager();

  try {
    // Test database connection
    console.log("🔄 Connecting to database...");
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    console.log("✅ Database connected successfully!");

    // Get demo data count before cleaning
    const tables = [
      "members",
      "financial_transactions",
      "employees",
      "inventory_items",
      "welfare_requests",
      "message_history",
      "events",
      "appointments",
    ];

    console.log("🔄 Checking demo data...");
    let totalDemoRecords = 0;
    const demoDataSummary = {};

    for (const table of tables) {
      try {
        const result = await db.query(
          `SELECT COUNT(*) as count FROM ${table} WHERE is_demo_data = 1`,
        );
        const count = result[0].count;
        demoDataSummary[table] = count;
        totalDemoRecords += count;
      } catch (error) {
        console.log(`⚠️  Could not check ${table}: ${error.message}`);
        demoDataSummary[table] = 0;
      }
    }

    if (totalDemoRecords === 0) {
      console.log("ℹ️  No demo data found to clean");
      return;
    }

    console.log("");
    console.log("📊 Demo Data Summary:");
    Object.entries(demoDataSummary).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   📋 ${table}: ${count} demo records`);
      }
    });
    console.log(`   📊 Total: ${totalDemoRecords} demo records`);

    console.log("");
    console.log("🔄 Cleaning demo data...");

    // Clean demo data
    await db.cleanDemoData();

    // Verify cleaning
    console.log("🔄 Verifying cleanup...");
    let remainingDemoRecords = 0;

    for (const table of tables) {
      try {
        const result = await db.query(
          `SELECT COUNT(*) as count FROM ${table} WHERE is_demo_data = 1`,
        );
        remainingDemoRecords += result[0].count;
      } catch (error) {
        // Ignore errors for tables that might not exist
      }
    }

    if (remainingDemoRecords === 0) {
      console.log("✅ Demo data cleaned successfully!");
      console.log(`📊 Removed ${totalDemoRecords} demo records`);
    } else {
      console.log(
        `⚠️  Warning: ${remainingDemoRecords} demo records still remain`,
      );
    }

    console.log("");
    console.log("🎉 Demo data cleanup completed!");
    console.log("💡 Your system now contains only real/production data");
  } catch (error) {
    console.error("❌ Demo data cleanup failed:", error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Show usage if help requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("TSOAM Church Management System - Clean Demo Data Script");
  console.log("");
  console.log("Usage: node scripts/clean-demo.js");
  console.log("");
  console.log("This script removes all demo/test data from the system.");
  console.log(
    "Demo data is identified by the 'is_demo_data' flag set to true.",
  );
  console.log("");
  console.log("Tables affected:");
  console.log("  - members");
  console.log("  - financial_transactions");
  console.log("  - employees");
  console.log("  - inventory_items");
  console.log("  - welfare_requests");
  console.log("  - message_history");
  console.log("  - events");
  console.log("  - appointments");
  console.log("");
  console.log("⚠️  This action cannot be undone!");
  console.log("💡 Consider creating a backup before running this script");
  process.exit(0);
}

// Run the cleanup
if (require.main === module) {
  cleanDemoData();
}

module.exports = { cleanDemoData };
