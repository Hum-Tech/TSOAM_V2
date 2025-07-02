#!/usr/bin/env node

// TSOAM Church Management System - Data Restore Script
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { DatabaseManager } = require("../config/database");

async function performRestore() {
  console.log("🚀 TSOAM Church Management System");
  console.log("📤 Data Restore Script");
  console.log("=".repeat(50));

  const db = new DatabaseManager();

  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const fileArg = args.find((arg) => arg.startsWith("--file="));

    if (!fileArg) {
      console.error("❌ Please specify a backup file:");
      console.error('   node scripts/restore-data.js --file="backup.json"');
      process.exit(1);
    }

    const filename = fileArg.split("=")[1];
    let filepath;

    // Check if it's an absolute path or relative to backups directory
    if (path.isAbsolute(filename)) {
      filepath = filename;
    } else {
      filepath = path.join(__dirname, "..", "backups", filename);
    }

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Backup file not found: ${filepath}`);
      process.exit(1);
    }

    console.log(`📁 Backup file: ${path.basename(filepath)}`);
    console.log(`📍 Location: ${filepath}`);

    // Test database connection
    console.log("🔄 Connecting to database...");
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    console.log("✅ Database connected successfully!");

    // Read and parse backup file
    console.log("🔄 Reading backup file...");
    const backupContent = fs.readFileSync(filepath, "utf8");
    const backupData = JSON.parse(backupContent);

    // Validate backup format
    if (!backupData.data || !backupData.timestamp) {
      throw new Error("Invalid backup file format");
    }

    console.log("✅ Backup file validated!");
    console.log("");
    console.log("📊 Backup Information:");
    console.log(`   🏢 Church: ${backupData.church || "Unknown"}`);
    console.log(`   📅 Created: ${backupData.timestamp}`);
    console.log(`   🔖 Version: ${backupData.version || "Unknown"}`);
    console.log(
      `   🧪 Demo Data: ${backupData.include_demo ? "Included" : "Excluded"}`,
    );

    const totalRecords = Object.keys(backupData.data).reduce(
      (total, table) => total + (backupData.data[table]?.length || 0),
      0,
    );
    console.log(`   📋 Total Records: ${totalRecords}`);

    console.log("");
    console.log("📊 Table Summary:");
    Object.entries(backupData.data).forEach(([table, records]) => {
      console.log(`   📋 ${table}: ${records.length} records`);
    });

    // Confirm restoration
    console.log("");
    console.log("⚠️  WARNING: This will replace existing data!");
    console.log(
      "   This action cannot be undone. Please ensure you have a current backup.",
    );

    // For production, you might want to add a confirmation prompt here
    // For now, we'll proceed automatically

    console.log("🔄 Starting data restoration...");

    // Perform restoration
    await db.restoreData(backupData);

    console.log("✅ Data restoration completed successfully!");
    console.log("");
    console.log("🎉 System has been restored from backup!");
    console.log(
      "💡 You may need to restart the server for changes to take effect",
    );
  } catch (error) {
    console.error("❌ Restore failed:", error.message);
    if (error.message.includes("JSON")) {
      console.error("💡 Please check that the backup file is valid JSON");
    }
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Show usage if help requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("TSOAM Church Management System - Restore Script");
  console.log("");
  console.log("Usage: node scripts/restore-data.js --file=<backup-file>");
  console.log("");
  console.log("Options:");
  console.log(
    '  --file=<file>     Backup file to restore from (e.g., "backup.json")',
  );
  console.log("  --help, -h        Show this help message");
  console.log("");
  console.log("Examples:");
  console.log(
    '  node scripts/restore-data.js --file="tsoam-backup-2025-01-15.json"',
  );
  console.log('  node scripts/restore-data.js --file="/path/to/backup.json"');
  console.log("");
  console.log("⚠️  WARNING: This will replace all existing data!");
  process.exit(0);
}

// Run the restore
if (require.main === module) {
  performRestore();
}

module.exports = { performRestore };
