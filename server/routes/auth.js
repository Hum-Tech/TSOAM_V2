const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password, otp, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Get user from database
    const userResult = await query(
      "SELECT * FROM users WHERE email = ? AND is_active = true",
      [email],
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult.data[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check OTP for admin users (simplified - in production use proper OTP)
    if (
      (user.role === "Admin" || user.role === "HR Officer") &&
      otp !== "123456"
    ) {
      return res.status(400).json({
        error: "OTP required for admin users",
        requireOTP: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: rememberMe ? "7d" : "24h" },
    );

    // Update last login
    await query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );

    // Return user data (without password)
    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      token,
      user: {
        ...userData,
        permissions: getRolePermissions(user.role),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get role permissions
function getRolePermissions(role) {
  const basePermissions = {
    dashboard: true,
    members: false,
    hr: false,
    finance: false,
    welfare: false,
    inventory: false,
    events: false,
    appointments: false,
    messaging: false,
    settings: false,
    users: false,
    systemLogs: false,
  };

  switch (role) {
    case "Admin":
      return {
        dashboard: true,
        members: true,
        hr: true,
        finance: true,
        welfare: true,
        inventory: true,
        events: true,
        appointments: true,
        messaging: true,
        settings: true,
        users: true,
        systemLogs: true,
      };
    case "HR Officer":
      return {
        ...basePermissions,
        members: true,
        hr: true,
        welfare: true,
        appointments: true,
        messaging: true,
      };
    case "Finance Officer":
      return {
        ...basePermissions,
        finance: true,
        inventory: true,
        events: true,
      };
    case "User":
    default:
      return {
        ...basePermissions,
        members: true,
        inventory: true,
        events: true,
        appointments: true,
      };
  }
}

// Create account endpoint
router.post("/create-account", async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (existingUser.success && existingUser.data.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = `user-${Date.now()}`;
    const insertResult = await query(
      `INSERT INTO users (id, name, email, password_hash, role, department, employee_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, passwordHash, role, department, employeeId],
    );

    if (!insertResult.success) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    res.json({
      success: true,
      message: "User created successfully",
      credentials: { email, password },
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify token middleware
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret",
    );
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Get pending users for verification
router.get("/pending-verification", async (req, res) => {
  try {
    const result = await query(
      `SELECT u.*, 'pending' as status, NOW() as requestedAt
       FROM users u
       WHERE u.is_active = false
       ORDER BY u.created_at DESC`,
    );

    if (!result.success) {
      return res.status(500).json({ error: "Failed to fetch pending users" });
    }

    res.json({
      success: true,
      users: result.data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employee_id,
        requestedAt: user.created_at,
        status: "pending",
      })),
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify user account
router.post("/verify-account", async (req, res) => {
  try {
    const { userId, action, assignedRole, assignedDepartment, reason } =
      req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: "User ID and action are required" });
    }

    if (action === "approve") {
      // Approve the account
      const updateResult = await query(
        `UPDATE users SET
         is_active = true,
         role = ?,
         department = ?
         WHERE id = ?`,
        [assignedRole, assignedDepartment, userId],
      );

      if (!updateResult.success) {
        return res.status(500).json({ error: "Failed to approve account" });
      }

      // Log the approval
      await query(
        `INSERT INTO system_logs (action, module, details, severity)
         VALUES (?, ?, ?, ?)`,
        [
          "Account Approved",
          "User Management",
          `Account approved for user ${userId} with role ${assignedRole}`,
          "Info",
        ],
      );
    } else if (action === "reject") {
      // Reject the account - you might want to delete or mark as rejected
      const deleteResult = await query("DELETE FROM users WHERE id = ?", [
        userId,
      ]);

      if (!deleteResult.success) {
        return res.status(500).json({ error: "Failed to reject account" });
      }

      // Log the rejection
      await query(
        `INSERT INTO system_logs (action, module, details, severity)
         VALUES (?, ?, ?, ?)`,
        [
          "Account Rejected",
          "User Management",
          `Account rejected for user ${userId}. Reason: ${reason}`,
          "Warning",
        ],
      );
    }

    res.json({ success: true, message: "Account verification processed" });
  } catch (error) {
    console.error("Account verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create user account request endpoint
router.post("/users/create-request", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      employee_id,
      requested_by,
      ip_address,
      request_reason,
    } = req.body;

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, and role are required" });
    }

    // Insert into pending verification table
    const requestId = `REQ-${Date.now()}`;
    const result = await query(
      `INSERT INTO user_requests (
        request_id, name, email, phone, role, department, employee_id,
        requested_by, ip_address, request_reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        requestId,
        name,
        email,
        phone,
        role,
        department,
        employee_id,
        requested_by,
        ip_address,
        request_reason,
      ],
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Account creation request submitted successfully",
        requestId,
      });
    } else {
      console.log(
        "💡 Database offline - returning demo account request confirmation",
      );
      // Return success in demo mode when database is offline
      res.json({
        success: true,
        message: "Account creation request submitted successfully (Demo Mode)",
        requestId,
        demo: true,
      });
    }
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
