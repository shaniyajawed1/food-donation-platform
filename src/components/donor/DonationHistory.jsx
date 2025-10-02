import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { donationAPI } from '../../services/api';

export default function DonationHistory() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  const loadDonations = async () => {
    try {
      console.log('Loading donations for user:', user.id);
      const response = await donationAPI.getMyDonations();
      console.log('My Donations Response:', response.data);
      
      setDonations(response.data);
      
    } catch (error) {
      console.error('Error loading donations:', error);
      try {
        console.log('Trying available donations as fallback...');
        const allResponse = await donationAPI.getAll();
        const myDonations = allResponse.data.filter(donation => 
          donation.donor && donation.donor._id === user.id
        );
        console.log('Fallback My Donations:', myDonations);
        setDonations(myDonations);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'pickedup': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Your Donation History</h3>
      
      {donations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">??</div>
          <p>No donations yet. Start by listing your first food donation!</p>
          <button 
            onClick={() => window.location.href = '/donate'}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Donate Food Now
          </button>
        </div>
      ) : (
        donations.map(donation => (
          <div key={donation._id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{donation.foodType}</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                {donation.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{donation.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
              <div>
                <strong>Quantity:</strong> {donation.quantity}
              </div>
              <div>
                <strong>Expires:</strong> {new Date(donation.expiryDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Location:</strong> {donation.pickupLocation}
              </div>
              <div>
                <strong>Listed:</strong> {new Date(donation.createdAt).toLocaleDateString()}
              </div>
            </div>

            {donation.allergens && (
              <div className="mt-2">
                <strong>Allergens:</strong> {donation.allergens}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}