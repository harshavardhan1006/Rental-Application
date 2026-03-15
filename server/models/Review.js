const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
  },
  { timestamps: true }
);

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ listing: 1, author: 1 });

// Update listing average rating after review save/delete
reviewSchema.post('save', async function () {
  await updateListingRating(this.listing);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateListingRating(doc.listing);
});

async function updateListingRating(listingId) {
  const Review = mongoose.model('Review');
  const Listing = mongoose.model('Listing');

  const stats = await Review.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: '$listing',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
