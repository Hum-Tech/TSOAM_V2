#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 TSOAM Church Management System Setup");
console.log("═══════════════════════════════════════════════════════════");

// Check if Node.js is installed
try {
  const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim();
  console.log(`✅ Node.js detected: ${nodeVersion}`);
} catch (error) {
  console.error(
    "❌ Node.js is not installed. Please install Node.js 16+ first.",
  );
  process.exit(1);
}

// Check if MySQL is installed
try {
  execSync("mysql --version", { encoding: "utf8" });
  console.log("✅ MySQL detected");
} catch (error) {
  console.log(
    "⚠️  MySQL not found. Please install MySQL 8.0+ or MariaDB 10.3+",
  );
}

// Create .env file if it doesn't exist
if (!fs.existsSync(".env")) {
  console.log("📝 Creating .env file...");
  fs.copyFileSync(".env.example", ".env");
  console.log("✅ .env file created from template");
  console.log("📝 Please edit .env file with your database credentials");
} else {
  console.log("✅ .env file already exists");
}

// Install server dependencies
if (fs.existsSync("server/package.json")) {
  console.log("📦 Installing server dependencies...");
  try {
    execSync("cd server && npm install", { stdio: "inherit" });
    console.log("✅ Server dependencies installed");
  } catch (error) {
    console.error("❌ Failed to install server dependencies");
    process.exit(1);
  }
}

// Install client dependencies
if (fs.existsSync("client/package.json")) {
  console.log("📦 Installing client dependencies...");
  try {
    execSync("cd client && npm install", { stdio: "inherit" });
    console.log("✅ Client dependencies installed");
  } catch (error) {
    console.error("❌ Failed to install client dependencies");
    process.exit(1);
  }
}

// Build client
console.log("🔨 Building client application...");
try {
  execSync("cd client && npm run build", { stdio: "inherit" });
  console.log("✅ Client built successfully");
} catch (error) {
  console.error("❌ Failed to build client");
  process.exit(1);
}

// Create necessary directories
const directories = [
  "server/uploads",
  "server/uploads/finance",
  "server/uploads/inventory",
  "server/uploads/welfare",
  "backups",
  "logs",
];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

console.log("═══════════════════════════════════════════════════════════");
console.log("🎉 Setup completed successfully!");
console.log("");
console.log("📋 Next steps:");
console.log("   1. Edit .env file with your MySQL credentials");
console.log(
  '   2. Create database: mysql -u root -p -e "CREATE DATABASE tsoam_church_db"',
);
console.log(
  "   3. Import schema: mysql -u root -p tsoam_church_db < database/schema.sql",
);
console.log("   4. Start server: npm run start");
console.log("");
console.log("🌐 Access the system:");
console.log("   • Local: http://localhost:3001");
console.log("   • LAN: http://[YOUR-IP]:3001");
console.log("");
console.log("🔐 Default admin login:");
console.log("   • Email: admin@tsoam.org");
console.log("   • Password: admin123");
console.log("═══════════════════════════════════════════════════════════");
