import { useState } from 'react';
import FoodListingForm from './FoodListingForm';
import DonationHistory from './DonationHistory';

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState('donate');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex-1 py-4 px-6 text-center font-semibold ${
            activeTab === 'donate' 
              ? 'border-b-2 border-green-500 text-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('donate')}
        >
          ?? Donate Food
        </button>
        <button
          className={`flex-1 py-4 px-6 text-center font-semibold ${
            activeTab === 'history' 
              ? 'border-b-2 border-green-500 text-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          ?? Donation History
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'donate' && <FoodListingForm />}
        {activeTab === 'history' && <DonationHistory />}
      </div>
    </div>
  );
}
