import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { donationAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function DonationHistory({ onUpdate }) {  
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  useEffect(() => {
    applySortingAndFiltering();
  }, [donations, sortBy, statusFilter]);

  const loadDonations = async () => {
    try {
      console.log("Loading donations for user:", user.id);
      const response = await donationAPI.getMyDonations();
      console.log("My Donations Response:", response.data);

      setDonations(response.data);
    } catch (error) {
      console.error("Error loading donations:", error);
      try {
        console.log("Trying available donations as fallback...");
        const allResponse = await donationAPI.getAll();
        const myDonations = allResponse.data.filter(
          (donation) => donation.donor && donation.donor._id === user.id
        );
        console.log("Fallback My Donations:", myDonations);
        setDonations(myDonations);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const applySortingAndFiltering = () => {
    let result = [...donations];
    if (statusFilter !== "all") {
      result = result.filter((donation) => donation.status === statusFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "expiry-asc":
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        case "expiry-desc":
          return new Date(b.expiryDate) - new Date(a.expiryDate);
        case "status":
          return a.status.localeCompare(b.status);
        case "food-type":
          return a.foodType.localeCompare(b.foodType);
        default:
          return 0;
      }
    });

    setFilteredDonations(result);
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
      setDonations(donations.filter((d) => d._id !== donationToDelete._id));
      toast.success("Donation deleted successfully!");
      setShowDeleteModal(false);
      setDonationToDelete(null);
      if (onUpdate) {
        console.log("Calling onUpdate to refresh dashboard stats...");
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting donation:", error);
      toast.error(
        "Failed to delete donation: " +
          (error.response?.data?.message || error.message)
      );
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
      case "available":
        return "bg-green-100 text-green-800 border border-green-200";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "claimed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusCount = (status) => {
    return donations.filter((d) => d.status === status).length;
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Your Donation History
          </h3>
          <p className="text-gray-600 mt-1">
            Manage and track your food donations
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
            {getStatusCount("available")} Available
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {getStatusCount("claimed")} Claimed
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
            {getStatusCount("completed")} Completed
          </span>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="all">All ({donations.length})</option>
                <option value="available">
                  Available ({getStatusCount("available")})
                </option>
                <option value="reserved">
                  Reserved ({getStatusCount("reserved")})
                </option>
                <option value="claimed">
                  Claimed ({getStatusCount("claimed")})
                </option>
                <option value="completed">
                  Completed ({getStatusCount("completed")})
                </option>
                <option value="cancelled">
                  Cancelled ({getStatusCount("cancelled")})
                </option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="expiry-asc">Expiry Date (Soonest)</option>
                <option value="expiry-desc">Expiry Date (Latest)</option>
                <option value="status">Status</option>
                <option value="food-type">Food Type</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            Showing {filteredDonations.length} of {donations.length} donations
          </div>
        </div>
      </div>
      {filteredDonations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {statusFilter === "all" ? "No Donations Yet" : "No Donations Found"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {statusFilter === "all"
              ? "Start making a difference by listing your first food donation!"
              : `No donations match the "${statusFilter}" filter. Try changing your filters.`}
          </p>
          {statusFilter === "all" && (
            <button
              onClick={() => (window.location.href = "/donor")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Donate Food Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDonations.map((donation) => (
            <div
              key={donation._id}
              className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-xl text-gray-900">
                      {donation.foodType}
                    </h4>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                        donation.status
                      )}`}
                    >
                      {donation.status.charAt(0).toUpperCase() +
                        donation.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {donation.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                     
                      <span>
                        <strong>Quantity:</strong> {donation.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                     
                      <span>
                        <strong>Expires:</strong>{" "}
                        {new Date(donation.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      
                      <span>
                        <strong>Location:</strong> {donation.pickupLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      
                      <span>
                        <strong>Listed:</strong>{" "}
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {donation.allergens && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                     
                      <span>
                        <strong className="text-red-500">Allergens:</strong> {donation.allergens}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => handleDeleteClick(donation)}
                    disabled={deleteLoading === donation._id}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-red-200 hover:border-red-300"
                    title="Delete donation"
                  >
                    {deleteLoading === donation._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {donation.recipient && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
                    <span>👤</span>
                    <span>Claimed by:</span>
                  </div>
                  <p className="text-blue-800">{donation.recipient.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete Donation?
              </h3>
            </div>

            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this donation?
            </p>

            {donationToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <p className="font-semibold text-gray-900">
                  {donationToDelete.foodType}
                </p>
                <p className="text-sm text-gray-600">
                  {donationToDelete.quantity}
                </p>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The
                donation will be permanently removed.
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
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}