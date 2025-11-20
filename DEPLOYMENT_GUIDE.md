# 🚀 Free Deployment Guide (Vercel + Render + Neon)

Since Railway isn't working, here is the **Best Free Stack** to host your Pharmacy System.

---

## Part 1: The Database (Neon)
We need a place to store data. Neon offers a generous free PostgreSQL tier.

1.  Go to [Neon.tech](https://neon.tech) and Sign Up.
2.  Create a **New Project** (name it `pharmacy-db`).
3.  It will show you a **Connection String**. It looks like this:
    `postgres://neondb_owner:AbC123xyz@ep-cool-frog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`
4.  **Save this string!** You will need to break it down for the Backend:
    -   **DB_HOST**: `ep-cool-frog-123456.us-east-2.aws.neon.tech`
    -   **DB_USERNAME**: `neondb_owner`
    -   **DB_PASSWORD**: `AbC123xyz`
    -   **DB_DATABASE**: `neondb`
    -   **DB_PORT**: `5432`
    -   **DB_SSL**: `true`

---

## Part 2: The Backend (Render)
Render will host your Node.js server.

1.  Go to [Render.com](https://render.com) and Sign Up.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository: `Devamstark/Phamracy-managment`.
4.  **Configure the Service:**
    -   **Name:** `pharmacy-backend`
    -   **Root Directory:** `backend`  <-- IMPORTANT
    -   **Runtime:** Node
    -   **Build Command:** `npm install && npm run build`
    -   **Start Command:** `npm start`
    -   **Instance Type:** Free
5.  **Environment Variables (Click "Advanced"):**
    Add these variables using the data from Neon (Part 1):
    -   `DB_HOST`: (your neon host)
    -   `DB_USERNAME`: (your neon user)
    -   `DB_PASSWORD`: (your neon password)
    -   `DB_DATABASE`: (your neon db name)
    -   `DB_PORT`: `5432`
    -   `DB_SSL`: `true`
    -   `JWT_SECRET`: (create a random long password like `mysecretkey123`)
    -   `CORS_ORIGIN`: `*` (We will change this to your frontend URL later)
6.  Click **Create Web Service**.
7.  Wait for it to deploy. Copy the **URL** (e.g., `https://pharmacy-backend.onrender.com`).

---

## Part 3: The Frontend (Vercel)
Vercel is the best place to host React apps.

1.  Go to [Vercel.com](https://vercel.com) and Sign Up.
2.  Click **Add New...** -> **Project**.
3.  Import `Devamstark/Phamracy-managment`.
4.  **Configure Project:**
    -   **Framework Preset:** Vite
    -   **Root Directory:** Click "Edit" and select `frontend`.
5.  **Environment Variables:**
    -   `VITE_API_URL`: Paste your Render Backend URL here (e.g., `https://pharmacy-backend.onrender.com`).
6.  Click **Deploy**.

---

## Part 4: Final Connection
Once Vercel deploys, you will get a website URL (e.g., `https://pharmacy-frontend.vercel.app`).

1.  Go back to **Render (Backend)**.
2.  Go to **Environment Variables**.
3.  Edit `CORS_ORIGIN` and paste your Vercel URL (e.g., `https://pharmacy-frontend.vercel.app`).
4.  Save changes. Render will restart.

**🎉 Done! Your website is live.**
