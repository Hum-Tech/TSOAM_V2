# TSOAM Church Management System - Deployment Guide

## 🚀 Quick Deployment Instructions

### For Single Computer Installation

1. **Extract the TSOAM.zip file** to your desired location
2. **Install MySQL** if not already installed
3. **Run the installer**:
   ```bash
   node install.js
   ```
4. **Configure database** in `.env` file
5. **Initialize the system**:
   ```bash
   npm run init-db
   ```
6. **Start the system**:
   - Windows: Double-click `start.bat`
   - Mac/Linux: `./start.sh`

### For Network Installation (Multiple Computers)

#### Server Computer Setup

1. Follow single computer installation steps above
2. Configure MySQL for network access:
   ```sql
   CREATE USER 'church_admin'@'%' IDENTIFIED BY 'tsoam2025!';
   GRANT ALL PRIVILEGES ON tsoam_church.* TO 'church_admin'@'%';
   FLUSH PRIVILEGES;
   ```
3. Update `.env` file:
   ```env
   HOST=0.0.0.0
   DB_HOST=localhost
   ```
4. Start the system

#### Client Computers

1. **No installation needed** on client computers
2. Open web browser
3. Navigate to: `http://[SERVER_IP]:3001`
4. Use the system normally

## 🔧 Manual Installation Steps

### Prerequisites

- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org/)
- **MySQL 5.7+** - Local or network installation
- **4GB RAM minimum** (8GB recommended for network use)

### Step-by-Step Installation

#### 1. Extract and Navigate

```bash
# Extract TSOAM.zip to your preferred location
# Open terminal/command prompt in the extracted folder
cd TSOAM
```

#### 2. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies (if client folder exists)
cd client
npm install
cd ..
```

#### 3. MySQL Database Setup

**Option A: Using MySQL Workbench**

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Execute these commands:

```sql
-- Create database
CREATE DATABASE tsoam_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'church_admin'@'localhost' IDENTIFIED BY 'tsoam2025!';

-- Grant permissions
GRANT ALL PRIVILEGES ON tsoam_church.* TO 'church_admin'@'localhost';
FLUSH PRIVILEGES;
```

**Option B: Command Line**

```bash
# Connect to MySQL
mysql -u root -p

# Run the commands above
```

#### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

Update these values in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=church_admin
DB_PASSWORD=tsoam2025!
DB_NAME=tsoam_church
```

#### 5. Initialize Database

```bash
# Test connection first
npm run test-connection

# Initialize database schema
npm run init-db
```

#### 6. Build and Start

```bash
# Build the system (if client exists)
npm run build

# Start the server
npm start
```

## 🌐 Network Configuration

### Firewall Configuration

**Windows:**

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" → "Allow another app"
4. Browse and select `node.exe`
5. Check both "Private" and "Public" networks

**Linux:**

```bash
# Ubuntu/Debian
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### Network URLs

After starting the system, you'll see output like:

```
✅ Server started successfully!
🌐 Local access: http://localhost:3001
🌍 Network access: http://0.0.0.0:3001
📱 The system can now be accessed from other computers on the network
```

Share the network URLs with other users on your network.

## 🔒 Security Configuration

### Default Credentials

- **Username**: `admin@tsoam.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the password immediately after first login!

### Production Security

1. **Change default passwords**
2. **Configure HTTPS** (for production)
3. **Set up user roles** properly
4. **Enable automatic backups**
5. **Configure firewall** appropriately

## 💾 Backup and Maintenance

### Automatic Backups

Automatic backups are scheduled for 2:00 AM daily by default.

### Manual Backup

```bash
# Create backup (real data only)
npm run backup

# Create backup including demo data
npm run backup -- --include-demo

# Specific output file
npm run backup -- --output="my-backup.json"
```

### Restore from Backup

```bash
# Restore from backup file
npm run restore -- --file="backup-filename.json"
```

### Clean Demo Data

```bash
# Remove all demo/test data
npm run clean-demo
```

## 🛠️ Troubleshooting

### Common Issues

#### "Database connection failed"

1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists
4. Check network connectivity

#### "Port 3001 already in use"

```bash
# Use different port
PORT=3002 npm start
```

#### "Cannot access from other computers"

1. Check firewall settings
2. Ensure `HOST=0.0.0.0` in `.env`
3. Verify network sharing is enabled in system settings

#### "Permission denied" (Linux/Mac)

```bash
# Make scripts executable
chmod +x start.sh
chmod +x scripts/*.js
```

### Log Files

- **Server logs**: Console output when running
- **MySQL logs**: Check MySQL error logs
- **System logs**: Stored in database `system_logs` table

### Getting Help

- **Email**: admin@tsoam.com
- **Documentation**: README.md
- **Error logs**: Check console output

## 🔄 System Updates

### Updating the System

1. **Backup current data**
2. **Download new version**
3. **Replace system files** (keep `.env` and `backups/`)
4. **Run database migrations** if needed
5. **Test functionality**

### Version Information

- **Current Version**: 2.0.0
- **Database Schema**: MySQL 5.7+
- **Node.js**: 16.0.0+
- **Frontend**: React with TypeScript

## 📊 Performance Optimization

### For Large Churches (1000+ members)

1. **Increase MySQL memory allocation**:

   ```sql
   SET GLOBAL innodb_buffer_pool_size = 1G;
   ```

2. **Add database indexes** for better performance

3. **Use dedicated server** for MySQL

4. **Configure connection pooling**

### System Requirements by Size

| Church Size        | RAM  | Storage | CPU      |
| ------------------ | ---- | ------- | -------- |
| Small (0-100)      | 4GB  | 5GB     | 2 cores  |
| Medium (100-500)   | 8GB  | 10GB    | 4 cores  |
| Large (500-1000)   | 16GB | 20GB    | 8 cores  |
| Enterprise (1000+) | 32GB | 50GB    | 16 cores |

---

**© 2025 TSOAM Church International. All rights reserved.**
