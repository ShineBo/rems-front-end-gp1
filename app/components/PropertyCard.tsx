'use client';

import { useState, useEffect } from 'react';

type Property = {
  propertyID: number;
  propertyTitle: string;
  propertyType: string;
  propertyImages: string | Buffer | { data: number[] | string } | null;
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
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Process the image on component mount or property change
  useEffect(() => {
    const processImage = async () => {
      if (!property.propertyImages) {
        setProcessedImageUrl(null);
        return;
      }

      try {
        let imageUrl: string | null = null;
        
        // Case 1: It's already a string URL or base64
        if (typeof property.propertyImages === 'string') {
          // Check if it's already a data URL (base64) or a regular URL
          if (property.propertyImages.startsWith('data:') || 
              property.propertyImages.startsWith('http')) {
            imageUrl = property.propertyImages;
          } else {
            // Try to interpret as base64 without prefix
            try {
              imageUrl = `data:image/jpeg;base64,${property.propertyImages}`;
            } catch (err) {
              console.error("Error interpreting string as base64:", err);
              imageUrl = null;
            }
          }
        }
        // Case 2: It's a Buffer object with data property (from server)
        else if (typeof property.propertyImages === 'object') {
          // Handle Buffer or object with data property
          const data = property.propertyImages.data || property.propertyImages;
          
          // Check if data is undefined or contains "[object Object]" serialized as numbers
          if (!data || (Array.isArray(data) && 
              data.join(',') === "91,111,98,106,101,99,116,32,79,98,106,101,99,116,93")) {
            console.error("Invalid image data");
            setImageError(true);
            return;
          }
          
          // If it's an array of numbers (valid image data)
          if (Array.isArray(data)) {
            // Convert number array to Uint8Array then to blob
            const uint8Array = new Uint8Array(data);
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            imageUrl = URL.createObjectURL(blob);
          }
          // If it's a string
          else if (typeof data === 'string') {
            // Check if it's a base64 string
            if (data.startsWith('data:')) {
              imageUrl = data;
            } else {
              // Try to convert to base64
              try {
                // In case it's binary data stored as a string
                const bytes = new Uint8Array(data.length);
                for (let i = 0; i < data.length; i++) {
                  bytes[i] = data.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'image/jpeg' });
                imageUrl = URL.createObjectURL(blob);
              } catch (err) {
                console.error("Error converting string to image:", err);
                imageUrl = null;
              }
            }
          }
        }
        
        setProcessedImageUrl(imageUrl);
      } catch (err) {
        console.error("Error processing property image:", err);
        setImageError(true);
        setProcessedImageUrl(null);
      }
    };
    
    processImage();
    
    // Cleanup function to handle any created object URLs
    return () => {
      if (processedImageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [property.propertyImages]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColour = (status: string) => {
    switch(status.toLowerCase()) {
      case "available":
        return "text-green-600";
      case "sold":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-black";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 border border-gray-200">
      <div className="relative h-48 bg-gray-200">
        {processedImageUrl && !imageError ? (
          <img 
            src={processedImageUrl}
            alt={property.propertyTitle}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
        <div className={`absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold ${getStatusColour(property.status)}`}>
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