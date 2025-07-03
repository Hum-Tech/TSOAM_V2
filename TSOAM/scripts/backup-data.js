#!/usr/bin/env node

// TSOAM Church Management System - Data Backup Script
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { DatabaseManager } = require("../config/database");

async function performBackup() {
  console.log("🚀 TSOAM Church Management System");
  console.log("💾 Data Backup Script");
  console.log("=".repeat(50));

  const db = new DatabaseManager();

  try {
    // Test connection
    console.log("🔄 Connecting to database...");
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    console.log("✅ Database connected successfully!");

    // Get backup options from command line
    const args = process.argv.slice(2);
    const includeDemo = args.includes("--include-demo");
    const outputPath = args
      .find((arg) => arg.startsWith("--output="))
      ?.split("=")[1];

    console.log(
      `🔄 Creating backup (${includeDemo ? "including" : "excluding"} demo data)...`,
    );

    // Create backup
    const backupData = await db.backupData(includeDemo);

    // Ensure backups directory exists
    const backupsDir = path.join(__dirname, "..", "backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = outputPath || `tsoam-backup-${timestamp}.json`;
    const filepath = path.isAbsolute(filename)
      ? filename
      : path.join(backupsDir, filename);

    // Write backup file
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    // Get file stats
    const stats = fs.statSync(filepath);
    const fileSizeKB = Math.round(stats.size / 1024);

    // Count total records
    const totalRecords = Object.keys(backupData.data).reduce(
      (total, table) => total + (backupData.data[table]?.length || 0),
      0,
    );

    console.log("✅ Backup completed successfully!");
    console.log("");
    console.log("📊 Backup Details:");
    console.log(`   📁 File: ${path.basename(filepath)}`);
    console.log(`   📍 Location: ${filepath}`);
    console.log(`   📏 Size: ${fileSizeKB} KB`);
    console.log(`   📋 Records: ${totalRecords}`);
    console.log(`   🏢 Church: ${backupData.church}`);
    console.log(`   📅 Date: ${backupData.timestamp}`);
    console.log(`   🔖 Version: ${backupData.version}`);
    console.log(
      `   🧪 Demo Data: ${backupData.include_demo ? "Included" : "Excluded"}`,
    );

    console.log("");
    console.log("📊 Table Summary:");
    Object.entries(backupData.data).forEach(([table, records]) => {
      console.log(`   📋 ${table}: ${records.length} records`);
    });

    console.log("");
    console.log("💡 To restore this backup:");
    console.log(
      `   node scripts/restore-data.js --file="${path.basename(filepath)}"`,
    );
  } catch (error) {
    console.error("❌ Backup failed:", error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Show usage if help requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("TSOAM Church Management System - Backup Script");
  console.log("");
  console.log("Usage: node scripts/backup-data.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  --include-demo    Include demo/test data in backup");
  console.log("  --output=<file>   Specify output filename");
  console.log("  --help, -h        Show this help message");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/backup-data.js");
  console.log("  node scripts/backup-data.js --include-demo");
  console.log('  node scripts/backup-data.js --output="my-backup.json"');
  process.exit(0);
}

// Run the backup
if (require.main === module) {
  performBackup();
}

module.exports = { performBackup };
