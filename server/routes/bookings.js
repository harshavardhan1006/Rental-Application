const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getHostBookings, getBooking, cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/host-bookings', protect, getHostBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
