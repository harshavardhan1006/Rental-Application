const express = require('express');
const router = express.Router();
const { getListingReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/listing/:listingId', getListingReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
