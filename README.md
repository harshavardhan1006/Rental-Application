# 🏠 StayFinder — Rental Application

A full-stack Airbnb-style rental platform built using the **MERN stack**. It includes authentication, property listings, bookings, reviews, search/filtering, image uploads, and dashboard management.

---
## System Architecture
```text

 ┌─────────────┐         HTTP Requests          ┌──────────────────────┐
 │   USERS     │ ─────────────────────────────▶ │   RENTAL PLATFORM    │
 │ Browser/App │ ◀───────────────────────────── │  Node.js + Express   │
 └─────────────┘         Responses              └─────────┬────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
                    ▼                                     ▼                                     ▼

          ┌────────────────┐                  ┌──────────────────┐                  ┌────────────────┐
          │ Authentication │                  │ Property Module  │                  │ Review Module  │
          │ Login/Register │                  │ Listings / CRUD  │                  │ Ratings/Comments│
          └───────┬────────┘                  └─────────┬────────┘                  └────────┬───────┘
                  │                                     │                                    │
                  └──────────────────────┬──────────────┴──────────────┬────────────────────┘
                                         │                             │
                                         ▼                             ▼

                              ┌────────────────────┐       ┌────────────────────┐
                              │   Booking System   │       │ Payment / Session  │
                              │ Reserve Property   │       │ Authentication     │
                              └─────────┬──────────┘       └─────────┬──────────┘
                                        │                            │
                                        └──────────────┬─────────────┘
                                                       ▼

                                      ┌─────────────────────────────┐
                                      │      Mongoose Models        │
                                      │ User • Listing • Reviews    │
                                      └─────────────┬───────────────┘
                                                    │
                                                    ▼

                                      ┌─────────────────────────────┐
                                      │          MongoDB            │
                                      │          Database           │
                                      └─────────────────────────────┘



        ┌──────────────────────────────────────────────────────────────────────┐
        │                         FRONTEND LAYER                              │
        │                 EJS + Bootstrap + CSS + JavaScript                  │
        └──────────────────────────────────────────────────────────────────────┘

```

---

# ✨ Features

- JWT Authentication (Login/Register)
- CRUD operations for property listings
- Image uploads using Multer
- Booking system with overlap prevention
- Search & filters (city, country, price, guests, availability)
- User dashboard for bookings and listings
- Reviews & ratings system
- OpenStreetMap integration

---

# 🗂️ Project Structure

```text
stayfinder-mern/
├── server/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── uploads/
│
└── client/
    └── src/
        ├── components/
        ├── pages/
        ├── context/
        └── utils/
```

---

# 🚀 Getting Started

## Prerequisites
- Node.js v18+
- MongoDB / MongoDB Atlas

## Install
```bash
npm install
npm run install-all
```

## Configure Environment
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

## Run Project
```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |

---

# 🗃️ Database Models

## User
```text
name, email, password, avatar, bio, phone, isHost
```

## Listing
```text
title, description, price, location, images, amenities,
propertyType, maxGuests, ratings, host
```

## Booking
```text
listing, guest, host, checkIn, checkOut,
guests, totalPrice, status
```

## Review
```text
listing, author, booking, rating, comment
```

---

# 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Uploads | Multer |
| Maps | OpenStreetMap |

---

# 🔧 Future Enhancements

- Cloudinary image storage
- Stripe payments
- Email notifications
- Deployment on Vercel / Render / Railway

---

# 📝 License

MIT License — free for personal and commercial use.
