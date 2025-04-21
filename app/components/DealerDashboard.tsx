'use client';

import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';

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

type NewProperty = Omit<Property, 'propertyID' | 'createdAt' | 'updatedAt' | 'dealer'>;

export default function DealerDashboard({ dealerID }: { dealerID: number }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchDealerProperties = async () => {
    try {
      const response = await fetch('http://localhost:3000/property');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      // Filter properties by dealer ID
      const dealerProperties = data.filter(
        (property: Property) => property.dealerID === dealerID
      );
      setProperties(dealerProperties);
    } catch (err) {
      setError('Error loading properties. Please try again later.');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealerProperties();
  }, [dealerID]);

  const handleAddProperty = async (propertyData: NewProperty) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:3000/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error('Failed to add property');
      }

      const newProperty = await response.json();
      setProperties([...properties, newProperty]);
      setShowForm(false);
    } catch (err) {
      setError('Error adding new property. Please try again.');
      console.error('Error adding property:', err);
    }
  };

  const handleEditProperty = async (propertyData: Property) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3000/property/${propertyData.propertyID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyTitle: propertyData.propertyTitle,
          propertyType: propertyData.propertyType,
          propertyImages: propertyData.propertyImages,
          description: propertyData.description,
          price: propertyData.price,
          location: propertyData.location,
          status: propertyData.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      const updatedProperty = await response.json();
      setProperties(
        properties.map(prop => 
          prop.propertyID === updatedProperty.propertyID ? updatedProperty : prop
        )
      );
      setEditingProperty(null);
    } catch (err) {
      setError('Error updating property. Please try again.');
      console.error('Error updating property:', err);
    }
  };

  const handleDeleteProperty = async (propertyID: number) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }
    
    try {
      setError(null);
      const response = await fetch(`http://localhost:3000/property/${propertyID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      setProperties(properties.filter(prop => prop.propertyID !== propertyID));
    } catch (err) {
      setError('Error deleting property. Please try again.');
      console.error('Error deleting property:', err);
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    if (filter === 'available') return property.status === 'Available';
    if (filter === 'pending') return property.status === 'Pending';
    if (filter === 'sold') return property.status === 'Sold Out';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading your properties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {editingProperty ? (
        <PropertyForm
          initialData={editingProperty}
          dealerID={dealerID}
          onSubmit={handleEditProperty}
          onCancel={() => setEditingProperty(null)}
        />
      ) : showForm ? (
        <PropertyForm
          dealerID={dealerID}
          onSubmit={handleAddProperty}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Properties</h2>
              <p className="text-gray-600">{filteredProperties.length} properties listed</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="all">All Properties</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Add New Property
              </button>
            </div>
          </div>
          
          {filteredProperties.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-600">No properties found</h3>
              {filter !== 'all' ? (
                <p className="text-gray-500 mt-2">Try changing your filter options</p>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Add Your First Property
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.propertyID}
                  property={property}
                  isDealer={true}
                  onEdit={(property) => setEditingProperty(property)}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}