#!/usr/bin/env node

// TSOAM Church Management System - Archive Creation Script
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

async function createArchive() {
  console.log("🏢 TSOAM Church Management System");
  console.log("📦 Creating deployment archive...");
  console.log("=".repeat(50));

  const outputPath = path.join(
    __dirname,
    "..",
    "TSOAM-Church-Management-System.zip",
  );
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  // Listen for all archive data to be written
  output.on("close", function () {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log("");
    console.log("✅ Archive created successfully!");
    console.log(`📁 File: ${path.basename(outputPath)}`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📏 Size: ${sizeInMB} MB`);
    console.log(`📋 Total bytes: ${archive.pointer()}`);
    console.log("");
    console.log("🚀 Ready for deployment!");
    console.log("💡 Extract and run: node install.js");
  });

  // Handle warnings (ie stat failures and other non-blocking errors)
  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      console.warn("⚠️  Warning:", err.message);
    } else {
      throw err;
    }
  });

  // Handle errors
  archive.on("error", function (err) {
    console.error("❌ Archive creation failed:", err);
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  console.log("🔄 Adding files to archive...");

  // Add all necessary files and directories
  const filesToInclude = [
    "package.json",
    "server.js",
    "install.js",
    "start.bat",
    "start.sh",
    ".env.example",
    ".env",
    "README.md",
  ];

  const directoriesToInclude = [
    "config/",
    "database/",
    "scripts/",
    "public/",
    "client/",
  ];

  // Add individual files
  filesToInclude.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
      console.log(`✅ Added file: ${file}`);
    } else {
      console.log(`⚠️  Skipped missing file: ${file}`);
    }
  });

  // Add directories
  directoriesToInclude.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      archive.directory(dirPath, dir);
      console.log(`✅ Added directory: ${dir}`);
    } else {
      console.log(`⚠️  Skipped missing directory: ${dir}`);
    }
  });

  // Create empty directories that might be needed
  const emptyDirs = ["backups/", "logs/", "uploads/"];
  emptyDirs.forEach((dir) => {
    archive.append("", { name: dir + ".gitkeep" });
  });

  console.log("🔄 Finalizing archive...");

  // Finalize the archive (ie we are done appending files but streams have to finish yet)
  await archive.finalize();
}

// Handle command line execution
if (require.main === module) {
  createArchive().catch((err) => {
    console.error("❌ Failed to create archive:", err);
    process.exit(1);
  });
}

module.exports = { createArchive };
