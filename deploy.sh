#!/bin/bash

echo "🚀 Starting Deployment from GitHub..."

# Navigate to your project folder
cd ~/Job-Application-Tracker

# Pull the latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install/update dependencies (optional)
echo "📦 Installing dependencies..."
npm install

# Restart your Node.js server using PM2
echo "🔁 Restarting server with PM2..."
pm2 restart server.js

echo "✅ Deployment complete!"
