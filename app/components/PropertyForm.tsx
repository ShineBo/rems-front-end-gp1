'use client';

import { useState, FormEvent } from 'react';

type Property = {
  propertyID?: number;
  propertyTitle: string;
  propertyType: string;
  propertyImages: string | null;
  description: string;
  price: number;
  location: string;
  status: string;
  dealerID?: number;
};

type PropertyFormProps = {
  initialData?: Property;
  dealerID: number;
  onSubmit: (data: Property) => void;
  onCancel: () => void;
};

export default function PropertyForm({ initialData, dealerID, onSubmit, onCancel }: PropertyFormProps) {
  const [formData, setFormData] = useState<Property>(
    initialData || {
      propertyTitle: '',
      propertyType: '',
      propertyImages: null,
      description: '',
      price: 0,
      location: '',
      status: 'Available',
      dealerID: dealerID,
    }
  );
  
  const [errors, setErrors] = useState<Partial<Record<keyof Property, string>>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof Property]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Property, string>> = {};
    
    if (!formData.propertyTitle.trim()) {
      newErrors.propertyTitle = 'Property title is required';
    }
    
    if (!formData.propertyType.trim()) {
      newErrors.propertyType = 'Property type is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.status.trim()) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Edit Property' : 'Add New Property'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="propertyTitle">
          Property Title
        </label>
        <input
          type="text"
          id="propertyTitle"
          name="propertyTitle"
          value={formData.propertyTitle}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.propertyTitle ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.propertyTitle && (
          <p className="text-red-500 text-sm mt-1">{errors.propertyTitle}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="propertyType">
          Property Type
        </label>
        <input
          type="text"
          id="propertyType"
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.propertyType ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.propertyType && (
          <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="1000"
            className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="location">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="Available">Available</option>
          <option value="Pending">Pending</option>
          <option value="Sold Out">Sold Out</option>
        </select>
        {errors.status && (
          <p className="text-red-500 text-sm mt-1">{errors.status}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {initialData ? 'Update Property' : 'Add Property'}
        </button>
      </div>
    </form>
  );
}