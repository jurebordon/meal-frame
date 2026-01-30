#!/bin/bash
# MealFrame Deployment Script
# Triggered by GitHub webhook on push to main

set -e

echo "=== MealFrame Deployment Started at $(date) ===" | tee -a /var/log/mealframe-deploy.log

cd /opt/mealframe

# Pull latest code
echo "Pulling latest code..." | tee -a /var/log/mealframe-deploy.log
git pull origin main

# Pull latest Docker images
echo "Pulling Docker images..." | tee -a /var/log/mealframe-deploy.log
docker compose -f docker-compose.prod.yml pull

# Restart containers
echo "Restarting containers..." | tee -a /var/log/mealframe-deploy.log
docker compose -f docker-compose.prod.yml up -d

# Clean up old images
echo "Cleaning up..." | tee -a /var/log/mealframe-deploy.log
docker image prune -f

echo "=== Deployment Complete at $(date) ===" | tee -a /var/log/mealframe-deploy.log
