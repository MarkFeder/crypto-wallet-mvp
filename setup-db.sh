#!/bin/bash

# CryptoVault Database Setup Script
# This script sets up the PostgreSQL database for the crypto wallet MVP

echo "🔐 CryptoVault Database Setup"
echo "=============================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL found"

# Database configuration
DB_NAME="crypto_wallet"
DB_USER="postgres"

echo ""
echo "Creating database: $DB_NAME"
echo ""

# Create database (will show error if already exists, but that's okay)
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

# Run schema
echo "Setting up database schema..."
psql -U $DB_USER -d $DB_NAME -f server/schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.example to .env"
    echo "2. Update .env with your database credentials"
    echo "3. Run 'npm start' to start the application"
    echo ""
else
    echo ""
    echo "❌ Database setup failed. Please check the error messages above."
    exit 1
fi
