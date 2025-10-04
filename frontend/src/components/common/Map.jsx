import { useState } from 'react';

export default function Map({ location, onLocationSelect }) {
  const [selectedLocation, setSelectedLocation] = useState(location);
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ?? Pickup Location
      </label>
      <input
        type="text"
        value={selectedLocation}
        onChange={(e) => {
          setSelectedLocation(e.target.value);
          if (onLocationSelect) {
            onLocationSelect(e.target.value);
          }
        }}
        placeholder="Enter full address for pickup"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div className="mt-4 bg-gray-100 rounded-lg p-4 text-center">
        <div className="text-4xl mb-2">???</div>
        <p className="text-gray-600">Google Maps integration ready</p>
        <p className="text-sm text-gray-500">
          Location: {selectedLocation || 'Not specified'}
        </p>
      </div>
    </div>
  );
}
