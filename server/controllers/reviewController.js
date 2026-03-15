const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @desc    Get reviews for a listing
// @route   GET /api/reviews/listing/:listingId
// @access  Public
const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('author', 'name avatar createdAt')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the guest can review this booking' });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review confirmed or completed bookings' });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      listing: booking.listing,
      author: req.user._id,
      booking: bookingId,
      rating: Number(rating),
      comment
    });

    const populated = await review.populate('author', 'name avatar');
    res.status(201).json({ message: 'Review submitted successfully', review: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (author only)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getListingReviews, createReview, deleteReview };
