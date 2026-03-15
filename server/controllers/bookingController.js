const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests, specialRequests } = req.body;

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!listing.isAvailable) {
      return res.status(400).json({ message: 'This listing is not available for booking' });
    }

    if (listing.host.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own listing' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (Number(guests) > listing.maxGuests) {
      return res.status(400).json({
        message: `This listing accommodates a maximum of ${listing.maxGuests} guests`
      });
    }

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      listing: listingId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    if (overlap) {
      return res.status(400).json({
        message: 'These dates are already booked. Please choose different dates.'
      });
    }

    // Calculate total
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    const booking = await Booking.create({
      listing: listingId,
      guest: req.user._id,
      host: listing.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      totalPrice,
      pricePerNight: listing.price,
      nights,
      specialRequests: specialRequests || ''
    });

    const populated = await booking.populate([
      { path: 'listing', select: 'title images location price' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'host', select: 'name email avatar' }
    ]);

    res.status(201).json({ message: 'Booking confirmed!', booking: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (as guest)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('listing', 'title images location price')
      .populate('host', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get host's received bookings
// @route   GET /api/bookings/host-bookings
// @access  Private
const getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('listing', 'title images location')
      .populate('guest', 'name avatar email')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing', 'title images location price amenities')
      .populate('guest', 'name avatar email')
      .populate('host', 'name avatar email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isGuest = booking.guest._id.toString() === req.user._id.toString();
    const isHost = booking.host._id.toString() === req.user._id.toString();

    if (!isGuest && !isHost) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isGuest = booking.guest.toString() === req.user._id.toString();
    const isHost = booking.host.toString() === req.user._id.toString();

    if (!isGuest && !isHost) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBooking,
  cancelBooking
};
