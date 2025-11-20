# 🚀 How to Publish to GitHub & Deploy Your Website

This guide will help you push your "Pharmacy Inventory & eRx System" to GitHub and deploy it to the web so anyone can access it.

---

## Part 1: Push to GitHub

### 1. Initialize Git
Open your terminal in the project root (`c:\Users\Admin\Downloads\pharmacy-inventory-eRx`) and run:

```bash
git init
git add .
git commit -m "Initial commit: Complete Pharmacy System"
```

### 2. Create a Repository on GitHub
1. Go to [GitHub.com](https://github.com) and log in.
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `pharmacy-erx-system`.
4. Make it **Private** (recommended since it contains business logic) or **Public**.
5. Click **Create repository**.

### 3. Connect and Push
Copy the commands shown on GitHub under "…or push an existing repository from the command line" and run them in your terminal:

```bash
git branch -M main
git remote add origin https://github.com/Devamstark/Phamracy-managment.git
git push -u origin main
```

---

## Part 2: Deploy to the Web (Make it Live)

Since this is a full-stack app (Frontend + Backend + Database), you need to host 3 parts. The easiest free/cheap way is using **Render** or **Railway**.

### Option A: The Easiest Way (Railway.app)
**Railway** is great because it can host everything in one place.

1. **Sign up** at [Railway.app](https://railway.app/) using your GitHub account.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your `pharmacy-erx-system` repo.
4. **Add a Database:**
   - In your project view, click **New** > **Database** > **PostgreSQL**.
   - Railway will give you connection variables (Host, User, Password, etc.).
5. **Configure Backend:**
   - Go to your backend service settings.
   - Add Environment Variables matching your local `.env` (but use the Railway Database values):
     - `DB_HOST`: (from Railway)
     - `DB_PASSWORD`: (from Railway)
     - `DB_USERNAME`: (from Railway)
     - `PORT`: `5000`
   - Set the **Start Command**: `npm start` (Make sure `package.json` has `"start": "node dist/server.js"`).
6. **Configure Frontend:**
   - Add Environment Variables:
     - `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://backend-production.up.railway.app`).

### Option B: The "Pro" Way (Vercel + Render)
This splits the services for better performance.

#### 1. Database (Neon or Render)
1. Go to [Neon.tech](https://neon.tech) (Free Tier is great).
2. Create a project. Copy the **Connection String**.

#### 2. Backend (Render.com)
1. Sign up at [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repo.
4. **Root Directory:** `backend`
5. **Build Command:** `npm install && npm run build`
6. **Start Command:** `npm start`
7. **Environment Variables:** Add your Database URL from Neon.

#### 3. Frontend (Vercel)
1. Sign up at [Vercel.com](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repo.
4. **Root Directory:** `frontend`
5. **Framework Preset:** Vite
6. **Environment Variables:**
   - `VITE_API_URL`: The URL of your deployed Render Backend.
7. Click **Deploy**.

---

## 💡 Important Notes for Deployment
- **Database Migration:** When you first deploy, your cloud database will be empty. You may need to run your seed script remotely or connect to the cloud DB from your local machine to seed it.
- **CORS:** In your backend `server.ts`, update `cors({ origin: ... })` to allow your new Frontend URL (e.g., `https://your-pharmacy-app.vercel.app`).
