#!/bin/bash

# SustainOlive Frontend - Production Deploy Script
# This script should be run on the production VM

echo "🚀 Starting SustainOlive Frontend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/$(whoami)/SustainOlive-frontend"
BACKUP_DIR="dist_backup_$(date +%Y%m%d_%H%M%S)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Backup current build if it exists
if [ -d "dist" ]; then
    echo -e "${YELLOW}📦 Backing up current build...${NC}"
    mv dist "$BACKUP_DIR"
fi

# Pull latest changes
echo -e "${BLUE}📡 Pulling latest changes from git...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed. Please resolve conflicts manually.${NC}"
    exit 1
fi

# Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm ci failed. Please check the error messages above.${NC}"
    exit 1
fi

# Build for production
echo -e "${BLUE}🏗️  Building for production...${NC}"
npm run build:deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please check the error messages above.${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}🔄 Restoring backup...${NC}"
        mv "$BACKUP_DIR" dist
    fi
    exit 1
fi

# Restart nginx if available
if command -v nginx &> /dev/null; then
    echo -e "${BLUE}🔄 Restarting nginx...${NC}"
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Could not reload nginx. You may need to restart it manually.${NC}"
    fi
fi

# Clean up old backups (keep only last 5)
ls -dt dist_backup_* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application should be available at your configured domain/IP${NC}"

# Display some useful info
echo -e "\n${BLUE}📊 Deployment Info:${NC}"
echo -e "Build time: $(date)"
echo -e "Git commit: $(git rev-parse --short HEAD)"
echo -e "Branch: $(git branch --show-current)"

if [ -d "$BACKUP_DIR" ]; then
    echo -e "Backup created: $BACKUP_DIR"
fi