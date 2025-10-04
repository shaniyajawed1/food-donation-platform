import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { donationAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  useEffect(() => {
    applySortingAndFiltering();
  }, [donations, sortBy, statusFilter, searchTerm]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getMyDonations();
      setDonations(response.data);
    } catch (error) {
      console.error("Error loading donations:", error);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const applySortingAndFiltering = () => {
    let result = [...donations];
    if (searchTerm) {
      result = result.filter(donation => 
        donation.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
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
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "reserved":
        return "bg-amber-100 text-amber-800 border border-amber-200";
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return "🟢";
      case "reserved":
        return "🟡";
      case "claimed":
        return "🔵";
      case "completed":
        return "🟣";
      case "cancelled":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getStatusCount = (status) => {
    return donations.filter((d) => d.status === status).length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="h-10 bg-slate-200 rounded w-10 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-serif font-normal text-slate-900 tracking-tight">
                My Donations
              </h1>
              <p className="text-slate-600 font-light mt-2">
                Manage and track all your food donations in one place
              </p>
            </div>
            <Link
              to="/donor/dashboard"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              + New Donation
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-serif font-normal text-slate-900 mb-1">
                {donations.length}
              </div>
              <div className="text-slate-600 text-sm font-light">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-serif font-normal text-emerald-600 mb-1">
                {getStatusCount("available")}
              </div>
              <div className="text-slate-600 text-sm font-light">Available</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-serif font-normal text-blue-600 mb-1">
                {getStatusCount("claimed")}
              </div>
              <div className="text-slate-600 text-sm font-light">Claimed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-serif font-normal text-purple-600 mb-1">
                {getStatusCount("completed")}
              </div>
              <div className="text-slate-600 text-sm font-light">Completed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-serif font-normal text-amber-600 mb-1">
                {getStatusCount("reserved")}
              </div>
              <div className="text-slate-600 text-sm font-light">Reserved</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Donations
              </label>
              <input
                type="text"
                placeholder="Search by food type, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="claimed">Claimed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="expiry-asc">Expiry (Soonest)</option>
                <option value="expiry-desc">Expiry (Latest)</option>
                <option value="food-type">Food Type</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 w-full text-center">
                Showing {filteredDonations.length} of {donations.length} donations
              </div>
            </div>
          </div>
        </div>
        {filteredDonations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-normal text-slate-900 mb-4">
              {searchTerm || statusFilter !== "all" ? "No Donations Found" : "No Donations Yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Start making a difference by listing your first food donation!"}
            </p>
            <Link
              to="/donor/dashboard"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Donation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredDonations.map((donation) => {
              const daysUntilExpiry = getDaysUntilExpiry(donation.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
              const isExpired = daysUntilExpiry < 0;

              return (
                <div
                  key={donation._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-serif font-normal text-xl text-slate-900 mb-1">
                          {donation.foodType}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {donation.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                            donation.status
                          )}`}
                        >
                          {getStatusIcon(donation.status)} {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleDeleteClick(donation)}
                          disabled={deleteLoading === donation._id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete donation"
                        >
                          {deleteLoading === donation._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-slate-700">
                          <strong>Listed:</strong> {formatDate(donation.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-slate-700">
                          <strong>Quantity:</strong> {donation.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-slate-700 text-sm">
                          {donation.pickupLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${
                          isExpired ? 'text-red-500' : 
                          isExpiringSoon ? 'text-amber-500' : 
                          'text-slate-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-sm font-medium ${
                          isExpired ? 'text-red-600' : 
                          isExpiringSoon ? 'text-amber-600' : 
                          'text-slate-700'
                        }`}>
                          Expires: {formatDate(donation.expiryDate)}
                          {isExpiringSoon && !isExpired && (
                            <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              Soon
                            </span>
                          )}
                          {isExpired && (
                            <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Expired
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {donation.allergens && (
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-red-600 text-sm">
                          <strong>Allergens:</strong> {donation.allergens}
                        </span>
                      </div>
                    )}

                    {donation.recipient && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Claimed by:</span>
                        </div>
                        <p className="text-blue-800 text-sm">{donation.recipient.name}</p>
                        {donation.recipient.phone && (
                          <p className="text-blue-700 text-sm mt-1">📞 {donation.recipient.phone}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Delete Donation?</h3>
              </div>

              <p className="text-slate-600 mb-2">
                Are you sure you want to delete this donation?
              </p>

              {donationToDelete && (
                <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
                  <p className="font-semibold text-slate-900">
                    {donationToDelete.foodType}
                  </p>
                  <p className="text-sm text-slate-600">
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
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
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
    </div>
  );
}