import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { donationAPI } from '../../services/api';

export default function DonationHistory() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);

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

  const handleDeleteClick = (donation) => {
    setDonationToDelete(donation);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!donationToDelete) return;

    setDeleteLoading(donationToDelete._id);
    try {
      await donationAPI.delete(donationToDelete._id);
      
      // Remove from local state
      setDonations(donations.filter(d => d._id !== donationToDelete._id));
      
      // Show success message
      alert('Donation deleted successfully!');
      
      // Close modal
      setShowDeleteModal(false);
      setDonationToDelete(null);
      
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDonationToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'claimed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Your Donation History</h3>
        <span className="text-sm text-gray-600">{donations.length} total donations</span>
      </div>
      
      {donations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
       
          <p>No donations yet. Start by listing your first food donation!</p>
          <button 
            onClick={() => window.location.href = '/donor'}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Donate Food Now
          </button>
        </div>
      ) : (
        donations.map(donation => (
          <div key={donation._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{donation.foodType}</h4>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                  {donation.status}
                </span>
                <button
                  onClick={() => handleDeleteClick(donation)}
                  disabled={deleteLoading === donation._id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete donation"
                >
                  {deleteLoading === donation._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
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
              <div className="mt-2 text-sm">
                <strong>Allergens:</strong> {donation.allergens}
              </div>
            )}

            {donation.recipient && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <strong className="text-blue-900">Claimed by:</strong>
                <span className="text-blue-800 ml-2">{donation.recipient.name}</span>
              </div>
            )}
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Donation?</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this donation?
            </p>
            
            {donationToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <p className="font-semibold text-gray-900">{donationToDelete.foodType}</p>
                <p className="text-sm text-gray-600">{donationToDelete.quantity}</p>
              </div>
            )}
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The donation will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}