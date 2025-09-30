# Deployment Guide - SustainOlive Frontend

## 🚀 Production Deployment

### Prerequisites on VM
- Node.js 18+ installed
- Nginx installed and configured
- Git installed
- Proper firewall settings (ports 80, 443 open)

### Initial Setup on VM

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HendrickFS/SustainOlive-frontend.git
   cd SustainOlive-frontend
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Configure your environment variables in `.env`:**
   ```env
   VITE_API_URL=http://YOUR_VM_IP:8080/
   VITE_HISTORICAL_API_URL=http://YOUR_VM_IP:5555/
   ```

4. **Make deploy script executable:**
   ```bash
   chmod +x deploy.sh
   ```

5. **Run initial deployment:**
   ```bash
   ./deploy.sh
   ```

### Regular Deployments

After making changes on your development machine:

1. **On your development machine:**
   ```bash
   git add .
   git commit -m "Your changes description"
   git push origin main
   ```

2. **On the VM:**
   ```bash
   ./deploy.sh
   ```

### Nginx Configuration

Create `/etc/nginx/sites-available/sustainolive-frontend`:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;
    
    root /home/username/SustainOlive-frontend/dist;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|glb|hdr)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/sustainolive-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Environment Variables

The application uses these environment variables:

- `VITE_API_URL`: URL for the main API (default: http://localhost:8080/)
- `VITE_HISTORICAL_API_URL`: URL for historical data API (default: http://localhost:5555/)

### Troubleshooting

1. **Build fails:** Check Node.js version and dependencies
2. **API not reachable:** Verify environment variables and firewall settings
3. **White screen:** Check browser console for errors, verify build was successful
4. **Nginx errors:** Check `/var/log/nginx/error.log`

### Development Workflow

1. Develop locally using `npm run dev`
2. Test with `npm run build` and `npm run preview`
3. Commit and push changes
4. Run `./deploy.sh` on the VM

This ensures no conflicts between development and production environments.