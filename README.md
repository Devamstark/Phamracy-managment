# Pharmacy Inventory & E-Prescription Management System

A complete, production-ready pharmacy management system compliant with Indian regulations (ABDM/NDHM, Schedule H/H1/X). Built with modern technologies and designed for efficiency, security, and compliance.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5+-blue.svg)

## 🎯 Features

### Core Functionality
- **📦 Inventory Management**: Complete medicine catalog with batch tracking, expiry monitoring, and FIFO stock management
- **💊 E-Prescription Processing**: FHIR R4 compliant prescription parsing (ABDM/NDHM standard)
- **🏥 Compliance Engine**: Automated enforcement of Schedule H, H1, and X regulations
- **💰 Billing & GST**: Automated GST calculation, invoice generation, and payment tracking
- **👨‍⚕️ Doctor Verification**: Registration number validation for medical practitioners
- **📊 Dashboard & Analytics**: Real-time insights, low stock alerts, expiry warnings
- **🔐 Role-Based Access Control**: Admin, Pharmacist, and Cashier roles
- **📝 Audit Logging**: Complete audit trail for compliance and accountability

### Indian Compliance
- ✅ Schedule H/H1/X medicine classification
- ✅ Prescription retention requirements
- ✅ Doctor registration validation (MCI/State Medical Council)
- ✅ GST calculation with HSN codes
- ✅ ABDM/NDHM FHIR R4 bundle support
- ✅ Controlled substance quantity limits

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Charts**: Recharts

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Admin**: PgAdmin
- **Reverse Proxy**: Nginx (for frontend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- Git

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd pharmacy-inventory-eRx
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PgAdmin: http://localhost:5050 (admin@pharmacy.com / admin123)

4. **Seed the database** (first time only)
```bash
docker exec -it pharmacy-backend npm run seed
```

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start PostgreSQL** (if not using Docker)
```bash
# Make sure PostgreSQL is running on port 5432
```

5. **Run database migrations**
```bash
npm run migration:run
```

6. **Seed the database**
```bash
npm run seed
```

7. **Start development server**
```bash
npm run dev
```

Backend will be running at http://localhost:5000

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend will be running at http://localhost:3000

## 👤 Default Credentials

After seeding the database, use these credentials to login:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Pharmacist | pharmacist | pharmacist123 |
| Cashier | cashier | cashier123 |

## 📚 API Documentation

Once the backend is running, access the Swagger API documentation at:
```
http://localhost:5000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile

#### Inventory
- `GET /api/inventory/medicines` - List all medicines
- `POST /api/inventory/medicines` - Add new medicine
- `POST /api/inventory/batches` - Add new batch
- `GET /api/inventory/alerts/low-stock` - Get low stock alerts
- `GET /api/inventory/alerts/expiry` - Get expiry alerts

#### Prescriptions
- `POST /api/prescriptions/upload` - Upload FHIR prescription bundle
- `GET /api/prescriptions` - List prescriptions
- `GET /api/prescriptions/:id` - Get prescription details
- `POST /api/prescriptions/verify-doctor` - Verify doctor credentials

#### Sales
- `POST /api/sales` - Create new sale
- `GET /api/sales` - List sales
- `GET /api/sales/reports/summary` - Get sales report

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (10 rounds)
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation on all endpoints
- SQL injection protection via TypeORM
- XSS protection

## 📋 FHIR Integration

### Sample FHIR Bundle

The system accepts FHIR R4 bundles in the following format:

```json
{
  "resourceType": "Bundle",
  "type": "document",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "identifier": [{"system": "https://healthid.ndhm.gov.in", "value": "1234-5678-9012"}],
        "name": [{"text": "Patient Name"}]
      }
    },
    {
      "resource": {
        "resourceType": "Practitioner",
        "identifier": [{"system": "https://nmc.org.in", "value": "MH/12345"}],
        "name": [{"text": "Dr. Doctor Name"}]
      }
    },
    {
      "resource": {
        "resourceType": "MedicationRequest",
        "medicationCodeableConcept": {"text": "Medicine Name"},
        "dosageInstruction": [{"text": "Dosage instructions"}]
      }
    }
  ]
}
```

## 🗄️ Database Schema

The system uses the following main entities:

- **Users**: Authentication and role management
- **Medicines**: Medicine master data with schedule classification
- **Batches**: Stock batches with expiry tracking
- **Prescriptions**: E-prescription storage with FHIR bundles
- **Sales**: Billing and transaction records
- **SaleItems**: Line items for each sale
- **AuditLogs**: Complete audit trail

## 🎨 UI/UX Features

- Modern glassmorphism design
- Responsive layout (mobile, tablet, desktop)
- Dark mode ready color palette
- Smooth animations and transitions
- Accessible components
- Loading states and error handling
- Toast notifications

## 📦 Project Structure

```
pharmacy-inventory-eRx/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── models/          # TypeORM entities
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, RBAC, error handling
│   │   ├── utils/           # Helpers and validators
│   │   ├── seeds/           # Database seeding
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Environment Variables

Ensure all production environment variables are properly set:
- Change JWT secrets to strong random values
- Update database credentials
- Configure CORS origins
- Set NODE_ENV=production

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: support@pharmacy-erx.com

## 🙏 Acknowledgments

- ABDM/NDHM for FHIR standards
- Indian Pharmacy regulations compliance
- Open source community

---

**Built with ❤️ for Indian Pharmacies**
