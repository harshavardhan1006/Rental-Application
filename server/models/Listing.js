const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least $1']
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      country: { type: String, required: true },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
      }
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' }
      }
    ],
    amenities: [
      {
        type: String,
        enum: [
          'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning',
          'Heating', 'TV', 'Pool', 'Gym', 'Parking', 'Hot Tub',
          'BBQ Grill', 'Fireplace', 'Beach Access', 'Ski-in/Ski-out',
          'Pet Friendly', 'Smoking Allowed', 'Wheelchair Accessible'
        ]
      }
    ],
    propertyType: {
      type: String,
      enum: ['Apartment', 'House', 'Villa', 'Cabin', 'Condo', 'Studio', 'Other'],
      default: 'Apartment'
    },
    maxGuests: {
      type: Number,
      required: true,
      min: [1, 'Must accommodate at least 1 guest']
    },
    bedrooms: { type: Number, default: 1, min: 0 },
    beds: { type: Number, default: 1, min: 1 },
    bathrooms: { type: Number, default: 1, min: 0.5 },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Text index for search
listingSchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.country': 'text'
});

// Index for location queries
listingSchema.index({ 'location.city': 1, 'location.country': 1 });
listingSchema.index({ price: 1 });

module.exports = mongoose.model('Listing', listingSchema);
