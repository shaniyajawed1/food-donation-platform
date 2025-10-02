import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FoodListings from '../components/recipient/FoodListings';
import RequestHistory from '../components/recipient/RequestHistory';

export default function RecipientPortal() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to browse available food donations in your area.</p>
          <Link 
            to="/login" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Food Donations</h1>
          <p className="text-xl text-gray-600">Browse available food donations near you</p>
        </div>
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold ${
              activeTab === 'browse'
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Food
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold ${
              activeTab === 'history' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Request History
          </button>
        </div>
        <div>
          {activeTab === 'browse' && <FoodListings />}
          {activeTab === 'history' && <RequestHistory />}
        </div>
      </div>
    </div>
  );
}