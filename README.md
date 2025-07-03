# TSOAM Church Management System

A comprehensive church management system for **The Seed of Abraham Ministry (TSOAM)** with complete member management, finance tracking, HR management, welfare programs, inventory control, and more.

## 🌟 Features

### Core Modules

- **📊 Dashboard** - Overview and analytics
- **👥 Member Management** - Complete member database
- **💼 Human Resources** - Employee and staff management
- **💰 Finance Management** - Income, expenses, and investment tracking
- **❤️ Welfare Programs** - Assistance request management
- **📦 Inventory Management** - Church assets and equipment
- **📅 Events Management** - Church events and activities
- **🗓️ Appointments** - Scheduling and calendar management
- **💬 Messaging** - Communication system
- **⚙️ Settings & Administration** - System configuration

### Key Features

- **🔐 Role-Based Access Control** - Admin, HR Officer, Finance Officer, User roles
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🌐 LAN Support** - Multi-computer access over local network
- **📤 File Upload** - Document management for all modules
- **📊 Export Functions** - PDF, Excel, and CSV exports
- **🔒 Secure Authentication** - JWT-based with OTP for admin users
- **💾 Database Integration** - Full MySQL/MariaDB support
- **🖨️ Professional Printing** - Formatted reports and documents

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0 or higher
- **MySQL** 8.0 or **MariaDB** 10.3 or higher
- **npm** 8.0 or higher

### Installation

1. **Download and Extract**

   ```bash
   # Extract the TSOAM system files to your desired directory
   cd /path/to/tsoam-system
   ```

2. **Automated Setup**

   ```bash
   # Run the automated setup script
   npm run setup
   ```

3. **Configure Database**

   ```bash
   # Edit the .env file with your MySQL credentials
   nano .env

   # Update these values:
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=tsoam_church_db
   ```

4. **Create Database**

   ```bash
   # Create the database
   npm run create-db

   # Import the schema
   npm run import-schema
   ```

5. **Start the System**

   ```bash
   # Start the server
   npm start
   ```

6. **Access the System**
   - **Local Access**: http://localhost:3001
   - **LAN Access**: http://[YOUR-IP]:3001

### Manual Installation

If the automated setup doesn't work, follow these steps:

1. **Install Dependencies**

   ```bash
   # Install main dependencies
   npm install

   # Install client dependencies
   cd client && npm install && cd ..

   # Install server dependencies
   cd server && npm install && cd ..
   ```

2. **Build Client**

   ```bash
   cd client && npm run build && cd ..
   ```

3. **Setup Environment**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit with your settings
   nano .env
   ```

4. **Database Setup**

   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE tsoam_church_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

   # Import schema
   mysql -u root -p tsoam_church_db < database/schema.sql
   ```

5. **Start Server**
   ```bash
   cd server && npm start
   ```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tsoam_church_db

# Security
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# Church Information
CHURCH_NAME=The Seed of Abraham Ministry (TSOAM)
CHURCH_ADDRESS=Nairobi, Kenya
CHURCH_PHONE=+254 700 000 000
CHURCH_EMAIL=admin@tsoam.org
```

### Network Access (LAN)

To allow other computers to access the system:

1. **Find Your IP Address**

   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. **Configure Firewall**

   - Allow port 3001 through your firewall
   - Windows: Windows Defender Firewall
   - Mac: System Preferences > Security & Privacy > Firewall
   - Linux: `sudo ufw allow 3001`

3. **Access from Other Computers**
   - Open browser and go to: `http://[YOUR-IP]:3001`
   - Replace `[YOUR-IP]` with your computer's IP address

## 👤 Default Login Credentials

| Role  | Email           | Password | Access Level       |
| ----- | --------------- | -------- | ------------------ |
| Admin | admin@tsoam.org | admin123 | Full System Access |

**⚠️ Important**: Change the default password after first login!

## 📋 Available Scripts

```bash
# Setup and Installation
npm run setup              # Automated setup
npm run install-all        # Install all dependencies
npm run build             # Build client application

# Database Management
npm run create-db         # Create database
npm run import-schema     # Import database schema
npm run backup-db         # Backup database
npm run reset-db          # Reset database (WARNING: Deletes all data!)

# Running the Application
npm start                 # Start production server
npm run dev-server        # Start development server
npm run dev-client        # Start development client

# Utilities
npm run test-connection   # Test database connection
npm run production        # Build and start production
```

## 🗂️ Project Structure

```
tsoam-church-management-system/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend server
│   ├── config/           # Configuration files
│   ├── routes/           # API routes
│   ├── uploads/          # File upload directory
│   └── package.json
├── database/             # Database schema and scripts
│   └── schema.sql
├── .env.example         # Environment template
├── setup.js            # Automated setup script
└── README.md           # This file
```

## 🎯 Module Guide

### Dashboard

- System overview and key metrics
- Quick access to recent activities
- Role-based content display

### Member Management

- Complete member database
- Personal information and contact details
- Membership status tracking
- Employment and emergency contacts

### Human Resources

- Employee management
- Leave request system
- Payroll tracking
- Department organization

### Finance Management

- Income tracking (Tithe, Offerings, Donations)
- **Investment Revenue Tracking** - Records money collected FROM investments
- Expense management with approval workflow
- Financial reports and analytics
- File upload for receipts and documents

### Welfare Programs

- Comprehensive application form based on TSOAM Welfare Form (TWF)
- Document upload system (ID, fees statements, medical reports)
- Application status tracking
- Budget management

### Inventory Management

- Asset tracking with categories
- Maintenance records
- Disposal management
- File upload for warranties and manuals

### Events & Appointments

- Event planning and management
- Appointment scheduling
- Calendar integration
- Attendance tracking

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Role-Based Access Control** (RBAC)
- **OTP Verification** for admin users
- **Session Management** with automatic timeout
- **Password Hashing** using bcrypt
- **SQL Injection Prevention** using parameterized queries
- **File Upload Validation** with type and size restrictions

## 📊 Export & Reporting

All modules support multiple export formats:

- **PDF Reports** with church branding
- **Excel Spreadsheets** (.xlsx format)
- **CSV Files** for data analysis
- **Professional Printing** with formatted layouts

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**

   ```bash
   # Check MySQL is running
   sudo service mysql start

   # Test connection
   npm run test-connection
   ```

2. **Port Already in Use**

   ```bash
   # Change port in .env file
   PORT=3002
   ```

3. **Permission Denied on File Upload**

   ```bash
   # Fix upload directory permissions
   chmod 755 server/uploads
   ```

4. **Cannot Access from Other Computers**
   - Check firewall settings
   - Verify IP address is correct
   - Ensure both computers are on the same network

### Logs and Debugging

- **Server Logs**: Check console output when running server
- **Client Logs**: Open browser developer tools (F12)
- **Database Logs**: Check MySQL error logs

## 🔄 Backup and Maintenance

### Regular Backups

```bash
# Create database backup
npm run backup-db

# Backup files
cp -r server/uploads backups/uploads_$(date +%Y%m%d)
```

### Updates and Maintenance

- Regularly backup your database
- Keep the system updated
- Monitor disk space for uploads
- Review user accounts periodically

## 📞 Support

For technical support or questions:

- **Email**: admin@tsoam.org
- **Phone**: +254 700 000 000

## 📄 License

This system is developed specifically for The Seed of Abraham Ministry (TSOAM). All rights reserved.

---

**© 2025 The Seed of Abraham Ministry (TSOAM). All rights reserved.**
