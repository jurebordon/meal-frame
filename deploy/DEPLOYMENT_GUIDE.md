# MealFrame Homelab Deployment Guide

Deployment to Proxmox CT with Nginx Proxy Manager and GitHub Actions CI/CD.

## Prerequisites

- Proxmox VE server
- Domain name: `bordon.family` with DNS pointing to your homelab
- Nginx Proxy Manager already running
- GitHub account (for Actions and Container Registry)

---

## Phase 1: Create Proxmox CT

### 1.1 Create Container

In Proxmox web UI:

1. Click **Create CT**
2. Configure:
   - **Hostname**: `mealframe`
   - **Template**: Ubuntu 22.04 or 24.04
   - **Password**: Set root password
   - **Resources**:
     - Memory: 2048 MB
     - Swap: 512 MB
     - Cores: 2
     - Disk: 20 GB
   - **Network**: Bridge to your LAN
     - IPv4: Static IP (e.g., `192.168.1.100/24`)
     - Gateway: Your router IP
     - DNS: Your router IP or `8.8.8.8`
   - **Start at boot**: ✅ Enabled

3. **Important for Docker**: Enable nesting and keyctl
   - In Proxmox shell:
   ```bash
   pct set <CTID> -features nesting=1,keyctl=1
   ```

4. Start the CT

### 1.2 Initial CT Setup

SSH into the CT:

```bash
ssh root@192.168.1.100
```

Copy the setup script to the CT:

```bash
# On your Mac
scp deploy/ct-setup.sh root@192.168.1.100:/root/
```

Run the setup script on the CT:

```bash
# On the CT
chmod +x /root/ct-setup.sh
/root/ct-setup.sh
```

This will:
- Update system packages
- Install Docker and Docker Compose
- Install webhook listener
- Create systemd service for webhooks
- Set up directory structure

---

## Phase 2: Clone Repository & Configure

### 2.1 Clone Repository

First, push your local code to GitHub (if not already done):

```bash
# On your Mac
cd /Users/jure/Dev/meal-planner
git remote add origin git@github.com:yourusername/mealframe.git
git push -u origin main
```

Then clone on the CT:

```bash
# On the CT
cd /opt/mealframe
git clone https://github.com/yourusername/mealframe.git .
```

### 2.2 Create Production Environment File

```bash
# On the CT
cd /opt/mealframe
cp deploy/.env.production.template .env.production
```

Edit `.env.production`:

```bash
nano .env.production
```

Update these values:
- `DB_PASSWORD`: Generate secure password (e.g., `openssl rand -base64 32`)
- `CORS_ORIGINS`: `https://meals.bordon.family`
- `NEXT_PUBLIC_API_URL`: `https://meals.bordon.family/api/v1`

### 2.3 Set Up Webhook

Generate a webhook secret:

```bash
# On the CT
openssl rand -hex 32
# Copy this secret - you'll need it for GitHub
```

Create webhook config:

```bash
cd /opt/mealframe
cp deploy/hooks.json.template hooks.json
nano hooks.json
```

Replace `CHANGE_ME_TO_SECURE_SECRET` with the secret you generated.

Make deploy script executable:

```bash
chmod +x deploy/deploy.sh
```

Enable and start webhook service:

```bash
systemctl enable mealframe-webhook --now
systemctl status mealframe-webhook
```

---

## Phase 3: GitHub Actions Setup

### 3.1 Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Homelab

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Trigger homelab deployment
        run: |
          curl -X POST https://meals.bordon.family:9000/hooks/deploy-mealframe \
            -H "Content-Type: application/json" \
            -H "X-Hub-Signature-256: sha256=$(echo -n '{"ref":"refs/heads/main"}' | openssl dgst -sha256 -hmac '${{ secrets.WEBHOOK_SECRET }}' | sed 's/^.* //')" \
            -d '{"ref":"refs/heads/main"}'
```

### 3.2 Add GitHub Secrets

In your GitHub repo settings → Secrets and variables → Actions:

1. Click **New repository secret**
2. Name: `WEBHOOK_SECRET`
3. Value: The webhook secret you generated earlier

---

## Phase 4: Nginx Proxy Manager Configuration

### 4.1 Add Proxy Host in NPM

1. In NPM UI, go to **Hosts** → **Proxy Hosts**
2. Click **Add Proxy Host**
3. Configure:

**Details Tab:**
- **Domain Names**: `meals.bordon.family`
- **Scheme**: `http`
- **Forward Hostname/IP**: `192.168.1.100` (your CT IP)
- **Forward Port**: `3000`
- ✅ **Cache Assets**
- ✅ **Block Common Exploits**
- ✅ **Websockets Support**

**SSL Tab:**
- **SSL Certificate**: Request new Let's Encrypt certificate
- **Email**: Your email
- ✅ **Force SSL**
- ✅ **HTTP/2 Support**
- ✅ **HSTS Enabled**

**Advanced Tab:**
Add this custom Nginx config to proxy API requests:

```nginx
location /api/ {
    proxy_pass http://192.168.1.100:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

4. **Save**

### 4.2 Configure Webhook Port (Optional)

If you want GitHub Actions to reach your webhook:

**Option A: Open port 9000 on your router** (forward 9000 → 192.168.1.100:9000)

**Option B: Use NPM to proxy webhook**
- Domain: `webhook.bordon.family`
- Forward to: `192.168.1.100:9000`
- Add SSL

---

## Phase 5: Initial Deployment

### 5.1 Start the Application

On the CT:

```bash
cd /opt/mealframe
docker compose -f docker-compose.yml -f docker-compose.npm.yml up -d
```

Check logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.npm.yml logs -f
```

### 5.2 Verify Deployment

1. Check containers are running:
   ```bash
   docker ps
   ```

2. Test locally on CT:
   ```bash
   curl http://localhost:3000
   ```

3. Test from your network:
   ```bash
   curl http://192.168.1.100:3000
   ```

4. Test via domain (after DNS propagates):
   ```bash
   curl https://meals.bordon.family
   ```

---

## Phase 6: Test CI/CD Pipeline

### 6.1 Make a Test Change

On your Mac:

```bash
cd /Users/jure/Dev/meal-planner
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin main
```

### 6.2 Verify Deployment

1. Check GitHub Actions tab in your repo - workflow should run
2. On CT, check webhook logs:
   ```bash
   journalctl -u mealframe-webhook -f
   ```
3. Check deployment log:
   ```bash
   tail -f /var/log/mealframe-deploy.log
   ```

---

## Maintenance

### View Logs

```bash
# Application logs
docker compose -f docker-compose.yml -f docker-compose.npm.yml logs -f

# Webhook logs
journalctl -u mealframe-webhook -f

# Deployment history
cat /var/log/mealframe-deploy.log
```

### Manual Deployment

```bash
cd /opt/mealframe
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.npm.yml up -d --build
```

### Backup Database

```bash
# Backup
docker exec mealframe-db pg_dump -U mealframe mealframe > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i mealframe-db psql -U mealframe mealframe < backup-20260130.sql
```

### Update Docker Images

```bash
docker compose -f docker-compose.yml -f docker-compose.npm.yml pull
docker compose -f docker-compose.yml -f docker-compose.npm.yml up -d
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs <service>

# Rebuild images
docker compose -f docker-compose.yml -f docker-compose.npm.yml build --no-cache
```

### Can't connect to database

```bash
# Check database is running
docker exec mealframe-db pg_isready -U mealframe

# Check connection from API container
docker exec mealframe-api env | grep DATABASE_URL
```

### Webhook not triggering

```bash
# Check webhook service
systemctl status mealframe-webhook

# Test webhook manually
curl -X POST http://192.168.1.100:9000/hooks/deploy-mealframe \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

### SSL issues in NPM

- Ensure port 80 and 443 are forwarded to NPM on your router
- Check DNS is pointing to your public IP
- Wait for DNS propagation (can take 24-48 hours)

---

## Security Checklist

- ✅ Strong database password in `.env.production`
- ✅ Webhook secret configured and stored in GitHub Secrets
- ✅ Force SSL enabled in NPM
- ✅ HSTS enabled in NPM
- ✅ Regular database backups
- ✅ Firewall rules (only expose 80, 443, and optionally 9000)
- ✅ Keep Docker images updated

---

## Next Steps

Once deployed:

1. Access app at `https://meals.bordon.family`
2. Create your meal library
3. Set up day templates and week plans
4. Start using from mobile!

For questions or issues, check:
- Application logs: `docker compose logs`
- Webhook logs: `journalctl -u mealframe-webhook`
- Deployment log: `/var/log/mealframe-deploy.log`
