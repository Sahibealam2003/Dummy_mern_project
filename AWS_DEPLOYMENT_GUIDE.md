# MERN Stack AWS CI/CD Deployment Guide (Beginner-Friendly)

Aapka project deploy karne ke liye hum **AWS EC2 (Ubuntu Server)**, **Nginx (Web Server)**, **PM2 (Process Manager)**, aur **GitHub Actions (CI/CD Pipeline)** ka use karenge. 

Yeh method industry-standard (market-ready) hai aur **AWS Free Tier (t2.micro)** me bilkul free chalta hai (12 months ke liye).

---

## 🗺️ Deployment Architecture (Flow kaise kaam karega)

```mermaid
graph TD
    Developer[Developer: Git Push to GitHub] --> GitHub[GitHub Repository]
    GitHub -->|Triggers CI/CD| Actions[GitHub Actions Workflow]
    Actions -->|SSH & Deploy Commands| EC2[AWS EC2 Instance]
    
    subgraph AWS EC2 Server
        Nginx[Nginx Reverse Proxy - Port 80/443] -->|Serves Static Files| Frontend[Frontend Build]
        Nginx -->|Forwards /api requests| Backend[Backend Express App - PM2]
    end
    
    Backend -->|Database Queries| MongoDB[MongoDB Atlas - Cloud DB]
```

---

## 🛠️ Step 1: Database Setup (MongoDB Atlas - Free Forever)
MERN app ke database ko server par install karne ke bajaye cloud par rakhna best aur easiest approach hai.

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) par account banayein.
2. Ek **Free Shared Cluster (M0)** create karein.
3. **Database User** banayein (username aur password note kar lein).
4. **Network Access** me jaakar IP Address ko `0.0.0.0/0` (Allow Access from Anywhere) set karein, taki AWS EC2 connects ho sake.
5. Apni connection string (`mongodb+srv://...`) ko copy kar ke safe rakhein.

---

## 🖥️ Step 2: AWS EC2 Instance Create Karein (Free Tier)
1. **AWS Console** me login karein aur **EC2 Dashboard** par jayein.
2. **Launch Instance** par click karein.
3. **Instance Details:**
   - **Name:** `mern-app-server`
   - **OS (AMI):** Ubuntu Server (Latest LTS version, Free tier eligible)
   - **Instance Type:** `t2.micro` (ya `t3.micro` agar aapke region me free hai)
   - **Key Pair (Login):** "Create new key pair" par click karein. Key pair name dekar `.pem` file download karein (Ise safe rakhein, yeh server ki chabi hai).
4. **Network Settings (Firewall / Security Group):**
   - Allow SSH traffic from: **Anywhere** (ya apna IP select karein security ke liye).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
5. **Launch Instance** par click karein.

---

## 🔑 Step 3: EC2 Security Groups Configuration (Port Opening)
Humare backend ko direct request ke liye ya custom services ke liye ports open karne hote hain.
1. EC2 Dashboard me **Instances** par click karein, aur apne running instance ko select karein.
2. Bottom menu me **Security** tab par jayein aur Security Group link par click karein.
3. **Edit Inbound Rules** par click karein.
4. Niche diye gaye rules add karein:
   - **Custom TCP** | Port Range: `5000` (Aapka Backend Port) | Source: `Anywhere-IPv4` (`0.0.0.0/0`)
   - **Custom TCP** | Port Range: `6379` (Redis, agar EC2 par run kar rahe hain) | Source: `My IP` (security ke liye, backend internally connect karega).
5. Rules ko **Save** karein.

---

## 💻 Step 4: Server Setup (Install Node, Git, Nginx, PM2)
Sabse pehle apne computer se AWS Server me connect karein.

### 1. Server me Connect Karein:
Terminal/PowerShell open karein aur jahan aapne `.pem` file download ki thi wahan jayein:
```bash
# Permisions set karein (sirf Mac/Linux ke liye, Windows par skip karein)
chmod 400 your-key.pem

# SSH command run karein (EC2 public IP dashboard se milega)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 2. Server ko Update Karein aur Node.js Install Karein:
```bash
sudo apt update && sudo apt upgrade -y

# NodeSource setup script download aur Node.js v20 install karein
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify karein
node -v
npm -v
```

### 3. Nginx aur Git Install Karein:
```bash
sudo apt install nginx git -y
```

### 4. PM2 Install Karein (Process Manager):
PM2 backend ko background me continuously run rakhega.
```bash
sudo npm install pm2 -g
```

---

## 🚀 Step 5: First-Time Code Setup aur PM2 Start
Server ke andar Code directory banayein aur code clone karein:

```bash
# Code path directory open karein
cd /var/www

# Permission change karein taki bina sudo ke commands chal sakein
sudo chown -R ubuntu:ubuntu /var/www

# Project clone karein (Aapna GitHub link lagayein)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git mern-app
cd mern-app
```

### 1. Backend Config:
```bash
cd backend
npm install

# .env file create karein aur configuration details fill karein
nano .env
```
*(Yahan apna `MONGO_URI`, JWT secrets, Firebase credentials, Redis credentials aur ports daalein. Save karne ke liye `Ctrl+O`, then `Enter`, then exit ke liye `Ctrl+X` dabayein).*

Backend run karein PM2 se:
```bash
# Server start karein aur PM2 list me register karein
pm2 start src/server.js --name "mern-backend"

# Server reboot hone par automatically restart hone ke liye command:
pm2 startup
pm2 save
```

### 2. Frontend Config:
```bash
cd ../frontend
npm install

# .env configuration (agar api base url define karna hai, ex: VITE_API_URL=http://your-ec2-ip/api)
nano .env

# Build generate karein static files ka
npm run build
```

---

## 🌐 Step 6: Nginx Setup (Reverse Proxy & Frontend Host)
Nginx setup karenge taki domain/IP hit karne par front-end dikhe aur `/api` wali requests backend (port 5000) par redirect ho jayein.

1. Default Nginx config file edit karein:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

2. File ke content ko replace karke niche diya configuration daalein:
   ```nginx
   server {
       listen 80 default_server;
       listen [::]:80 default_server;

       root /var/www/mern-app/frontend/dist; # Vite build files location
       index index.html index.htm;

       server_name _;

       # React Router support ke liye (taki refresh karne par 404 na aaye)
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Backend API requests reverse proxy
       location /api/ {
           proxy_pass http://localhost:5000/; # Backend port
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Nginx restart karein changes apply karne ke liye:
   ```bash
   sudo nginx -t      # Syntax check karne ke liye (Must say successful)
   sudo systemctl restart nginx
   ```

Aapka app ab aapke **EC2 Public IP** par web browser me chal raha hoga!

---

## 🔄 Step 7: GitHub Actions CI/CD Pipeline (Automated Deploy)
Jab bhi aap code `main` branch me push karenge, automation pipeline chalega.

Apne local codebase me `.github/workflows/` directory banayein aur usme `deploy.yml` text file create karein.

### 📝 Text File Code for CI/CD Pipeline (`.github/workflows/deploy.yml`):
```yaml
name: Deploy MERN Application to AWS EC2

on:
  push:
    branches:
      - main  # Jab bhi main branch me code push hoga, pipeline chalega

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # Step 1: GitHub code check-out karega
      - name: Checkout Code
        uses: actions/checkout@v4

      # Step 2: SSH connector deploy key verify karega aur AWS server me commands execute karega
      - name: Deploying to AWS EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}        # Server Public IP
          username: ${{ secrets.EC2_USERNAME }} # Ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}      # .pem file details
          port: 22
          script: |
            cd /var/www/mern-app
            
            # Latest changes pull karein
            git pull origin main
            
            # 1. Update Backend
            cd backend
            npm install --production
            pm2 restart mern-backend # Backend App ko PM2 se restart karein
            
            # 2. Update Frontend
            cd ../frontend
            npm install
            npm run build # Nginx automatic updated files deploy karega dist folder se
```

---

## 🔒 Step 8: GitHub Repository Secrets Configuration
GitHub repository me private details (Jaise IP aur Private Key) direct upload nahi kiye jaate.

1. Apne GitHub Repository par jayein.
2. **Settings** > **Secrets and variables** > **Actions** par click karein.
3. Niche diye gaye **Repository secrets** banayein (`New repository secret` button use karein):
   - `EC2_HOST`: Aapka EC2 Public IP address (e.g., `54.123.45.67`).
   - `EC2_USERNAME`: Server username, jo default ubuntu server ke liye `ubuntu` hota hai.
   - `EC2_SSH_KEY`: Apni `.pem` private key file ko text editor me open karein, pura content copy karein (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) aur yahan paste karein.

Ab aap push karenge, to GitHub Actions khud server me login karke update run kar dega! 🎉
