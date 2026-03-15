import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/helpers';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const { _id, title, images, price, location, averageRating, reviewCount, propertyType } = listing;
  const imgUrl = images && images.length > 0 ? getImageUrl(images[0].url) : 'https://placehold.co/400x300?text=No+Image';

  return (
    <Link to={`/listings/${_id}`} className="listing-card">
      <div className="listing-card-img-wrap">
        <img src={imgUrl} alt={title} className="listing-card-img" loading="lazy" />
        <span className="listing-card-type">{propertyType}</span>
      </div>
      <div className="listing-card-body">
        <div className="listing-card-header">
          <div className="listing-card-location">
            📍 {location.city}, {location.country}
          </div>
          {averageRating > 0 && (
            <div className="listing-card-rating">
              <span className="star">★</span>
              <span>{averageRating.toFixed(1)}</span>
              <span className="rating-count">({reviewCount})</span>
            </div>
          )}
        </div>
        <h3 className="listing-card-title">{title}</h3>
        <div className="listing-card-price">
          <strong>{formatPrice(price)}</strong>
          <span> / night</span>
        </div>
      </div>
    </Link>
  );
}
