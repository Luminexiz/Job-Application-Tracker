#!/bin/bash

# Replace with your EC2 public IP and .pem path
EC2_USER=ubuntu
EC2_IP=3.144.17.159
PEM_PATH="D:\Masters\CalPolyPomona\CS5800 Adv Software Engineering\aws-key.pem"
PROJECT_DIR=/home/ubuntu/Job-Application-Tracker

echo "Connecting to EC2 and deploying..."

ssh -i "$PEM_PATH" $EC2_USER@$EC2_IP << EOF
  cd $PROJECT_DIR
  git pull origin main
  pm2 restart server.js
EOF

echo "✅ Deployment Complete!"
