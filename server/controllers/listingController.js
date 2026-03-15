const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const path = require('path');

// @desc    Get all listings with search & filter
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const {
      search, city, country, minPrice, maxPrice,
      checkIn, checkOut, guests, propertyType,
      page = 1, limit = 12
    } = req.query;

    const query = { isAvailable: true };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (country) query['location.country'] = { $regex: country, $options: 'i' };
    if (propertyType) query.propertyType = propertyType;
    if (guests) query.maxGuests = { $gte: Number(guests) };

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Availability filter — exclude listings with overlapping bookings
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const bookedListingIds = await Booking.distinct('listing', {
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ]
      });

      query._id = { $nin: bookedListingIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(query);

    const listings = await Listing.find(query)
      .populate('host', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      listings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'host',
      'name avatar bio createdAt'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Create listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const {
      title, description, price, address, city, state, country,
      lat, lng, amenities, propertyType, maxGuests, bedrooms, beds, bathrooms
    } = req.body;

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: `/uploads/${file.filename}`,
          caption: ''
        });
      });
    }

    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      location: {
        address,
        city,
        state: state || '',
        country,
        coordinates: {
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null
        }
      },
      images,
      amenities: amenities
        ? Array.isArray(amenities)
          ? amenities
          : JSON.parse(amenities)
        : [],
      propertyType: propertyType || 'Apartment',
      maxGuests: Number(maxGuests),
      bedrooms: Number(bedrooms) || 1,
      beds: Number(beds) || 1,
      bathrooms: Number(bathrooms) || 1,
      host: req.user._id
    });

    // Mark user as host
    if (!req.user.isHost) {
      await req.user.updateOne({ isHost: true });
    }

    const populatedListing = await listing.populate('host', 'name avatar');
    res.status(201).json({ message: 'Listing created successfully', listing: populatedListing });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (owner only)
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const {
      title, description, price, address, city, state, country,
      lat, lng, amenities, propertyType, maxGuests, bedrooms, beds, bathrooms, isAvailable
    } = req.body;

    // Handle new images
    const newImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImages.push({ url: `/uploads/${file.filename}`, caption: '' });
      });
    }

    const updateData = {
      title: title || listing.title,
      description: description || listing.description,
      price: price ? Number(price) : listing.price,
      'location.address': address || listing.location.address,
      'location.city': city || listing.location.city,
      'location.state': state !== undefined ? state : listing.location.state,
      'location.country': country || listing.location.country,
      'location.coordinates.lat': lat ? Number(lat) : listing.location.coordinates.lat,
      'location.coordinates.lng': lng ? Number(lng) : listing.location.coordinates.lng,
      amenities: amenities
        ? Array.isArray(amenities) ? amenities : JSON.parse(amenities)
        : listing.amenities,
      propertyType: propertyType || listing.propertyType,
      maxGuests: maxGuests ? Number(maxGuests) : listing.maxGuests,
      bedrooms: bedrooms ? Number(bedrooms) : listing.bedrooms,
      beds: beds ? Number(beds) : listing.beds,
      bathrooms: bathrooms ? Number(bathrooms) : listing.bathrooms,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : listing.isAvailable
    };

    if (newImages.length > 0) {
      updateData.images = [...listing.images, ...newImages];
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('host', 'name avatar');

    res.json({ message: 'Listing updated successfully', listing: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (owner only)
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Cancel any pending/confirmed future bookings
    await Booking.updateMany(
      {
        listing: listing._id,
        status: { $in: ['pending', 'confirmed'] },
        checkIn: { $gt: new Date() }
      },
      { status: 'cancelled' }
    );

    await listing.deleteOne();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's listings
// @route   GET /api/listings/my-listings
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ host: req.user._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booked dates for a listing
// @route   GET /api/listings/:id/booked-dates
// @access  Public
const getBookedDates = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      listing: req.params.id,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gte: new Date() }
    }).select('checkIn checkOut');

    res.json({ bookedDates: bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  getBookedDates
};
