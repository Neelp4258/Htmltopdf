# Deployment Guide - HTML to PDF Converter

**Important**: Puppeteer requires a full server environment with Chrome/Chromium. Netlify's serverless functions are **NOT recommended** for this application.

## ⚠️ Why Not Netlify?

Netlify Functions have limitations that make Puppeteer deployment difficult:
- Large Chrome binary download during build (300+ MB)
- Serverless timeout limits
- Memory constraints
- Complex chrome-aws-lambda setup required

## ✅ Recommended Hosting Platforms

### 1. **Render.com** (EASIEST - Recommended!)

Perfect for Puppeteer apps with zero configuration needed!

#### Steps:
1. **Go to [render.com](https://render.com)**
2. **Sign in with GitHub**
3. **Click "New +" → "Web Service"**
4. **Connect your repository**
5. **Configure**:
   - **Name**: html-to-pdf-converter
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for production)
6. **Click "Create Web Service"**

✅ **That's it!** Render automatically installs Chromium. Your app will be live in 5 minutes!

**Render URL**: `https://your-app-name.onrender.com`

---

### 2. **Railway.app** (Super Fast!)

Great performance and simple deployment.

#### Steps:
1. **Go to [railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Add variables** (optional):
   ```
   PORT=3000
   ```
6. **Deploy!**

Railway auto-detects Node.js and installs everything including Chrome.

**Railway URL**: `https://your-app.up.railway.app`

---

### 3. **Heroku** (Classic Choice)

Reliable and well-documented.

#### Steps:
1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Add Puppeteer buildpack**:
   ```bash
   heroku buildpacks:add jontewks/puppeteer
   heroku buildpacks:add heroku/nodejs
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

**Heroku URL**: `https://your-app-name.herokuapp.com`

---

### 4. **DigitalOcean App Platform**

Full control with App Platform or Droplets.

#### Steps:
1. **Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)**
2. **Create App** → **GitHub**
3. **Select repository**
4. **Configure**:
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
5. **Deploy**

**DigitalOcean URL**: `https://your-app.ondigitalocean.app`

---

### 5. **Fly.io** (Modern & Fast)

Low latency global deployment.

#### Steps:
1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```

2. **Create app**:
   ```bash
   fly launch
   ```

3. **Deploy**:
   ```bash
   fly deploy
   ```

**Fly URL**: `https://your-app.fly.dev`

---

## Quick Comparison

| Platform | Ease of Use | Free Tier | Best For |
|----------|------------|-----------|----------|
| **Render** | ⭐⭐⭐⭐⭐ | ✅ Yes (750hrs) | Quick deployment |
| **Railway** | ⭐⭐⭐⭐⭐ | ✅ Yes ($5 credit) | Fast performance |
| **Heroku** | ⭐⭐⭐⭐ | ⚠️ Limited | Production apps |
| **DigitalOcean** | ⭐⭐⭐ | ❌ No | Full control |
| **Fly.io** | ⭐⭐⭐⭐ | ✅ Yes | Global distribution |

---

## 🚀 Fastest Deploy (Render.com)

Just do this:

```bash
# 1. Push to GitHub (already done!)
git push origin main

# 2. Go to render.com
# 3. Click "New Web Service"
# 4. Connect GitHub repo
# 5. Click "Create"
# Done! Live in 5 minutes
```

---

## Environment Variables (Optional)

All platforms support these:

```bash
PORT=3000
NODE_ENV=production
```

---

## Testing Your Deployment

Once deployed, test with:

```bash
curl https://your-app-url.com/api/health
```

Should return:
```json
{"status":"ok","message":"HTML to PDF Converter API is running"}
```

---

## Need Help?

- **Render Issues**: Check build logs in Render dashboard
- **Railway Issues**: View logs with `railway logs`
- **Heroku Issues**: Run `heroku logs --tail`

---

## My #1 Recommendation

**Use Render.com** - It's free, fast, and works perfectly with Puppeteer out of the box!

1. Go to render.com
2. Sign in with GitHub
3. New Web Service → Select repo
4. Click Create
5. Done! ✅

Your app will be live at `https://your-app.onrender.com` in ~5 minutes.
