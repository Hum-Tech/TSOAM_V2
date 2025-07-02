#!/bin/bash

echo "==============================================="
echo "TSOAM CHURCH MANAGEMENT SYSTEM"
echo "Version 2.0.0"
echo "==============================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Test MySQL connection
echo "Checking MySQL connection..."
node scripts/test-connection.js
if [ $? -ne 0 ]; then
    echo "ERROR: MySQL connection failed"
    echo "Please check your database configuration in .env file"
    exit 1
fi

echo "Starting TSOAM Church Management System..."
echo ""
echo "The system will be available at:"
echo "- Local: http://localhost:3001"
echo "- Network: Check console output for network URLs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
