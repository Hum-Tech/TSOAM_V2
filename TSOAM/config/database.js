// TSOAM Church Management System - MySQL Database Configuration
require("dotenv").config();

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.pool = null;
    this.config = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "church_admin",
      password: process.env.DB_PASSWORD || "tsoam2025!",
      database: process.env.DB_NAME || "tsoam_church",
      charset: "utf8mb4",
      timezone: "+03:00", // East Africa Time
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      multipleStatements: true,
    };
  }

  // Create connection pool for better performance
  async createPool() {
    try {
      this.pool = mysql.createPool({
        ...this.config,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("✅ MySQL connection pool created successfully");
      return this.pool;
    } catch (error) {
      console.error("❌ Failed to create MySQL pool:", error.message);
      throw error;
    }
  }

  // Test database connection
  async testConnection() {
    try {
      if (!this.pool) {
        await this.createPool();
      }

      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute("SELECT 1 as test");
      connection.release();

      console.log("✅ Database connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Database connection test failed:", error.message);
      return false;
    }
  }

  // Initialize database schema
  async initializeSchema() {
    try {
      if (!this.pool) {
        await this.createPool();
      }

      const schemaPath = path.join(__dirname, "../database/mysql-schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");

      // Execute schema
      const connection = await this.pool.getConnection();
      await connection.query(schema);
      connection.release();

      // Insert default settings
      await this.insertDefaultSettings();

      console.log("✅ Database schema initialized successfully");
    } catch (error) {
      console.error("❌ Schema initialization failed:", error.message);
      throw error;
    }
  }

  // Insert default system settings
  async insertDefaultSettings() {
    const defaultSettings = [
      {
        setting_key: "church_name",
        setting_value: "TSOAM CHURCH INTERNATIONAL",
        is_editable: false,
      },
      {
        setting_key: "timezone",
        setting_value: "Africa/Nairobi",
        is_editable: true,
      },
      { setting_key: "currency", setting_value: "KSH", is_editable: true },
      {
        setting_key: "date_format",
        setting_value: "DD/MM/YYYY",
        is_editable: true,
      },
      {
        setting_key: "email_domain",
        setting_value: "tsoam.com",
        is_editable: false,
      },
      { setting_key: "auto_backup", setting_value: "true", is_editable: true },
      {
        setting_key: "backup_frequency",
        setting_value: "daily",
        is_editable: true,
      },
      { setting_key: "backup_time", setting_value: "02:00", is_editable: true },
      {
        setting_key: "session_timeout",
        setting_value: "30",
        is_editable: true,
      },
      {
        setting_key: "network_sharing",
        setting_value: "true",
        is_editable: true,
      },
      {
        setting_key: "email_notifications",
        setting_value: "true",
        is_editable: true,
      },
      {
        setting_key: "smtp_server",
        setting_value: "smtp.gmail.com",
        is_editable: true,
      },
      { setting_key: "smtp_port", setting_value: "587", is_editable: true },
    ];

    try {
      for (const setting of defaultSettings) {
        await this.query(
          `INSERT INTO system_settings (setting_key, setting_value, is_editable) 
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [setting.setting_key, setting.setting_value, setting.is_editable],
        );
      }
      console.log("✅ Default settings inserted successfully");
    } catch (error) {
      console.error("❌ Failed to insert default settings:", error.message);
    }
  }

  // Execute query with automatic connection handling
  async query(sql, params = []) {
    try {
      if (!this.pool) {
        await this.createPool();
      }

      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(sql, params);
      connection.release();

      return rows;
    } catch (error) {
      console.error("❌ Query execution failed:", error.message);
      throw error;
    }
  }

  // Insert with demo data separation
  async insert(table, data, isDemo = false) {
    const demoTables = [
      "members",
      "financial_transactions",
      "employees",
      "inventory_items",
      "welfare_requests",
      "message_history",
      "events",
      "appointments",
    ];

    if (demoTables.includes(table)) {
      data.is_demo_data = isDemo;
    }

    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ");
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

    try {
      const result = await this.query(sql, values);
      return { insertId: result.insertId, affectedRows: result.affectedRows };
    } catch (error) {
      console.error(`❌ Insert failed for table ${table}:`, error.message);
      throw error;
    }
  }

  // Update data
  async update(table, data, whereClause, whereParams = []) {
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(data), ...whereParams];

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    try {
      return await this.query(sql, values);
    } catch (error) {
      console.error(`❌ Update failed for table ${table}:`, error.message);
      throw error;
    }
  }

  // Delete data
  async delete(table, whereClause, whereParams = []) {
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

    try {
      return await this.query(sql, whereParams);
    } catch (error) {
      console.error(`❌ Delete failed for table ${table}:`, error.message);
      throw error;
    }
  }

  // Backup all data
  async backupData(includeDemo = false) {
    const tables = [
      "users",
      "members",
      "financial_transactions",
      "employees",
      "inventory_items",
      "welfare_requests",
      "message_history",
      "events",
      "appointments",
      "system_settings",
    ];

    const backup = {
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      church: "TSOAM CHURCH INTERNATIONAL",
      include_demo: includeDemo,
      data: {},
    };

    try {
      for (const table of tables) {
        let sql = `SELECT * FROM ${table}`;
        if (!includeDemo && table !== "system_settings") {
          sql += " WHERE is_demo_data = 0 OR is_demo_data IS NULL";
        }
        backup.data[table] = await this.query(sql);
      }

      return backup;
    } catch (error) {
      console.error("❌ Backup failed:", error.message);
      throw error;
    }
  }

  // Restore from backup
  async restoreData(backupData) {
    try {
      const connection = await this.pool.getConnection();
      await connection.beginTransaction();

      try {
        // Clear existing data (except system_settings)
        const tables = Object.keys(backupData.data).filter(
          (t) => t !== "system_settings",
        );
        for (const table of tables) {
          await connection.execute(
            `DELETE FROM ${table} WHERE is_demo_data = 1 OR is_demo_data IS NULL`,
          );
        }

        // Restore data
        for (const [table, records] of Object.entries(backupData.data)) {
          if (records.length > 0) {
            const columns = Object.keys(records[0]).join(", ");
            const placeholders = Object.keys(records[0])
              .map(() => "?")
              .join(", ");

            for (const record of records) {
              const values = Object.values(record);
              const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
              await connection.execute(sql, values);
            }
          }
        }

        await connection.commit();
        console.log("✅ Data restored successfully");
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("❌ Restore failed:", error.message);
      throw error;
    }
  }

  // Clean demo data
  async cleanDemoData() {
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

    try {
      for (const table of tables) {
        await this.delete(table, "is_demo_data = ?", [1]);
      }
      console.log("✅ Demo data cleaned successfully");
    } catch (error) {
      console.error("❌ Demo data cleanup failed:", error.message);
      throw error;
    }
  }

  // Get system settings
  async getSettings() {
    try {
      const settings = await this.query("SELECT * FROM system_settings");
      const settingsObj = {};
      settings.forEach((setting) => {
        settingsObj[setting.setting_key] = {
          value: setting.setting_value,
          editable: setting.is_editable,
        };
      });
      return settingsObj;
    } catch (error) {
      console.error("❌ Failed to get settings:", error.message);
      throw error;
    }
  }

  // Update setting
  async updateSetting(key, value) {
    try {
      const result = await this.update(
        "system_settings",
        { setting_value: value, updated_at: new Date() },
        "setting_key = ? AND is_editable = 1",
        [key],
      );

      if (result.affectedRows === 0) {
        throw new Error("Setting not found or not editable");
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to update setting ${key}:`, error.message);
      throw error;
    }
  }

  // Close all connections
  async close() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
        console.log("✅ Database connections closed");
      }
    } catch (error) {
      console.error("❌ Failed to close database connections:", error.message);
    }
  }
}

module.exports = { DatabaseManager };
