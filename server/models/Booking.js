const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required']
    },
    guests: {
      type: Number,
      required: true,
      min: [1, 'At least 1 guest required']
    },
    totalPrice: {
      type: Number,
      required: true
    },
    pricePerNight: {
      type: Number,
      required: true
    },
    nights: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      default: ''
    }
  },
  { timestamps: true }
);

// Validate check-out is after check-in
bookingSchema.pre('save', function (next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

// Index for overlap queries
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
