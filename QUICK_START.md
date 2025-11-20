# 🚀 Quick Start Guide - Pharmacy eRx System

## Current Status: Prerequisites Needed

Your system is missing the required software to run this application. Here's what you need:

## Option 1: Install Node.js (Recommended for Development)

### Step 1: Install Node.js
1. **Download Node.js**: https://nodejs.org/
2. Choose **LTS version** (Long Term Support)
3. Run the installer
4. **Important**: Check the box "Automatically install necessary tools"
5. Restart your terminal/PowerShell after installation

### Step 2: Verify Installation
```powershell
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Step 3: Install PostgreSQL
1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` user (remember this!)
4. Keep default port `5432`

### Step 4: Run the Application
```powershell
# Backend
cd backend
npm install
npm run seed
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Access at: **http://localhost:3000**

---

## Option 2: Install Docker Desktop (Easiest - Recommended)

### Step 1: Install Docker Desktop
1. **Download**: https://www.docker.com/products/docker-desktop/
2. Install Docker Desktop for Windows
3. **Restart your computer**
4. Start Docker Desktop (wait for it to fully start)

### Step 2: Run the Application
```powershell
# Navigate to project folder
cd C:\Users\Admin\Downloads\pharmacy-inventory-eRx

# Start all services (note: no hyphen in 'docker compose')
docker compose up -d

# Wait for containers to start, then seed the database
docker exec -it pharmacy-backend npm run seed
```

Access at: **http://localhost:3000**

---

## What to Do Next?

**Choose ONE option above:**

1. **For Development/Learning**: Install Node.js + PostgreSQL (Option 1)
   - Pros: Can modify code and see changes instantly
   - Cons: More setup steps

2. **For Quick Demo**: Install Docker Desktop (Option 2)
   - Pros: One command to run everything
   - Cons: Larger download (~500MB)

---

## Login Credentials (After Setup)

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Pharmacist | pharmacist | pharmacist123 |
| Cashier | cashier | cashier123 |

---

## What You'll Get

✅ Complete pharmacy inventory system
✅ E-prescription management (FHIR/ABDM compliant)
✅ Indian compliance (Schedule H/H1/X)
✅ Billing with GST calculation
✅ Dashboard with alerts
✅ Modern, responsive UI

---

## Need Help?

After installing the prerequisites, let me know and I can guide you through the setup process step by step!
