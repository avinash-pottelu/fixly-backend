# 🔧 Fixly Backend — Complete API Documentation

**Version:** 1.0.0  
**Base URL:** `https://your-app.onrender.com/api`  
**Auth:** Bearer JWT token in `Authorization` header

---

## 📁 Folder Structure

```
fixly-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Default data seeder
├── src/
│   ├── config/
│   │   ├── constants.js       # App constants
│   │   └── database.js        # Prisma client singleton
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── professional.controller.js
│   │   ├── service.controller.js
│   │   ├── booking.controller.js
│   │   ├── review.controller.js
│   │   ├── admin.controller.js
│   │   └── search.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT auth + RBAC
│   │   ├── error.middleware.js  # Global error handler
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── professional.routes.js
│   │   ├── service.routes.js
│   │   ├── booking.routes.js
│   │   ├── review.routes.js
│   │   ├── admin.routes.js
│   │   └── search.routes.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── booking.validator.js
│   │   └── review.validator.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js
│   │   └── pagination.js
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔑 Authentication

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

## 📡 API Endpoints

### ── AUTH MODULE ──────────────────────────────────

| Method | Endpoint                          | Auth | Role     | Description                    |
|--------|-----------------------------------|------|----------|--------------------------------|
| POST   | /api/auth/register/customer       | ❌   | –        | Register a new customer        |
| POST   | /api/auth/register/professional   | ❌   | –        | Register a new professional    |
| POST   | /api/auth/login                   | ❌   | –        | Login (all roles)              |
| GET    | /api/auth/me                      | ✅   | Any      | Get authenticated user profile |

#### POST /api/auth/register/customer
```json
{
  "full_name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "+91-9876543210",
  "password": "Secure@123"
}
```

#### POST /api/auth/register/professional
```json
{
  "full_name": "Suresh Electrician",
  "email": "suresh@example.com",
  "phone": "+91-9876543210",
  "password": "Secure@123",
  "service_category": "ELECTRICIAN",
  "experience": 5,
  "pricing": 500.00,
  "location": "Koramangala, Bangalore",
  "city": "Bangalore",
  "state": "Karnataka",
  "bio": "Expert electrician with 5 years experience."
}
```

#### POST /api/auth/login
```json
{
  "email": "ravi@example.com",
  "password": "Secure@123"
}
```

---

### ── USER MODULE ──────────────────────────────────

| Method | Endpoint                    | Auth | Role     | Description           |
|--------|-----------------------------|------|----------|-----------------------|
| GET    | /api/users/profile          | ✅   | Any      | Get own profile       |
| PATCH  | /api/users/profile          | ✅   | Any      | Update own profile    |
| PATCH  | /api/users/change-password  | ✅   | Any      | Change password       |
| DELETE | /api/users/account          | ✅   | Any      | Delete own account    |

#### PATCH /api/users/profile
```json
{
  "full_name": "Ravi Kumar Updated",
  "phone": "+91-9876500000"
}
```

#### PATCH /api/users/change-password
```json
{
  "current_password": "Secure@123",
  "new_password": "NewSecure@456"
}
```

---

### ── PROFESSIONAL MODULE ──────────────────────────

| Method | Endpoint                          | Auth | Role         | Description                    |
|--------|-----------------------------------|------|--------------|--------------------------------|
| GET    | /api/professionals                | ❌   | –            | Get all approved professionals |
| GET    | /api/professionals/:id            | ❌   | –            | Get professional by ID         |
| GET    | /api/professionals/me/profile     | ✅   | PROFESSIONAL | Get own professional profile   |
| PATCH  | /api/professionals/me/profile     | ✅   | PROFESSIONAL | Update own professional profile|
| PATCH  | /api/professionals/me/availability| ✅   | PROFESSIONAL | Toggle availability            |
| GET    | /api/professionals/me/bookings    | ✅   | PROFESSIONAL | Get own bookings               |

#### GET /api/professionals?category=ELECTRICIAN&city=Bangalore&min_rating=4
Query params: `category`, `city`, `min_rating`, `is_available`, `page`, `limit`

#### PATCH /api/professionals/me/profile
```json
{
  "experience": 7,
  "pricing": 650.00,
  "city": "Hyderabad",
  "bio": "Updated bio.",
  "profile_image": "https://cdn.example.com/image.jpg"
}
```

#### PATCH /api/professionals/me/availability
```json
{ "is_available": false }
```

---

### ── SERVICES MODULE ──────────────────────────────

| Method | Endpoint              | Auth | Role   | Description         |
|--------|-----------------------|------|--------|---------------------|
| GET    | /api/services         | ❌   | –      | Get all services    |
| GET    | /api/services/:id     | ❌   | –      | Get service by ID   |
| POST   | /api/services         | ✅   | ADMIN  | Create new service  |
| PATCH  | /api/services/:id     | ✅   | ADMIN  | Update service      |
| DELETE | /api/services/:id     | ✅   | ADMIN  | Delete service      |

**Default Categories:**
`ELECTRICIAN | PLUMBER | CARPENTER | PAINTER | CLEANER | AC_REPAIR | APPLIANCE_REPAIR | HOME_MAINTENANCE`

---

### ── BOOKING MODULE ───────────────────────────────

| Method | Endpoint                    | Auth | Role         | Description                  |
|--------|-----------------------------|------|--------------|------------------------------|
| POST   | /api/bookings               | ✅   | CUSTOMER     | Create booking               |
| GET    | /api/bookings               | ✅   | CUSTOMER     | Get my bookings              |
| GET    | /api/bookings/:id           | ✅   | Any (owner)  | Get booking by ID            |
| PATCH  | /api/bookings/:id/cancel    | ✅   | CUSTOMER     | Cancel booking               |
| PATCH  | /api/bookings/:id/accept    | ✅   | PROFESSIONAL | Accept booking               |
| PATCH  | /api/bookings/:id/reject    | ✅   | PROFESSIONAL | Reject booking               |
| PATCH  | /api/bookings/:id/complete  | ✅   | PROFESSIONAL | Mark booking as completed    |

#### POST /api/bookings
```json
{
  "professional_id": "uuid-here",
  "service_id": "uuid-here",
  "booking_date": "2024-12-25",
  "booking_time": "10:00",
  "address": "Flat 4B, Brigade Road, Bangalore 560001",
  "notes": "Please bring all tools."
}
```

**Booking Status Flow:**
```
PENDING → ACCEPTED → COMPLETED
       ↘ REJECTED
PENDING/ACCEPTED → CANCELLED (by customer)
```

---

### ── REVIEWS MODULE ───────────────────────────────

| Method | Endpoint                                  | Auth | Role     | Description                        |
|--------|-------------------------------------------|------|----------|------------------------------------|
| GET    | /api/reviews/professional/:professional_id| ❌   | –        | Get reviews for a professional     |
| POST   | /api/reviews/booking/:booking_id          | ✅   | CUSTOMER | Create review (after completion)   |
| PATCH  | /api/reviews/:id                          | ✅   | CUSTOMER | Update own review                  |
| DELETE | /api/reviews/:id                          | ✅   | Any owner| Delete review                      |

#### POST /api/reviews/booking/:booking_id
```json
{
  "rating": 5,
  "review_text": "Excellent work! Very professional and on time."
}
```

---

### ── ADMIN MODULE ─────────────────────────────────

| Method | Endpoint                               | Auth | Role  | Description                    |
|--------|----------------------------------------|------|-------|--------------------------------|
| GET    | /api/admin/dashboard                   | ✅   | ADMIN | Dashboard statistics           |
| GET    | /api/admin/users                       | ✅   | ADMIN | Get all users                  |
| DELETE | /api/admin/users/:id                   | ✅   | ADMIN | Delete user                    |
| GET    | /api/admin/professionals/pending       | ✅   | ADMIN | Get pending professionals      |
| PATCH  | /api/admin/professionals/:id/approve   | ✅   | ADMIN | Approve professional           |
| PATCH  | /api/admin/professionals/:id/reject    | ✅   | ADMIN | Reject professional            |
| GET    | /api/admin/bookings                    | ✅   | ADMIN | Get all bookings               |

#### GET /api/admin/dashboard — Response
```json
{
  "users": { "total_customers": 120 },
  "professionals": { "total": 45, "pending_approvals": 8 },
  "services": { "total": 8 },
  "bookings": {
    "total": 320,
    "completed": 280,
    "pending": 15,
    "cancelled": 25
  }
}
```

---

### ── SEARCH MODULE ────────────────────────────────

| Method | Endpoint                       | Auth | Role | Description              |
|--------|--------------------------------|------|------|--------------------------|
| GET    | /api/search/professionals      | ❌   | –    | Search professionals     |
| GET    | /api/search/suggestions        | ❌   | –    | Get search suggestions   |

#### GET /api/search/professionals
```
?q=bangalore
&category=PLUMBER
&city=Bangalore
&state=Karnataka
&min_rating=4
&min_price=200
&max_price=1000
&sort_by=rating         (rating | price_asc | price_desc | experience | newest)
&page=1
&limit=10
```

#### GET /api/search/suggestions?q=ban
```json
{
  "cities": ["Bangalore", "Bannerghatta"],
  "categories": [{ "name": "Plumber", "category": "PLUMBER" }]
}
```

---

## 📊 Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": { ... }
}
```

### Paginated
```json
{
  "success": true,
  "message": "Professionals fetched.",
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "Valid email is required." }
  ]
}
```

---

## 🗄️ Database Schema (Quick Reference)

```
users            → id, full_name, email, phone, password, role, timestamps
professionals    → id, user_id(FK), service_category, experience, pricing,
                   location, city, state, bio, profile_image,
                   verification_status, is_available, rating, total_reviews
services         → id, name, category, description, icon, is_active
bookings         → id, customer_id(FK), professional_id(FK), service_id(FK),
                   booking_date, booking_time, address, notes, total_amount, status
reviews          → id, booking_id(FK), professional_id(FK), customer_name,
                   rating, review_text
```

---

## 🚀 Deployment on Render

### Step 1 — Create PostgreSQL Database
1. Go to [render.com](https://render.com) → New → PostgreSQL
2. Name: `fixly-db`
3. Select free tier → Create
4. Copy the **External Database URL**

### Step 2 — Create Web Service
1. New → Web Service → Connect your GitHub repo
2. Configure:
   - **Name:** `fixly-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js`
   - **Start Command:** `npm start`

### Step 3 — Set Environment Variables
In Render dashboard → Environment tab, add:

```
DATABASE_URL        = <your-render-postgres-url>
JWT_SECRET          = <strong-random-64-char-string>
JWT_EXPIRES_IN      = 7d
BCRYPT_SALT_ROUNDS  = 12
NODE_ENV            = production
PORT                = 10000
CORS_ORIGIN         = https://your-frontend.vercel.app
ADMIN_DEFAULT_PASSWORD = YourStrongAdminPassword@2024
```

### Step 4 — Deploy
Push to GitHub → Render auto-deploys.

---

## 🏃 Local Development Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd fixly-backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js

# 4. Start dev server
npm run dev
```

### Local PostgreSQL Quick Setup
```sql
-- In psql or pgAdmin:
CREATE DATABASE fixly_db;
CREATE USER fixly_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE fixly_db TO fixly_user;
```

Then set in `.env`:
```
DATABASE_URL="postgresql://fixly_user:yourpassword@localhost:5432/fixly_db?schema=public"
```

---

## 🔐 Default Admin Credentials
```
Email:    admin@fixly.com
Password: Admin@Fixly2024  ← Change immediately after first login!
```

---

## 🛡️ Security Features
- Helmet.js security headers
- Rate limiting (200 req/15min global, 10 req/15min on auth)
- Input validation on all endpoints
- Bcrypt password hashing (12 rounds)
- JWT expiry (7 days)
- Role-based access control (CUSTOMER / PROFESSIONAL / ADMIN)
- Prisma parameterized queries (SQL injection protection)
- CORS whitelist

---

## 📦 Useful Scripts

```bash
npm run dev           # Start with nodemon (hot reload)
npm start             # Production start
npm run db:generate   # Regenerate Prisma client
npm run db:migrate    # Run migrations (dev)
npm run db:migrate:prod # Run migrations (production)
npm run db:seed       # Seed default data
npm run db:studio     # Open Prisma Studio (visual DB browser)
npm run db:reset      # Reset database (dev only!)
```
