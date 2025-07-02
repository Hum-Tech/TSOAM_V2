# TSOAM Church Management System

**Version 2.0.0** - Complete Church Administration Solution with MySQL Integration

---

## 🏢 About TSOAM Church International

This comprehensive church management system is specifically designed for **TSOAM Church International** and provides complete administration capabilities for modern church operations.

## ✨ Features

- **👥 Member Management** - Complete member registration, tracking, and service group management
- **💰 Financial Management** - Income, expenses, investments, budgets, and financial reporting
- **👔 Human Resources** - Employee management, payroll, and HR operations
- **📦 Inventory Management** - Asset tracking, maintenance records, and disposal management
- **🤝 Welfare Management** - Member welfare requests and assistance tracking
- **💬 Messaging System** - SMS, Email, and WhatsApp messaging to members
- **📅 Events & Appointments** - Event planning and appointment scheduling
- **⚙️ System Settings** - Comprehensive configuration and backup/restore functionality
- **🌐 Network Sharing** - Multi-user access across local network
- **🗄️ MySQL Database** - Production-ready database with automatic backups

## 🚀 Quick Start Guide

### Prerequisites

Before installing the system, ensure you have:

1. **MySQL Server** (version 5.7 or higher)
2. **Node.js** (version 16 or higher)
3. **npm** (comes with Node.js)

### Step 1: Download and Extract

1. Download the `TSOAM.zip` file
2. Extract it to your desired location (e.g., `C:\TSOAM` or `/home/user/TSOAM`)
3. Open a command prompt/terminal in the extracted folder

### Step 2: Install Dependencies

```bash
# Install server dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: MySQL Database Setup

#### Option A: Using MySQL Workbench (Recommended)

1. Open **MySQL Workbench**
2. Connect to your MySQL server
3. Create a new database:
   ```sql
   CREATE DATABASE tsoam_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Create a user for the application:
   ```sql
   CREATE USER 'church_admin'@'localhost' IDENTIFIED BY 'tsoam2025!';
   GRANT ALL PRIVILEGES ON tsoam_church.* TO 'church_admin'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### Option B: Using Command Line

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database and user
CREATE DATABASE tsoam_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'church_admin'@'localhost' IDENTIFIED BY 'tsoam2025!';
GRANT ALL PRIVILEGES ON tsoam_church.* TO 'church_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Configure Environment

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your MySQL configuration:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=church_admin
   DB_PASSWORD=tsoam2025!
   DB_NAME=tsoam_church

   # Server Configuration
   PORT=3001
   HOST=0.0.0.0
   ```

### Step 5: Initialize Database

```bash
# Initialize the database schema
npm run init-db
```

### Step 6: Build and Start

```bash
# Build the frontend
npm run build

# Start the server
npm start
```

## 🌐 Accessing the System

### Local Access

- Open your browser and go to: `http://localhost:3001`

### Network Access (Other Computers)

1. Find your server computer's IP address:
   - Windows: `ipconfig` in Command Prompt
   - Mac/Linux: `ifconfig` in Terminal
2. On other computers, use: `http://[SERVER_IP]:3001`
3. Example: `http://192.168.1.100:3001`

## 👤 Default Login

The system will create a default admin user on first run:

- **Username**: `admin@tsoam.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately after first login!

## 🔧 Configuration

### Network Sharing

To enable access from other computers on your network:

1. Go to **Settings > Network**
2. Enable "Network Sharing"
3. Share the network URL with other users

### Automatic Backups

1. Go to **Settings > Backup**
2. Enable "Automatic Backup"
3. Set your preferred backup time (default: 2:00 AM daily)
4. Backups are saved in the `backups/` folder

### Email Configuration

1. Go to **Settings > General**
2. Configure SMTP settings for email notifications
3. Test email functionality

## 🗄️ Database Management

### Manual Backup

1. In the system: **Settings > Backup > Create Backup Now**
2. Or use command line:
   ```bash
   npm run backup
   ```

### Restore from Backup

1. In the system: **Settings > Backup > Restore from Backup**
2. Select your backup file and restore

### Clean Demo Data

To remove all demo/test data:

1. Go to **Settings > Security > Clean Demo Data**
2. Or use command line:
   ```bash
   npm run clean-demo
   ```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed

1. Check MySQL is running
2. Verify credentials in `.env` file
3. Ensure database exists
4. Check network connectivity

#### Port Already in Use

```bash
# Use a different port
PORT=3002 npm start
```

#### Cannot Access from Network

1. Check firewall settings
2. Ensure HOST=0.0.0.0 in `.env`
3. Verify network sharing is enabled

### Logs and Debugging

- Server logs: Check console output when running
- Database logs: Check MySQL error logs
- Error logs: Check the terminal/command prompt for errors

## 📱 User Roles

The system supports different user roles:

- **Admin**: Full system access
- **Finance Officer**: Financial management only
- **HR Officer**: Human resources and member management
- **User**: Basic access to events and messaging

## 🔒 Security Features

- Role-based access control
- Session management
- Password encryption
- Audit logging
- Demo data separation

## 🌟 System Requirements

### Minimum Requirements

- **OS**: Windows 10, macOS 10.14, or Linux
- **RAM**: 4GB
- **Storage**: 2GB free space
- **MySQL**: Version 5.7+
- **Node.js**: Version 16+

### Recommended for Network Use

- **OS**: Windows Server or Linux Server
- **RAM**: 8GB
- **Storage**: 10GB free space
- **Network**: Gigabit Ethernet
- **MySQL**: Version 8.0+

## 📞 Support

For technical support or questions:

- **Email**: admin@tsoam.com
- **Church**: TSOAM Church International

## 📄 License

This software is proprietary to TSOAM Church International.

---

## 🚀 Advanced Setup

### For Multiple Computers (Network Installation)

#### Server Computer Setup

1. Install on the main server computer following the setup guide
2. Configure MySQL with network access:
   ```sql
   CREATE USER 'church_admin'@'%' IDENTIFIED BY 'tsoam2025!';
   GRANT ALL PRIVILEGES ON tsoam_church.* TO 'church_admin'@'%';
   ```
3. Update `.env` file:
   ```env
   HOST=0.0.0.0
   DB_HOST=localhost
   ```

#### Client Computers

On each client computer:

1. Install only Node.js (no need for full setup)
2. Access via browser: `http://[SERVER_IP]:3001`
3. Create bookmarks for easy access

### Production Deployment

For production use with multiple users:

1. Use MySQL Server (not local installation)
2. Set up regular automated backups
3. Configure SSL certificates for HTTPS
4. Set up monitoring and logging
5. Configure firewall rules
6. Set up user access controls

### Database Performance Optimization

For better performance with large datasets:

```sql
-- Add additional indexes
CREATE INDEX idx_members_search ON members(name, member_number);
CREATE INDEX idx_transactions_date_amount ON financial_transactions(transaction_date, amount);
CREATE INDEX idx_employees_department_active ON employees(department, employment_status);

-- Configure MySQL for better performance
SET GLOBAL innodb_buffer_pool_size = 1G;
SET GLOBAL query_cache_size = 64M;
```

## 🔄 Updates and Maintenance

### Regular Maintenance

1. **Weekly**: Check backup status and disk space
2. **Monthly**: Review system logs and performance
3. **Quarterly**: Update passwords and review user access
4. **Annually**: Full system backup and security audit

### Updating the System

1. Backup current data
2. Download new version
3. Replace files (keep `.env` and `backups/` folder)
4. Run database migrations if needed
5. Test functionality

---

**© 2025 TSOAM Church International. All rights reserved.**
