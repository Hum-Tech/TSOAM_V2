-- TSOAM Church Management System - MySQL Database Schema
-- Version 2.0.0 - Production Ready

-- Set character set and collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'HR Officer', 'Finance Officer', 'User') NOT NULL DEFAULT 'User',
    employee_id VARCHAR(50),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    can_create_accounts BOOLEAN DEFAULT FALSE,
    can_delete_accounts BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    session_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_category VARCHAR(100) DEFAULT 'general',
    is_editable BOOLEAN DEFAULT TRUE,
    description TEXT,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (setting_category),
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEMBER MANAGEMENT
-- ============================================

-- Visitors Register
CREATE TABLE IF NOT EXISTS visitors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    purpose VARCHAR(255),
    current_church VARCHAR(255),
    visit_date DATE NOT NULL,
    service_attended VARCHAR(100),
    follow_up_required BOOLEAN DEFAULT FALSE,
    notes TEXT,
    recorded_by VARCHAR(50),
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_visit_date (visit_date),
    INDEX idx_follow_up (follow_up_required)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Members
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    member_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female') NOT NULL,
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
    occupation VARCHAR(255),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    membership_date DATE NOT NULL,
    membership_status ENUM('Active', 'Inactive', 'Transferred', 'Deceased') DEFAULT 'Active',
    service_group VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100),
    baptism_date DATE,
    confirmation_date DATE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member_number (member_number),
    INDEX idx_name (name),
    INDEX idx_status (membership_status),
    INDEX idx_service_group (service_group),
    INDEX idx_demo (is_demo_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FINANCIAL MANAGEMENT
-- ============================================

-- Financial Transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(50) PRIMARY KEY,
    transaction_number VARCHAR(20) UNIQUE NOT NULL,
    transaction_type ENUM('Income', 'Expense', 'Investment') NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Bank Transfer', 'Cheque', 'Mobile Money', 'Card') NOT NULL,
    reference_number VARCHAR(100),
    member_id VARCHAR(50),
    project_id VARCHAR(50),
    recorded_by VARCHAR(50) NOT NULL,
    approved_by VARCHAR(50),
    approval_date TIMESTAMP NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
    notes TEXT,
    attachments JSON,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_transaction_number (transaction_number),
    INDEX idx_type (transaction_type),
    INDEX idx_category (category),
    INDEX idx_date (transaction_date),
    INDEX idx_status (status),
    INDEX idx_demo (is_demo_data),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_year YEAR NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    allocated_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0.00,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    status ENUM('Active', 'Inactive', 'Completed') DEFAULT 'Active',
    notes TEXT,
    created_by VARCHAR(50),
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_budget (budget_year, category, sub_category),
    INDEX idx_year (budget_year),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- HUMAN RESOURCES
-- ============================================

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female') NOT NULL,
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    hire_date DATE NOT NULL,
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Volunteer') NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(12,2),
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    tax_number VARCHAR(50),
    employment_status ENUM('Active', 'On Leave', 'Suspended', 'Terminated') DEFAULT 'Active',
    termination_date DATE,
    termination_reason TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_number (employee_number),
    INDEX idx_department (department),
    INDEX idx_status (employment_status),
    INDEX idx_demo (is_demo_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll
CREATE TABLE IF NOT EXISTS payroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances DECIMAL(12,2) DEFAULT 0.00,
    overtime DECIMAL(12,2) DEFAULT 0.00,
    gross_pay DECIMAL(12,2) NOT NULL,
    tax_deduction DECIMAL(12,2) DEFAULT 0.00,
    other_deductions DECIMAL(12,2) DEFAULT 0.00,
    net_pay DECIMAL(12,2) NOT NULL,
    payment_date DATE,
    payment_method ENUM('Bank Transfer', 'Cash', 'Cheque') DEFAULT 'Bank Transfer',
    status ENUM('Draft', 'Approved', 'Paid') DEFAULT 'Draft',
    notes TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_period (pay_period_start, pay_period_end),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVENTORY MANAGEMENT
-- ============================================

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    item_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0,
    maximum_quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_value DECIMAL(15,2) GENERATED ALWAYS AS (current_quantity * unit_cost) STORED,
    location VARCHAR(100),
    supplier VARCHAR(255),
    purchase_date DATE,
    warranty_expiry DATE,
    condition_status ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged') DEFAULT 'New',
    status ENUM('Active', 'Inactive', 'Disposed', 'Under Maintenance') DEFAULT 'Active',
    notes TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_item_code (item_code),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_demo (is_demo_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id VARCHAR(50) NOT NULL,
    maintenance_type ENUM('Preventive', 'Corrective', 'Emergency') NOT NULL,
    description TEXT NOT NULL,
    maintenance_date DATE NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0.00,
    performed_by VARCHAR(255),
    next_maintenance_date DATE,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Completed',
    notes TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    INDEX idx_item (item_id),
    INDEX idx_date (maintenance_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disposal Records
CREATE TABLE IF NOT EXISTS disposal_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id VARCHAR(50) NOT NULL,
    disposal_method ENUM('Sale', 'Donation', 'Recycling', 'Destruction') NOT NULL,
    disposal_date DATE NOT NULL,
    reason TEXT NOT NULL,
    disposed_quantity DECIMAL(10,2) NOT NULL,
    disposal_value DECIMAL(10,2) DEFAULT 0.00,
    authorized_by VARCHAR(255) NOT NULL,
    recipient VARCHAR(255),
    documentation TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    INDEX idx_item (item_id),
    INDEX idx_date (disposal_date),
    INDEX idx_method (disposal_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WELFARE MANAGEMENT
-- ============================================

-- Welfare Requests
CREATE TABLE IF NOT EXISTS welfare_requests (
    id VARCHAR(50) PRIMARY KEY,
    request_number VARCHAR(20) UNIQUE NOT NULL,
    member_id VARCHAR(50),
    request_type ENUM('Financial', 'Medical', 'Educational', 'Emergency', 'Food', 'Other') NOT NULL,
    description TEXT NOT NULL,
    amount_requested DECIMAL(12,2),
    amount_approved DECIMAL(12,2),
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Disbursed') DEFAULT 'Pending',
    request_date DATE NOT NULL,
    review_date DATE,
    approval_date DATE,
    disbursement_date DATE,
    reviewed_by VARCHAR(50),
    approved_by VARCHAR(50),
    disbursed_by VARCHAR(50),
    rejection_reason TEXT,
    supporting_documents JSON,
    follow_up_notes TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_number (request_number),
    INDEX idx_status (status),
    INDEX idx_type (request_type),
    INDEX idx_member (member_id),
    INDEX idx_demo (is_demo_data),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Welfare Budget
CREATE TABLE IF NOT EXISTS welfare_budget (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_year YEAR NOT NULL,
    category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0.00,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_welfare_budget (budget_year, category),
    INDEX idx_year (budget_year),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGING SYSTEM
-- ============================================

-- Message History
CREATE TABLE IF NOT EXISTS message_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_type ENUM('SMS', 'Email', 'WhatsApp') NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipient_type ENUM('Individual', 'Group', 'All Members', 'Department') NOT NULL,
    recipients JSON NOT NULL,
    subject VARCHAR(255),
    message_content TEXT NOT NULL,
    scheduled_time TIMESTAMP,
    sent_time TIMESTAMP,
    delivery_status ENUM('Pending', 'Sent', 'Delivered', 'Failed') DEFAULT 'Pending',
    delivery_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0.00,
    campaign_name VARCHAR(255),
    template_used VARCHAR(100),
    sent_by VARCHAR(50) NOT NULL,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (message_type),
    INDEX idx_status (delivery_status),
    INDEX idx_sent_time (sent_time),
    INDEX idx_demo (is_demo_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(255) UNIQUE NOT NULL,
    message_type ENUM('SMS', 'Email', 'WhatsApp') NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSON,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (template_name),
    INDEX idx_type (message_type),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EVENTS & APPOINTMENTS
-- ============================================

-- Events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('Service', 'Meeting', 'Conference', 'Seminar', 'Social', 'Outreach') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    organizer VARCHAR(255),
    max_participants INT,
    current_participants INT DEFAULT 0,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline DATE,
    status ENUM('Planned', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planned',
    budget DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    notes TEXT,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_start_date (start_date),
    INDEX idx_type (event_type),
    INDEX idx_status (status),
    INDEX idx_demo (is_demo_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_type ENUM('Counseling', 'Meeting', 'Prayer', 'Consultation', 'Other') NOT NULL,
    member_id VARCHAR(50),
    appointed_with VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    location VARCHAR(255),
    status ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Scheduled',
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (appointment_date),
    INDEX idx_member (member_id),
    INDEX idx_status (status),
    INDEX idx_demo (is_demo_data),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT & LOGGING
-- ============================================

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_level ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    user_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    execution_time DECIMAL(8,3),
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (log_level),
    INDEX idx_module (module),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backup History
CREATE TABLE IF NOT EXISTS backup_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backup_type ENUM('Automatic', 'Manual') NOT NULL,
    backup_size BIGINT,
    file_path VARCHAR(500),
    status ENUM('In Progress', 'Completed', 'Failed') NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    error_message TEXT,
    initiated_by VARCHAR(50),
    tables_included JSON,
    include_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (backup_type),
    INDEX idx_status (status),
    INDEX idx_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional performance indexes
CREATE INDEX idx_members_service_status ON members(service_group, membership_status);
CREATE INDEX idx_transactions_date_type ON financial_transactions(transaction_date, transaction_type);
CREATE INDEX idx_employees_dept_status ON employees(department, employment_status);
CREATE INDEX idx_inventory_category_status ON inventory_items(category, status);
CREATE INDEX idx_welfare_status_date ON welfare_requests(status, request_date);
CREATE INDEX idx_messages_sent_status ON message_history(sent_time, delivery_status);
CREATE INDEX idx_events_date_status ON events(start_date, status);

-- ============================================
-- TRIGGERS FOR AUDIT TRAILS
-- ============================================

DELIMITER //

-- Trigger for financial transactions
CREATE TRIGGER tr_financial_transactions_audit
AFTER INSERT ON financial_transactions
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (log_level, module, action, details)
    VALUES ('INFO', 'Finance', 'Transaction Created', 
            JSON_OBJECT('transaction_id', NEW.id, 'type', NEW.transaction_type, 'amount', NEW.amount));
END//

-- Trigger for member updates
CREATE TRIGGER tr_members_audit
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (log_level, module, action, details)
    VALUES ('INFO', 'Members', 'Member Updated', 
            JSON_OBJECT('member_id', NEW.id, 'name', NEW.name));
END//

DELIMITER ;
