# 🏠 StayFinder — Full-Stack MERN Airbnb Clone

A full-featured Airbnb-like platform built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This project demonstrates complete full-stack architecture including authentication, CRUD operations, booking logic, image uploads, search/filtering, reviews, and a user dashboard.

---
# 🏠 StayFinder — Full-Stack MERN Airbnb Clone

A full-featured Airbnb-like platform built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This project demonstrates complete full-stack architecture including authentication, CRUD operations, booking logic, image uploads, search/filtering, reviews, and a user dashboard.

## 🏗️ Architecture Overview
<img width="3238" height="596" alt="Rental System" src="https://github.com/user-attachments/assets/0f5e404e-fd5a-41d5-8116-8dcccc6ac759" />

## ✨ Features

### Authentication
- JWT-based register/login/logout
- Protected routes on both frontend and backend
- Token stored in localStorage, auto-attached to all API requests

### Property Listings
- Create, read, update, delete listings
- Multi-image upload (local storage via Multer)
- Property types: Apartment, House, Villa, Cabin, Condo, Studio
- 18 amenity options with icons
- Full location data with optional map coordinates

### Booking System
- Date range selection with availability validation
- **Overlap prevention** — server-side query blocks double-bookings
- Nights, subtotal, and service fee calculation
- Special requests field
- Cancel bookings (guest or host)

### Search & Filters
- Full-text search (title, description, city, country)
- Filter by: city, country, price range, property type, guest count
- Availability filter (excludes booked-out dates)
- Pagination

### Dashboard
- **Overview** — stats, upcoming trips, revenue
- **My Bookings** — trips with status badges, cancel, review
- **My Listings** — manage, edit, delete
- **Hosting** — view all guest bookings, revenue total
- **Reviews** — write reviews after checkout

### Reviews & Ratings
- One review per completed booking
- Auto-updates listing average rating (via Mongoose post-save hook)
- Star rating picker in dashboard

### Map View
- OpenStreetMap embed for listings with lat/lng coordinates

---

## 🗂️ Project Structure

```
stayfinder-mern/
├── package.json              ← root scripts (concurrently)
│
├── server/                   ← Express + Node.js API
│   ├── index.js              ← entry point
│   ├── seed.js               ← demo data seeder
│   ├── .env.example
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js           ← JWT protect / optionalAuth
│   │   └── upload.js         ← Multer config
│   └── uploads/              ← image storage (gitignored)
│
└── client/                   ← React frontend
    └── src/
        ├── App.js            ← routing
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   ├── api.js        ← axios instance
        │   └── helpers.js    ← formatters, constants
        ├── components/
        │   ├── Navbar.js/css
        │   ├── Footer.js/css
        │   └── ListingCard.js/css
        └── pages/
            ├── HomePage.js/css
            ├── SearchPage.js/css
            ├── ListingDetailPage.js/css
            ├── BookingPage.js/css
            ├── CreateListingPage.js/css
            ├── EditListingPage.js
            ├── DashboardPage.js/css
            └── LoginPage.js / RegisterPage.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas (cloud)

### 1. Clone / Download

```bash
cd stayfinder-mern
```

### 2. Install dependencies

```bash
# Install root devDependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

Or use the shortcut:
```bash
npm run install-all
```

### 3. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/airbnb-mern
JWT_SECRET=your_super_secret_key_change_me
NODE_ENV=development
```

### 4. Seed the database (optional but recommended)

```bash
cd server
node seed.js
```

This creates:
- **Host account**: `demo@stayfinder.com` / `demo123`
- **Guest account**: `bob@example.com` / `password123`
- 6 sample listings with real photos
- 1 sample booking

### 5. Run the app

From the root directory:
```bash
npm run dev
```

This runs both server (port 5000) and client (port 3000) concurrently.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |

### Listings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/listings` | No | Get all (with filters) |
| GET | `/api/listings/:id` | No | Get single listing |
| GET | `/api/listings/my-listings` | Yes | Owner's listings |
| GET | `/api/listings/:id/booked-dates` | No | Unavailable dates |
| POST | `/api/listings` | Yes | Create listing |
| PUT | `/api/listings/:id` | Yes (owner) | Update listing |
| DELETE | `/api/listings/:id` | Yes (owner) | Delete listing |

**Query params for GET /api/listings:**
`search`, `city`, `country`, `minPrice`, `maxPrice`, `propertyType`, `guests`, `checkIn`, `checkOut`, `page`, `limit`

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Yes | Create booking |
| GET | `/api/bookings/my-bookings` | Yes | Guest's bookings |
| GET | `/api/bookings/host-bookings` | Yes | Host's bookings |
| GET | `/api/bookings/:id` | Yes | Single booking |
| PUT | `/api/bookings/:id/cancel` | Yes | Cancel booking |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/listing/:id` | No | Reviews for listing |
| POST | `/api/reviews` | Yes | Create review |
| DELETE | `/api/reviews/:id` | Yes (author) | Delete review |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | No | Public profile |
| PUT | `/api/users/profile` | Yes | Update profile |
| PUT | `/api/users/change-password` | Yes | Change password |

---

## 🗃️ Database Models

### User
```
name, email, password (hashed), avatar, bio, phone, isHost
```

### Listing
```
title, description, price, location{address,city,state,country,coordinates},
images[], amenities[], propertyType, maxGuests, bedrooms, beds, bathrooms,
host(ref), isAvailable, averageRating, reviewCount
```

### Booking
```
listing(ref), guest(ref), host(ref), checkIn, checkOut,
guests, totalPrice, pricePerNight, nights, status, specialRequests
```

### Review
```
listing(ref), author(ref), booking(ref), rating(1-5), comment
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Styling | Plain CSS with CSS variables |
| State | React Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer (local disk) |
| Toasts | react-hot-toast |
| Map | OpenStreetMap embed |
| Dev Tools | nodemon, concurrently |

---

## 🔧 Extending the Project

**Add Cloudinary for image storage:**
1. `npm install cloudinary multer-storage-cloudinary`
2. Replace `multer.diskStorage` in `middleware/upload.js` with `CloudinaryStorage`

**Add email notifications:**
1. `npm install nodemailer`
2. Send booking confirmations from `bookingController.js`

**Add Stripe payments:**
1. `npm install stripe`
2. Create `/api/payments/create-intent` endpoint
3. Add Stripe Elements to `BookingPage.js`

**Deploy:**
- Backend: Railway, Render, or Heroku
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas

---

## 📝 License

MIT — free for personal and commercial use.
