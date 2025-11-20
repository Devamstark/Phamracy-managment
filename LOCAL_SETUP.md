# Local Development Setup Guide (Without Docker)

Since Docker is not installed, follow these steps to run the pharmacy system locally:

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL 15+** - [Download here](https://www.postgresql.org/download/windows/)

## Step 1: Install PostgreSQL

1. Download and install PostgreSQL for Windows
2. During installation, set the password for the `postgres` user (remember this!)
3. Keep the default port `5432`
4. After installation, open **pgAdmin** or **SQL Shell (psql)**

## Step 2: Create Database

Open SQL Shell (psql) or pgAdmin and run:

```sql
CREATE DATABASE pharmacy_erx;
CREATE USER pharmacy_user WITH PASSWORD 'pharmacy_password';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_erx TO pharmacy_user;
```

Or use these simplified commands in psql:
```bash
# Login as postgres user
psql -U postgres

# Then run:
CREATE DATABASE pharmacy_erx;
\q
```

## Step 3: Setup Backend

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
Copy-Item .env.example .env

# Edit .env file with your database credentials
# Open .env in notepad and update if needed:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=pharmacy_user (or postgres)
# DB_PASSWORD=pharmacy_password (or your postgres password)
# DB_DATABASE=pharmacy_erx
# DB_SYNCHRONIZE=true

# Run database migrations (TypeORM will create tables automatically with DB_SYNCHRONIZE=true)
# Or manually run:
npm run typeorm schema:sync

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

Backend will run at: **http://localhost:5000**

## Step 4: Setup Frontend

Open a **new terminal window**:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

Frontend will run at: **http://localhost:3000**

## Step 5: Access the Application

1. Open your browser and go to: **http://localhost:3000**
2. Login with demo credentials:
   - **Admin**: username=`admin`, password=`admin123`
   - **Pharmacist**: username=`pharmacist`, password=`pharmacist123`
   - **Cashier**: username=`cashier`, password=`cashier123`

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. **Check PostgreSQL is running**:
   ```powershell
   # Open Services (services.msc) and look for "postgresql-x64-15"
   # Make sure it's running
   ```

2. **Verify credentials**:
   - Open `backend/.env`
   - Make sure `DB_USERNAME` and `DB_PASSWORD` match your PostgreSQL setup
   - If you used the default `postgres` user, update the .env:
     ```
     DB_USERNAME=postgres
     DB_PASSWORD=your_postgres_password
     ```

3. **Test connection**:
   ```powershell
   psql -U postgres -d pharmacy_erx
   # If this works, your database is accessible
   ```

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend (port 5000)**:
- Edit `backend/.env` and change `PORT=5000` to `PORT=5001`
- Update `frontend/vite.config.ts` proxy target to `http://localhost:5001`

**Frontend (port 3000)**:
- Edit `frontend/vite.config.ts` and change `port: 3000` to `port: 3001`

### Module Not Found Errors

```powershell
# Delete node_modules and reinstall
cd backend
Remove-Item -Recurse -Force node_modules
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## Alternative: Install Docker Desktop

If you prefer to use Docker:

1. **Download Docker Desktop for Windows**: https://www.docker.com/products/docker-desktop/
2. **Install** and restart your computer
3. **Start Docker Desktop**
4. **Run the application**:
   ```powershell
   # Use the new docker compose command (no hyphen)
   docker compose up -d
   
   # Seed the database
   docker exec -it pharmacy-backend npm run seed
   ```

## Next Steps

Once the application is running:

1. ✅ Login with demo credentials
2. ✅ Explore the dashboard
3. ✅ View medicines inventory
4. ✅ Check prescriptions
5. ✅ Try creating a sale in the Dispense page
6. ✅ View sales history

## Need Help?

Common issues:
- **"Cannot connect to database"** → Check PostgreSQL is running and credentials in .env
- **"Port already in use"** → Change ports in configuration files
- **"Module not found"** → Run `npm install` again
- **"Migration failed"** → Set `DB_SYNCHRONIZE=true` in .env for development
