/**
 * Seed script — populates the database with demo data.
 * Run: node seed.js  (from the /server directory)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Listing = require('./models/Listing');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airbnb-mern';

const users = [
  { name: 'Demo User', email: 'demo@stayfinder.com', password: 'demo123', isHost: true, bio: 'Passionate traveller and host.' },
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', isHost: true, bio: 'I love hosting guests from around the world!' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', isHost: false },
];

const listingTemplates = (hostId) => [
  {
    title: 'Cozy Beach House with Ocean Views',
    description: 'Wake up to stunning ocean views in this beautiful beachfront property. Fully equipped kitchen, private beach access, and everything you need for the perfect coastal getaway. Ideal for couples and small families.',
    price: 250,
    location: { address: '12 Ocean Drive', city: 'Miami', state: 'FL', country: 'United States', coordinates: { lat: 25.7617, lng: -80.1918 } },
    images: [
      { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', caption: 'Exterior view' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Living room' }
    ],
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Beach Access', 'Parking', 'BBQ Grill', 'TV'],
    propertyType: 'House', maxGuests: 6, bedrooms: 3, beds: 4, bathrooms: 2, host: hostId
  },
  {
    title: 'Modern Downtown Apartment',
    description: 'Stylish apartment in the heart of the city. Walking distance to restaurants, museums, and nightlife. Fast WiFi, fully equipped kitchen, and a balcony with city views. Perfect for business travellers or city explorers.',
    price: 120,
    location: { address: '456 5th Avenue', city: 'New York', state: 'NY', country: 'United States', coordinates: { lat: 40.7128, lng: -74.0060 } },
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', caption: 'Apartment interior' },
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', caption: 'Living area' }
    ],
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Heating', 'TV', 'Washer'],
    propertyType: 'Apartment', maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1, host: hostId
  },
  {
    title: 'Mountain Cabin Retreat',
    description: 'Escape to the mountains in this charming log cabin. Surrounded by pine trees with a fireplace, hot tub, and spectacular views. Perfect for hiking, skiing, or simply unplugging from city life.',
    price: 195,
    location: { address: '88 Pine Ridge Road', city: 'Aspen', state: 'CO', country: 'United States', coordinates: { lat: 39.1911, lng: -106.8175 } },
    images: [
      { url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', caption: 'Cabin exterior' },
      { url: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800', caption: 'Interior' }
    ],
    amenities: ['WiFi', 'Fireplace', 'Hot Tub', 'Kitchen', 'Parking', 'Heating', 'BBQ Grill'],
    propertyType: 'Cabin', maxGuests: 4, bedrooms: 2, beds: 3, bathrooms: 1, host: hostId
  },
  {
    title: 'Luxury Villa with Private Pool',
    description: 'Indulge in ultimate luxury at this stunning villa. Features a private heated pool, chef\'s kitchen, home theatre, and panoramic views. Premium linens, concierge service, and a dedicated host.',
    price: 750,
    location: { address: 'Via della Pergola 14', city: 'Tuscany', state: '', country: 'Italy', coordinates: { lat: 43.7711, lng: 11.2486 } },
    images: [
      { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', caption: 'Villa exterior' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Pool area' }
    ],
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Air Conditioning', 'Parking', 'BBQ Grill', 'Gym'],
    propertyType: 'Villa', maxGuests: 10, bedrooms: 5, beds: 6, bathrooms: 4, host: hostId
  },
  {
    title: 'Charming Studio in Paris',
    description: 'Live like a Parisian in this beautifully decorated studio near the Eiffel Tower. Croissants from the bakery next door, Seine river walks, and all the magic of the City of Light on your doorstep.',
    price: 160,
    location: { address: '7 Rue Saint-Dominique', city: 'Paris', state: 'Île-de-France', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    images: [
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', caption: 'Studio' },
      { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', caption: 'City view' }
    ],
    amenities: ['WiFi', 'Kitchen', 'Heating', 'TV', 'Washer', 'Air Conditioning'],
    propertyType: 'Studio', maxGuests: 2, bedrooms: 0, beds: 1, bathrooms: 1, host: hostId
  },
  {
    title: 'Bali Jungle Villa',
    description: 'A magical villa hidden in the lush jungles of Ubud. Traditional Balinese architecture meets modern comfort. Private pool, yoga deck, and rice terrace views. The ultimate tropical escape.',
    price: 220,
    location: { address: 'Jl. Bisma No. 7', city: 'Ubud', state: 'Bali', country: 'Indonesia', coordinates: { lat: -8.5069, lng: 115.2625 } },
    images: [
      { url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800', caption: 'Villa exterior' },
      { url: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800', caption: 'Pool' }
    ],
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Air Conditioning', 'Hot Tub', 'BBQ Grill'],
    propertyType: 'Villa', maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 2, host: hostId
  }
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Clear existing data
    await Promise.all([User.deleteMany(), Listing.deleteMany(), Booking.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (u) => {
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(u.password, salt);
        return User.create({ ...u, password: hashed });
      })
    );
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create listings
    const hostUser = createdUsers[0]; // demo@stayfinder.com is the host
    const templates = listingTemplates(hostUser._id);
    const createdListings = await Listing.insertMany(templates);
    console.log(`🏠 Created ${createdListings.length} listings`);

    // Create a sample booking
    const guestUser = createdUsers[2]; // bob@example.com
    const futureCheckIn = new Date();
    futureCheckIn.setDate(futureCheckIn.getDate() + 14);
    const futureCheckOut = new Date(futureCheckIn);
    futureCheckOut.setDate(futureCheckOut.getDate() + 3);

    await Booking.create({
      listing: createdListings[0]._id,
      guest: guestUser._id,
      host: hostUser._id,
      checkIn: futureCheckIn,
      checkOut: futureCheckOut,
      guests: 2,
      pricePerNight: createdListings[0].price,
      nights: 3,
      totalPrice: createdListings[0].price * 3,
      status: 'confirmed'
    });
    console.log('📅 Created sample booking');

    console.log('\n✅ Seed complete!\n');
    console.log('Demo credentials:');
    console.log('  Host account: demo@stayfinder.com / demo123');
    console.log('  Guest account: bob@example.com / password123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
