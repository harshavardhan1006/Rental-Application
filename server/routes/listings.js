const express = require('express');
const router = express.Router();
const {
  getListings, getListing, createListing, updateListing,
  deleteListing, getMyListings, getBookedDates
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getListing);
router.get('/:id/booked-dates', getBookedDates);
router.post('/', protect, upload.array('images', 10), createListing);
router.put('/:id', protect, upload.array('images', 10), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
