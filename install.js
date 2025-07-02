#!/usr/bin/env node

// TSOAM Church Management System - Installation Script
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(message, color = "white") {
  console.log(colors[color] + message + colors.reset);
}

function header() {
  log("===============================================", "cyan");
  log("🏢 TSOAM CHURCH MANAGEMENT SYSTEM", "cyan");
  log("📦 Installation & Setup Script", "cyan");
  log("Version 2.0.0", "cyan");
  log("===============================================", "cyan");
  log("");
}

function checkNodeJS() {
  log("🔄 Checking Node.js installation...", "blue");
  try {
    const version = execSync("node --version", { encoding: "utf8" }).trim();
    const majorVersion = parseInt(version.substring(1).split(".")[0]);

    if (majorVersion >= 16) {
      log(`✅ Node.js ${version} found`, "green");
      return true;
    } else {
      log(
        `❌ Node.js ${version} is too old. Please install Node.js 16 or higher`,
        "red",
      );
      return false;
    }
  } catch (error) {
    log(
      "❌ Node.js not found. Please install Node.js from https://nodejs.org/",
      "red",
    );
    return false;
  }
}

function checkMySQL() {
  log("🔄 Checking MySQL installation...", "blue");
  try {
    execSync("mysql --version", { encoding: "utf8", stdio: "ignore" });
    log("✅ MySQL found", "green");
    return true;
  } catch (error) {
    log(
      "⚠️  MySQL not found in PATH. Please ensure MySQL is installed",
      "yellow",
    );
    log(
      "💡 You can still proceed if MySQL is installed but not in PATH",
      "yellow",
    );
    return false;
  }
}

async function installDependencies() {
  log("🔄 Installing server dependencies...", "blue");

  return new Promise((resolve, reject) => {
    const npm = spawn("npm", ["install"], { stdio: "inherit" });

    npm.on("close", (code) => {
      if (code === 0) {
        log("✅ Server dependencies installed", "green");
        resolve();
      } else {
        log("❌ Failed to install server dependencies", "red");
        reject(new Error("NPM install failed"));
      }
    });
  });
}

async function installClientDependencies() {
  const clientPath = path.join(__dirname, "client");

  if (fs.existsSync(clientPath)) {
    log("🔄 Installing client dependencies...", "blue");

    return new Promise((resolve, reject) => {
      const npm = spawn("npm", ["install"], {
        cwd: clientPath,
        stdio: "inherit",
      });

      npm.on("close", (code) => {
        if (code === 0) {
          log("✅ Client dependencies installed", "green");
          resolve();
        } else {
          log("❌ Failed to install client dependencies", "red");
          reject(new Error("Client NPM install failed"));
        }
      });
    });
  } else {
    log(
      "ℹ️  Client directory not found, skipping client dependencies",
      "yellow",
    );
  }
}

function setupEnvironment() {
  log("🔄 Setting up environment configuration...", "blue");

  const envPath = path.join(__dirname, ".env");
  const envExamplePath = path.join(__dirname, ".env.example");

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    log("✅ Environment file created from template", "green");
    log("💡 Please edit .env file with your MySQL configuration", "yellow");
  } else if (fs.existsSync(envPath)) {
    log("ℹ️  Environment file already exists", "yellow");
  } else {
    log("⚠️  No environment template found", "yellow");
  }
}

function createDirectories() {
  log("🔄 Creating necessary directories...", "blue");

  const dirs = ["backups", "logs", "uploads"];

  dirs.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created directory: ${dir}`, "green");
    }
  });
}

function makeScriptsExecutable() {
  if (process.platform !== "win32") {
    log("🔄 Making scripts executable...", "blue");

    try {
      execSync("chmod +x start.sh", { stdio: "ignore" });
      execSync("chmod +x scripts/*.js", { stdio: "ignore" });
      log("✅ Scripts made executable", "green");
    } catch (error) {
      log("⚠️  Could not make scripts executable", "yellow");
    }
  }
}

function showNextSteps() {
  log("", "white");
  log("🎉 Installation completed successfully!", "green");
  log("", "white");
  log("📋 Next Steps:", "cyan");
  log("", "white");
  log("1. Configure MySQL Database:", "yellow");
  log("   • Create database: CREATE DATABASE tsoam_church;", "white");
  log(
    "   • Create user: CREATE USER 'church_admin'@'localhost' IDENTIFIED BY 'tsoam2025!';",
    "white",
  );
  log(
    "   • Grant permissions: GRANT ALL PRIVILEGES ON tsoam_church.* TO 'church_admin'@'localhost';",
    "white",
  );
  log("", "white");
  log("2. Update Environment Configuration:", "yellow");
  log("   • Edit .env file with your MySQL settings", "white");
  log("   • Update DB_HOST, DB_USER, DB_PASSWORD as needed", "white");
  log("", "white");
  log("3. Initialize Database:", "yellow");
  log("   • Run: npm run init-db", "white");
  log("", "white");
  log("4. Start the System:", "yellow");
  if (process.platform === "win32") {
    log("   • Windows: double-click start.bat or run npm start", "white");
  } else {
    log("   • Linux/Mac: ./start.sh or npm start", "white");
  }
  log("", "white");
  log("5. Access the System:", "yellow");
  log("   • Local: http://localhost:3001", "white");
  log("   • Network: http://[YOUR_IP]:3001", "white");
  log("", "white");
  log("6. Default Login:", "yellow");
  log("   • Username: admin@tsoam.com", "white");
  log("   • Password: admin123", "white");
  log("   • ⚠️  Change password after first login!", "red");
  log("", "white");
  log("📞 Support: admin@tsoam.com", "cyan");
  log("🏢 TSOAM Church International", "cyan");
}

async function main() {
  header();

  try {
    // Check prerequisites
    if (!checkNodeJS()) {
      process.exit(1);
    }

    checkMySQL();

    // Setup
    setupEnvironment();
    createDirectories();
    makeScriptsExecutable();

    // Install dependencies
    await installDependencies();
    await installClientDependencies();

    // Show next steps
    showNextSteps();
  } catch (error) {
    log("", "white");
    log("❌ Installation failed:", "red");
    log(error.message, "red");
    log("", "white");
    log("💡 Please check the error above and try again", "yellow");
    log("📞 For help, contact: admin@tsoam.com", "cyan");
    process.exit(1);
  }
}

// Run installation
if (require.main === module) {
  main();
}
