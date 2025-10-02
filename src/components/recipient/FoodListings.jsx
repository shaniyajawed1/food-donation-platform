import { useState, useEffect } from 'react';
import { donationAPI, requestAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FoodListings = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const response = await donationAPI.getAll();
      setDonations(response.data || []); 
    } catch (error) {
      console.error('Error loading donations:', error);
      setDonations([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (donationId) => {
    try {
      if (!user || !user.id) {
        alert('Please login to request food');
        return;
      }

      const requestData = {
        donationId: donationId,
        recipientId: user.id,
        message: "I would like to request this food donation."
      };
      
      await requestAPI.create(requestData);
      alert('Food request sent successfully! The donor will review your request.');
      
      
      loadDonations();
      
    } catch (error) {
      console.error('Request error:', error);
      alert('Error sending request: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Available Food Donations ({donations.length})
      </h2>
      
      {donations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🍽️</div>
          <p>No food donations available right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map(donation => (
            <div key={donation.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{donation.foodType}</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {donation.quantity}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3">{donation.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div>{donation.pickupLocation}</div>
                <div>Anonymous Donor</div>
                <div>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</div>
                {donation.allergens && (
                  <div>⚠️ {donation.allergens}</div>
                )}
              </div>

              <button
                onClick={() => handleRequest(donation.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Request Pickup
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodListings;