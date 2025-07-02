#!/usr/bin/env node

// TSOAM Church Management System - Database Initialization Script
require("dotenv").config();
const { DatabaseManager } = require("../config/database");

async function initializeDatabase() {
  console.log("🚀 TSOAM Church Management System");
  console.log("📊 Database Initialization Script");
  console.log("=".repeat(50));

  const db = new DatabaseManager();

  try {
    // Test connection
    console.log("🔄 Testing database connection...");
    const isConnected = await db.testConnection();

    if (!isConnected) {
      console.error("❌ Database connection failed!");
      console.error("💡 Please check your MySQL configuration:");
      console.error(`   - Host: ${process.env.DB_HOST || "localhost"}`);
      console.error(`   - Port: ${process.env.DB_PORT || "3306"}`);
      console.error(`   - User: ${process.env.DB_USER || "church_admin"}`);
      console.error(`   - Database: ${process.env.DB_NAME || "tsoam_church"}`);
      process.exit(1);
    }

    console.log("✅ Database connection successful!");

    // Initialize schema
    console.log("🔄 Initializing database schema...");
    await db.initializeSchema();
    console.log("✅ Database schema initialized!");

    // Insert default admin user
    console.log("🔄 Creating default admin user...");
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    try {
      await db.insert(
        "users",
        {
          id: "admin_001",
          name: "System Administrator",
          email: "admin@tsoam.com",
          password_hash: hashedPassword,
          role: "Admin",
          department: "Administration",
          phone: "+254700000000",
          is_active: true,
          is_demo_data: false,
          can_create_accounts: true,
          can_delete_accounts: true,
          created_at: new Date(),
        },
        false,
      );
      console.log("✅ Default admin user created!");
      console.log("📧 Email: admin@tsoam.com");
      console.log("🔑 Password: admin123");
      console.log("⚠️  Please change the password after first login!");
    } catch (error) {
      if (error.message.includes("Duplicate entry")) {
        console.log("ℹ️  Default admin user already exists");
      } else {
        throw error;
      }
    }

    // Insert sample data for testing
    console.log("🔄 Inserting sample demo data...");
    await insertSampleData(db);
    console.log("✅ Sample demo data inserted!");

    console.log("");
    console.log("🎉 Database initialization completed successfully!");
    console.log("🌐 You can now start the server with: npm start");
    console.log("🏢 TSOAM Church International Management System is ready!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

async function insertSampleData(db) {
  // Sample members
  const sampleMembers = [
    {
      id: "MEM_001",
      member_number: "TM001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+254700000001",
      date_of_birth: "1985-06-15",
      gender: "Male",
      marital_status: "Married",
      occupation: "Teacher",
      address: "123 Main Street, Nairobi",
      membership_date: "2020-01-15",
      membership_status: "Active",
      service_group: "Adult Ministry",
      department: "Ushering",
      is_demo_data: true,
    },
    {
      id: "MEM_002",
      member_number: "TM002",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+254700000002",
      date_of_birth: "1990-03-22",
      gender: "Female",
      marital_status: "Single",
      occupation: "Nurse",
      address: "456 Oak Avenue, Nairobi",
      membership_date: "2021-05-10",
      membership_status: "Active",
      service_group: "Youth Ministry",
      department: "Music",
      is_demo_data: true,
    },
  ];

  for (const member of sampleMembers) {
    try {
      await db.insert("members", member, true);
    } catch (error) {
      // Ignore duplicate entries
    }
  }

  // Sample financial transactions
  const sampleTransactions = [
    {
      id: "TXN_001",
      transaction_number: "T001",
      transaction_type: "Income",
      category: "Tithes",
      amount: 50000.0,
      description: "Sunday Service Tithes Collection",
      transaction_date: "2025-01-01",
      payment_method: "Cash",
      recorded_by: "admin_001",
      status: "Approved",
      is_demo_data: true,
    },
    {
      id: "TXN_002",
      transaction_number: "T002",
      transaction_type: "Expense",
      category: "Utilities",
      amount: 15000.0,
      description: "Electricity Bill Payment",
      transaction_date: "2025-01-05",
      payment_method: "Bank Transfer",
      recorded_by: "admin_001",
      status: "Approved",
      is_demo_data: true,
    },
  ];

  for (const transaction of sampleTransactions) {
    try {
      await db.insert("financial_transactions", transaction, true);
    } catch (error) {
      // Ignore duplicate entries
    }
  }

  // Sample inventory items
  const sampleInventory = [
    {
      id: "INV_001",
      item_code: "CHAIR001",
      name: "Church Chair",
      description: "Plastic chairs for congregation seating",
      category: "Furniture",
      sub_category: "Seating",
      unit_of_measure: "pieces",
      current_quantity: 100,
      minimum_quantity: 50,
      unit_cost: 1500.0,
      location: "Main Hall",
      supplier: "Furniture Plus Ltd",
      condition_status: "Good",
      status: "Active",
      is_demo_data: true,
    },
    {
      id: "INV_002",
      item_code: "SOUND001",
      name: "Sound System",
      description: "Main sound system for church services",
      category: "Electronics",
      sub_category: "Audio Equipment",
      unit_of_measure: "set",
      current_quantity: 1,
      minimum_quantity: 1,
      unit_cost: 250000.0,
      location: "Main Hall",
      supplier: "Audio Tech Solutions",
      condition_status: "New",
      status: "Active",
      is_demo_data: true,
    },
  ];

  for (const item of sampleInventory) {
    try {
      await db.insert("inventory_items", item, true);
    } catch (error) {
      // Ignore duplicate entries
    }
  }

  console.log("ℹ️  Sample demo data includes:");
  console.log("   - 2 sample members");
  console.log("   - 2 sample financial transactions");
  console.log("   - 2 sample inventory items");
  console.log("   - Default system settings");
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
