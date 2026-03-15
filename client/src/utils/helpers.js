export const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDateShort = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
};

export const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/800x500?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}${url}`;
};

export const getAvatarUrl = (url, name) => {
  if (url && url !== '') return getImageUrl(url);
  return null;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const renderStars = (rating, size = 14) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★');
    else if (i === full && half) stars.push('½');
    else stars.push('☆');
  }
  return stars;
};

export const getBookingStatusColor = (status) => {
  const map = {
    confirmed: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-gray',
    completed: 'badge-primary'
  };
  return map[status] || 'badge-gray';
};

export const AMENITIES_LIST = [
  'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning',
  'Heating', 'TV', 'Pool', 'Gym', 'Parking', 'Hot Tub',
  'BBQ Grill', 'Fireplace', 'Beach Access', 'Ski-in/Ski-out',
  'Pet Friendly', 'Smoking Allowed', 'Wheelchair Accessible'
];

export const AMENITY_ICONS = {
  'WiFi': '📶', 'Kitchen': '🍳', 'Washer': '🫧', 'Dryer': '🌀',
  'Air Conditioning': '❄️', 'Heating': '🔥', 'TV': '📺', 'Pool': '🏊',
  'Gym': '💪', 'Parking': '🚗', 'Hot Tub': '♨️', 'BBQ Grill': '🍖',
  'Fireplace': '🪵', 'Beach Access': '🏖️', 'Ski-in/Ski-out': '⛷️',
  'Pet Friendly': '🐾', 'Smoking Allowed': '🚬', 'Wheelchair Accessible': '♿'
};

export const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Cabin', 'Condo', 'Studio', 'Other'];
