#!/usr/bin/env node

// TSOAM Church Management System - Build System Script
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function buildSystem() {
  console.log("🏢 TSOAM Church Management System");
  console.log("🔨 Building complete system...");
  console.log("=".repeat(50));

  try {
    // Check if client directory exists
    const clientPath = path.join(__dirname, "..", "client");
    if (!fs.existsSync(clientPath)) {
      console.log(
        "⚠️  Client directory not found, creating minimal structure...",
      );
      createMinimalClient();
    }

    // Install dependencies
    console.log("🔄 Installing server dependencies...");
    execSync("npm install", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    // Check if client has dependencies
    const clientPackageJson = path.join(clientPath, "package.json");
    if (fs.existsSync(clientPackageJson)) {
      console.log("🔄 Installing client dependencies...");
      execSync("npm install", { stdio: "inherit", cwd: clientPath });

      console.log("🔄 Building client application...");
      execSync("npm run build", { stdio: "inherit", cwd: clientPath });
    }

    // Test database connection
    console.log("🔄 Testing database configuration...");
    try {
      execSync("node scripts/test-connection.js", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
    } catch (error) {
      console.log(
        "⚠️  Database connection test failed - please configure MySQL",
      );
    }

    console.log("");
    console.log("✅ Build completed successfully!");
    console.log("🚀 System is ready for deployment");
    console.log("");
    console.log("📋 Next steps:");
    console.log("1. Configure MySQL database");
    console.log("2. Update .env file with your settings");
    console.log("3. Run: npm run init-db");
    console.log("4. Start: npm start");
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

function createMinimalClient() {
  const clientPath = path.join(__dirname, "..", "client");

  // Create client directory structure
  if (!fs.existsSync(clientPath)) {
    fs.mkdirSync(clientPath, { recursive: true });
  }

  // Create basic package.json if it doesn't exist
  const packageJsonPath = path.join(clientPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    const packageJson = {
      name: "tsoam-church-client",
      version: "2.0.0",
      scripts: {
        build: 'echo "No client build needed - using static files"',
      },
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

// Run build if called directly
if (require.main === module) {
  buildSystem();
}

module.exports = { buildSystem };
