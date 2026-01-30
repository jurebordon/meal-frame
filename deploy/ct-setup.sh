#!/bin/bash
# MealFrame Proxmox CT Setup Script
# Run this script on your new Ubuntu CT after creation

set -e

echo "=== MealFrame CT Setup ==="
echo ""

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "Installing Docker..."
apt install -y curl ca-certificates gnupg lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl enable docker
systemctl start docker

# Verify Docker installation
docker --version
docker compose version

# Install webhook listener (for GitHub Actions deployments)
echo "Installing webhook..."
apt install -y webhook

# Create mealframe directory
echo "Creating application directory..."
mkdir -p /opt/mealframe
cd /opt/mealframe

# Create systemd service for webhook
cat > /etc/systemd/system/mealframe-webhook.service <<'EOF'
[Unit]
Description=MealFrame Webhook Listener
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mealframe
ExecStart=/usr/bin/webhook -hooks /opt/mealframe/hooks.json -verbose -port 9000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Clone the repository: cd /opt/mealframe && git clone <your-repo-url> ."
echo "2. Create .env.production file (see instructions)"
echo "3. Set up webhook hooks.json (see instructions)"
echo "4. Enable webhook: systemctl enable mealframe-webhook --now"
echo "5. Start containers: docker compose -f docker-compose.prod.yml up -d"
