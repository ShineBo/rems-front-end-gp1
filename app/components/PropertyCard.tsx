
// /app/components/PropertyCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

type Property = {
  propertyID: number;
  propertyTitle: string;
  propertyType: string;
  propertyImages: string | null;
  description: string;
  price: number;
  location: string;
  status: string;
  dealerID: number;
  createdAt: string;
  updatedAt: string;
  dealer?: {
    businessName: string;
    phoneNumber: string;
    email: string;
  };
};

type PropertyCardProps = {
  property: Property;
  isDealer?: boolean;
  onEdit?: (property: Property) => void;
  onDelete?: (id: number) => void;
};

export default function PropertyCard({ property, isDealer = false, onEdit, onDelete }: PropertyCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 border border-gray-200">
      <div className="relative h-48 bg-gray-200">
        {property.propertyImages ? (
          <Image
            src={property.propertyImages}
            alt={property.propertyTitle}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold">
          {property.status}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{property.propertyTitle}</h3>
          <span className="text-lg font-semibold text-green-600">{formatPrice(property.price)}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{property.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <span>{property.propertyType}</span>
        </div>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
        >
          {showDetails ? 'Hide details' : 'View details'}
        </button>
        
        {showDetails && (
          <div className="mt-2 text-gray-700">
            <p className="mb-2">{property.description}</p>
            {property.dealer && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="font-semibold">{property.dealer.businessName}</p>
                <p className="text-sm">{property.dealer.phoneNumber}</p>
                <p className="text-sm">{property.dealer.email}</p>
              </div>
            )}
          </div>
        )}
        
        {isDealer && (
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => onEdit && onEdit(property)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete && onDelete(property.propertyID)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}