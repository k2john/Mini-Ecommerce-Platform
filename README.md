# 🛍️ Bazaar — Mini E-Commerce Platform

A Bazaar — Mini E-Commerce Platform is a simplified online marketplace designed to demonstrate how digital buying and selling works, similar to platforms like Amazon or Shopee. Its importance lies in helping developers and small businesses understand and implement core e-commerce functions such as product listing, shopping carts, and order processing. The main purpose of this platform is to provide a basic system where sellers can offer products, buyers can browse and purchase items, and administrators can manage operations, making it both a practical learning tool and a foundation for building larger online business systems.


> Full-Stack Web Application | ITAS4 (Client-Side) & ITAS5 (Server-Side) Final Project

A complete, production-ready e-commerce platform built with **Angular 17**, **Node.js + Express + TypeScript**, and **Supabase (Postgres + Storage)**.

---

## 🔗 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend (Vercel) | `https://mini-ecommerce-platform-p2si.vercel.app` |
| ⚙️ Backend API (Render) | `https://final-ecommerce-33sd.onrender.com` |
| 📚 API Documentation | `https://final-ecommerce-33sd.onrender.com/api/docs` |

> **Note:** Replace placeholder URLs with your actual deployed URLs after deployment.

---

## 👥 Group Members

| Name | Role |
|------|------|
| Member 1 | Frontend Developer (Angular) |
| Member 2 | Backend Developer (Node.js + TypeScript) |
| Member 3 | UI/UX Designer + Repository Manager |

---

## 🧰 Tech Stack

### Frontend (client/)
| Technology | Purpose |
|-----------|---------|
| Angular 17 | Component-based SPA framework |
| Tailwind CSS 3 | Utility-first responsive styling |
| RxJS | Reactive async data streams |
| Angular Router | SPA routing with route guards |
| Angular Signals | Reactive state management |
| Angular HttpClient | REST API integration |

### Backend (server/)
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| TypeScript | Type-safe backend development |
| Supabase JS | Postgres + Storage access |
| Supabase Postgres | Relational cloud database |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| Swagger/OpenAPI | API documentation |
| Helmet + CORS | Security middleware |
| Morgan + Winston | HTTP logging |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |

---

## ✨ Features Implemented

### 🔐 Authentication & Authorization
- [x] User Registration with validation
- [x] User Login with JWT tokens
- [x] Role-based access control (Admin / User)
- [x] Route guards (authGuard, adminGuard, guestGuard)
- [x] JWT interceptor for automatic token injection
- [x] Auto-logout on token expiry (401 handling)

### 🛒 User Features
- [x] Browse products with search, category filter, price range filter
- [x] Sort products (newest, price, name, rating)
- [x] Pagination (client-side + server-side)
- [x] Product detail page with image gallery
- [x] Add to cart with quantity selection
- [x] Cart management (add, update qty, remove, clear)
- [x] Checkout with shipping address form + payment selection
- [x] Order history with status tracking
- [x] Order detail page with progress tracker

### 🔧 Admin Features
- [x] Admin Dashboard with live statistics
- [x] Revenue, order counts, status breakdown charts
- [x] Product Management (Create, Read, Update, Delete)
- [x] Product image upload via Firebase Storage
- [x] Featured product toggle
- [x] Order Management with inline status update
- [x] Filter orders by status
- [x] View all users

### 🌐 API Features
- [x] RESTful CRUD for products, orders, cart, users
- [x] Supabase integration
- [x] Input validation with express-validator
- [x] CORS, Helmet, rate limiting
- [x] File upload (Multer + Firebase Storage)
- [x] Swagger/OpenAPI docs at `/api/docs`
- [x] Health check endpoint

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Angular CLI: `npm install -g @angular/cli`
- Supabase project with Postgres + Storage enabled

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bazaar-ecommerce.git
cd bazaar-ecommerce
```

### 2. Backend Setup (server/)
```bash
cd server
npm install

# Copy environment file
cp .env.example .env
# Fill in your Supabase credentials and JWT secret in .env

# See detailed setup
# ../SUPABASE_SETUP.md

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

**Backend runs on:** `http://localhost:3000`  
**API Docs:** `http://localhost:3000/api/docs`

### 3. Frontend Setup (client/)
```bash
cd client
npm install

# Update src/environments/environment.ts with your backend URL
# apiUrl: 'http://localhost:3000/api'

# Run development server
ng serve

# Build for production
ng build --configuration production
```

**Frontend runs on:** `http://localhost:4200`

---

## 🔥 Supabase Setup

1. Go to [Supbase](https://supabase.google.com)
2. Create a new project
3. Enable **Supabase Database** 
4. Enable **Storage**
5. Go to **Project Settings → Service Accounts**
6. Click **Generate new private key** — download the JSON
7. Copy the values into your `.env` file:

```env
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_PRIVATE_KEY_ID=...
SUPABASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SUPABASE_CLIENT_EMAIL=supabase-adminsdk-xxx@your-project.iam.gserviceaccount.com
SUPABASE_STORAGE_BUCKET=your-project.appspot.com
```

### Supabase Collections
| Collection | Description |
|-----------|-------------|
| `users` | User accounts with roles |
| `products` | Product catalog |
| `carts` | Per-user cart documents |
| `orders` | Order records |

### Create Admin User
After registering, update your user's `role` field in Supabase to `"admin"`:
```
Supabase → users → {your-user-id} → Edit → role: "admin"
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✅ | Register new user |
| POST | `/api/auth/login` | ✅ | Login user |
| GET | `/api/auth/profile` | ✅ | Get own profile |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/auth/users` | 👑 Admin | List all users |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ✅ | List products (search/filter/paginate) |
| GET | `/api/products/categories` | ✅ | Get all categories |
| GET | `/api/products/featured` | ✅ | Get featured products |
| GET | `/api/products/:id` | ✅ | Get product by ID |
| POST | `/api/products` | 👑 Admin | Create product (multipart/form-data) |
| PUT | `/api/products/:id` | 👑 Admin | Update product |
| DELETE | `/api/products/:id` | 👑 Admin | Delete product |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | ✅ | Get user's cart |
| POST | `/api/cart` | ✅ | Add item to cart |
| PUT | `/api/cart/:productId` | ✅ | Update cart item quantity |
| DELETE | `/api/cart/:productId` | ✅ | Remove item from cart |
| DELETE | `/api/cart` | ✅ | Clear entire cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✅ | Place new order |
| GET | `/api/orders/my` | ✅ | Get own orders |
| GET | `/api/orders/:id` | ✅ | Get order by ID |
| GET | `/api/orders/all` | 👑 Admin | Get all orders |
| GET | `/api/orders/stats` | 👑 Admin | Order statistics |
| PATCH | `/api/orders/:id/status` | 👑 Admin | Update order status |

### Query Parameters (GET /api/products)
```
?page=1&limit=12&search=laptop&category=Electronics&minPrice=10&maxPrice=500&sortBy=price&sortOrder=asc
```

---

## 🚢 Deployment

### Frontend → Vercel
```bash
# Install Vercel CLI
npm install -g vercel

cd client
vercel --prod
```
The `vercel.json` file is already configured for Angular SPA routing.

### Backend → Render
1. Push your code to GitHub
2. Go to [Render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository → select `server/` folder
4. Set **Build Command:** `npm install && npm run build`
5. Set **Start Command:** `npm start`
6. Add all environment variables from `.env`

---

## 📁 Project Structure

```
bazaar-ecommerce/
│
├── client/                          # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/          # authGuard, adminGuard, guestGuard
│   │   │   │   ├── interceptors/    # JWT interceptor
│   │   │   │   └── services/        # AuthService, ProductService, CartService, OrderService
│   │   │   ├── features/
│   │   │   │   ├── auth/            # Login, Register pages
│   │   │   │   ├── products/        # Listing, Details pages
│   │   │   │   ├── cart/            # Cart page
│   │   │   │   ├── checkout/        # Checkout page
│   │   │   │   ├── orders/          # Orders, Order Detail pages
│   │   │   │   └── admin/           # Dashboard, Products Mgmt, Orders Mgmt
│   │   │   └── shared/
│   │   │       └── models/          # TypeScript interfaces
│   │   ├── environments/            # Dev + prod configs
│   │   ├── styles.css               # Tailwind CSS entry
│   │   ├── main.ts                  # Bootstrap
│   │   └── index.html
│   ├── angular.json
│   ├── tailwind.config.js
│   └── vercel.json
│
├── server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── Supabase.ts          # Supabase Admin SDK init
│   │   │   └── swagger.ts           # Swagger/OpenAPI config
│   │   ├── controllers/             # Request handlers
│   │   ├── middleware/              # Auth, error, upload, validation
│   │   ├── routes/                  # Express routers with JSDoc
│   │   ├── services/                # Business logic (Supabase ops)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── utils/                   # Logger, response helpers
│   │   └── index.ts                 # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── screenshots/                     # UI + API testing screenshots
├── .gitignore
└── README.md
```

---

## 📸 Screenshots

> Add screenshots to the `/screenshots` folder and reference them below.

### UI Screenshots
| Page | Screenshot |
|------|-----------|
| Home / Product Listing | `screenshots/product-listing.png` |
| Product Details | `screenshots/product-details.png` |
| Shopping Cart | `screenshots/cart.png` |
| Checkout | `screenshots/checkout.png` |
| My Orders | `screenshots/orders.png` |
| Admin Dashboard | `screenshots/admin-dashboard.png` |
| Admin Products | `screenshots/admin-products.png` |
| Admin Orders | `screenshots/admin-orders.png` |

### API Testing (Postman)
| Endpoint | Screenshot |
|---------|-----------|
| POST /auth/login | `screenshots/api-login.png` |
| GET /products | `screenshots/api-products.png` |
| POST /orders | `screenshots/api-create-order.png` |
| PATCH /orders/:id/status | `screenshots/api-update-status.png` |

---

## 🔒 Security Features

- JWT authentication with expiry
- Password hashing with bcryptjs (12 salt rounds)
- Role-based access control (Admin / User)
- HTTP security headers via Helmet
- Rate limiting (200 req/15min general, 20 req/15min auth)
- CORS whitelist
- Input validation and sanitization via express-validator
- XSS protection via Helmet

---

## 📋 Grading Checklist

### CLIENT-SIDE (ITAS4) ✅
- [x] Component-based architecture (standalone components)
- [x] Angular Routing + Route Guards (auth, admin, guest)
- [x] Reactive Forms with validation (login, register, checkout, product form)
- [x] HTTP Client integration (all API calls)
- [x] RxJS (Observables, operators: tap, catchError, debounceTime, forkJoin)
- [x] Tailwind CSS responsive UI
- [x] Error handling + loading states
- [x] State management via Angular Services + Signals

### SERVER-SIDE (ITAS5) ✅
- [x] RESTful API with full CRUD
- [x] Controllers, Routes, Services architecture
- [x] Middleware: CORS, logging (Morgan/Winston), error handling
- [x] Input validation (express-validator)
- [x] JWT Authentication
- [x] Role-based Authorization (Admin/User)
- [x] Supabase database integration
- [x] File upload (Multer + Firebase Storage)
- [x] Swagger/OpenAPI documentation at `/api/docs`

---

## 📅 Deadline

**2nd Week of May 2026**

---

*Built with ❤️ for ITAS4 & ITAS5 Final Project.*




npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken

token =  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
jwt_refresh_secret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
npm install cors
npm install --save-dev @types/jsonwebtoken
---

## Latest Update (April 26, 2026)

### New Frontend Features
- Added profile page for both users and admins: `/profile` and `/admin/profile`
- Profile supports editing name, email, phone, address, and avatar image upload
- Added product poster display (name + avatar) on listing and product details
- Added ratings and reviews UI on product details (users can submit 1-5 stars and a comment)
- Refreshed storefront UI with a more modern e-commerce style (new header, hero, category strip, card updates)

### New Backend Features
- `PUT /api/auth/profile` now supports `multipart/form-data` avatar upload (`avatar` field)
- Product create/update now supports multiple images (`image` as cover + `images` as gallery)
- Products now store poster user ID via `created_by`
- Added review APIs:
  - `GET /api/products/:id/reviews`
  - `POST /api/products/:id/reviews` (auth required)
- Product rating aggregates now refresh automatically after review submit/update

### SQL Migration Required
Run this SQL migration in Supabase SQL Editor:

- `server/supabase/migrations/20260426_profile_and_reviews.sql`

This migration adds:
- `products.created_by`
- `product_reviews` table (rating + comment, one review per user per product)
- indexes and `updated_at` trigger support for reviews

### Notes
- Existing APIs continue to work; new features are additive.
- Admin product management now requests inactive products too, so hidden/inactive items remain manageable from admin.

### CRUD Reliability Fixes (April 26, 2026)
- Fixed product image mapping in backend cart/order flows (`image_url` to `imageUrl`) to prevent broken item payloads during create/read/update operations.
- Hardened product delete flow:
  - Deletes linked `product_reviews` first.
  - Falls back to soft delete (`active = false`) if hard delete is blocked by DB constraints.
- Verified both server and client builds compile after fixes.
