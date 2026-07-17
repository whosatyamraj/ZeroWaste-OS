<div align="center">

# 🌱 ZeroWaste OS

### AI-Powered Food Lifecycle Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

**Minimize food waste across the entire food lifecycle using AI, Computer Vision, Predictive Analytics, and Intelligent Decision-Making.**

[Getting Started](#-getting-started) · [Architecture](#-architecture) · [Features](#-features) · [API Docs](#-api-documentation) · [Deployment](#-deployment)

</div>

---

## 🎯 Vision

ZeroWaste OS is an autonomous AI operating system designed for restaurants, hotels, cafeterias, cloud kitchens, hostels, corporate canteens, banquet halls, and food businesses. It doesn't merely redistribute leftover food — it intelligently **prevents**, **optimizes**, **analyzes**, and **manages** food waste from preparation to final disposal.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ZeroWaste OS                          │
├──────────────┬──────────────────┬───────────────────────┤
│   Frontend   │     Backend      │    AI Microservice    │
│  React 19    │  Express + TS    │   Python FastAPI      │
│  Vite + TS   │  MongoDB Compass │   ML/AI Models        │
│  Tailwind    │  Socket.io       │   Gemini Vision       │
│  Redux       │  JWT Auth        │   XGBoost/Prophet     │
├──────────────┴──────────────────┴───────────────────────┤
│                    MongoDB Compass                       │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Shadcn UI, Redux Toolkit, React Router DOM, TanStack Query, Framer Motion, Recharts, Socket.io Client |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB/Mongoose, JWT, Bcrypt, Multer, Cloudinary, Nodemailer, Socket.io, Helmet, Swagger |
| **AI Service** | Python, FastAPI, Scikit-Learn, XGBoost, Pandas, NumPy, Google Gemini API |
| **DevOps** | Docker, Docker Compose |

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based auth with access + refresh tokens
- Role-Based Access Control (5 roles)
- Email verification & password reset
- Account lockout protection
- Google OAuth (placeholder)

### 📊 AI-Powered Demand Forecasting
- Historical sales analysis
- Weather, holidays, festivals, events integration
- Expected customers & recommended quantities
- Interactive forecast charts

### 🍳 Real-Time Kitchen Intelligence
- Live order monitoring via Socket.io
- Inventory tracking
- Food production dashboard
- Real-time alerts

### 🔍 Surplus Food Detection
- Image upload with Cloudinary storage
- Preparation & expiry time tracking
- Automated safety classification

### 🛡 Food Safety AI
- Google Gemini Vision analysis
- Safe / Consume Soon / Unsafe classification
- Confidence scores & explanations
- Shelf-life estimation

### 🤖 AI Decision Engine (Core Innovation)
- Autonomous action determination for surplus food
- 5 possible actions: Discount Sale, NGO Donation, Repurposing, Animal Feed, Composting
- Multi-criteria weighted decisions
- Confidence scoring with reasoning

### 🛒 Smart Surplus Marketplace
- Discounted surplus food listings
- Search, filters, geolocation
- Cart & checkout flow
- Order history

### 🤝 NGO Redistribution Portal
- Available donation browsing
- Accept/reject workflow
- Pickup scheduling
- Delivery tracking

### 🚗 Volunteer Module
- Pickup task management
- Route information
- Delivery completion tracking

### 📦 Inventory Intelligence
- Ingredient & stock tracking
- Expiry date monitoring
- Shortage predictions
- Purchase recommendations

### 🌍 Sustainability Dashboard
- Food Saved, Meals Rescued, CO₂ Reduced
- Water Conserved metrics
- Waste trend analysis
- Interactive Recharts visualizations

### 💡 AI Insights Engine
- Pattern recognition
- Natural language insights
- Actionable recommendations

### 👨‍💼 Admin Panel
- User management
- NGO verification
- Platform analytics
- Report management

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full platform management, analytics, user control |
| **Food Business Owner** | Dashboard, inventory, marketplace, surplus management |
| **NGO Partner** | Donation portal, pickup scheduling, delivery tracking |
| **Volunteer** | Task acceptance, route tracking, delivery completion |
| **Customer** | Marketplace browsing, ordering, order history |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB Atlas** account (or local MongoDB)
- **Docker** (optional, for containerized deployment)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/zerowaste-os.git
cd zerowaste-os
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start development server:
```bash
npm run dev
```

#### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (see `.env.example` for all variables):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Start development server:
```bash
npm run dev
```

#### 4. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:
```env
ENVIRONMENT=development
GEMINI_API_KEY=your-gemini-api-key
BACKEND_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:5000
```

Start development server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up --build -d

# Stop all services
docker-compose down
```

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **AI Service Docs**: `http://localhost:8000/docs`

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/food-items` | List surplus food items |
| POST | `/api/food-items` | Create food item listing |
| GET | `/api/marketplace` | Browse marketplace |
| POST | `/api/marketplace/orders` | Create order |
| GET | `/api/donations` | List available donations |
| POST | `/api/donations/:id/accept` | Accept donation |
| GET | `/api/analytics/sustainability` | Sustainability metrics |
| POST | `/api/ai/demand-forecast` | AI demand forecast |
| POST | `/api/ai/food-safety` | AI food safety analysis |
| POST | `/api/ai/decide-action` | AI decision engine |

---

## 🔒 Security

ZeroWaste OS implements comprehensive security measures:

- ✅ All secrets in `.env` files (never committed)
- ✅ Rate limiting on all endpoints (auth: 5/15min, API: 60/min)
- ✅ Server-side input validation with Zod & Pydantic
- ✅ bcrypt (cost 12) for password hashing
- ✅ JWT with short expiry (15min access, 7d refresh)
- ✅ Refresh tokens in httpOnly secure cookies
- ✅ Helmet security headers (CSP, HSTS, X-Frame-Options)
- ✅ CORS whitelist (no wildcards in production)
- ✅ File upload validation (MIME, extension, size, UUID rename)
- ✅ Generic error messages to client
- ✅ XSS prevention (no dangerouslySetInnerHTML)
- ✅ AI/LLM input sanitization and token budgets
- ✅ Account lockout after failed attempts

---

## 🚢 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://zerowaste-os.vercel.app` |
| Backend | Render | `https://zerowaste-api.onrender.com` |
| AI Service | Render | `https://zerowaste-ai.onrender.com` |
| Database | MongoDB Atlas | Cloud-hosted |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ to save food, reduce waste, and feed communities.**

</div>
