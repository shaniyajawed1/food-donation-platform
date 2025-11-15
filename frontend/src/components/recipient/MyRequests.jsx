import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requestAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getMyRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error("Failed to load request history:", error);
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...requests];
    if (statusFilter !== "all") {
      result = result.filter(request => request.status === statusFilter);
    }
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredRequests(result);
  };

  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;

    try {
      setDeletingId(requestToDelete._id);
      await requestAPI.delete(requestToDelete._id);
      setRequests((prev) => prev.filter((req) => req._id !== requestToDelete._id));
      toast.success("Request deleted successfully!");
    } catch (error) {
      console.error("Failed to delete request:", error);
      toast.error("Error deleting request: " + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setRequestToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "completed":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "approved":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "rejected":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Under Review";
      case "approved":
        return "Ready for Pickup";
      case "rejected":
        return "Not Available";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getStatusCount = (status) => {
    return requests.filter((req) => req.status === status).length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-8 bg-emerald-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-emerald-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 border border-emerald-100">
                  <div className="h-8 bg-emerald-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-emerald-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 border border-emerald-100">
                  <div className="h-6 bg-emerald-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-emerald-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-emerald-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            My Requests
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track your food donation requests and stay updated on their status
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">{requests.length}</div>
              <div className="text-sm font-medium text-slate-600">Total Requests</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">{getStatusCount("pending")}</div>
              <div className="text-sm font-medium text-amber-700">Pending Review</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{getStatusCount("approved")}</div>
              <div className="text-sm font-medium text-emerald-700">Ready for Pickup</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-2">{getStatusCount("completed")}</div>
              <div className="text-sm font-medium text-cyan-700">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 text-slate-900"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Ready for Pickup</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Not Available</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                {filteredRequests.length} of {requests.length} requests
              </div>
              <Link
                to="/recipient/food-listings"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find More Food
              </Link>
            </div>
          </div>
        </div>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-300">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {statusFilter === "all" ? "No Requests Yet" : "No Matching Requests"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {statusFilter === "all" 
                ? "Start by requesting food from available donations in your area."
                : "No requests match the current filter criteria."}
            </p>
            {statusFilter === "all" && (
              <Link
                to="/recipient/food-listings"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Available Donations
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {request.donation?.foodType || "Food Donation"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                  {request.status === "pending" && (
                    <button
                      onClick={() => handleDeleteClick(request)}
                      className="text-slate-400 hover:text-rose-500 transition-colors duration-200 p-2 hover:bg-rose-50 rounded-lg"
                      title="Cancel request"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Quantity</div>
                      <div>{request.donation?.quantity || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Pickup Location</div>
                      <div className="line-clamp-1">{request.donation?.pickupLocation || "Location not specified"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Requested On</div>
                      <div>{formatDate(request.createdAt)}</div>
                    </div>
                  </div>
                </div>
                {request.message && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700">
                      <strong>Your note:</strong> {request.message}
                    </p>
                  </div>
                )}
                {request.status === "approved" && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700 font-medium">
                      Ready for pickup! Contact the donor to arrange collection.
                    </p>
                  </div>
                )}

                {request.status === "rejected" && (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <p className="text-sm text-rose-700">
                      This request was not available. Try other donations.
                    </p>
                  </div>
                )}

                {request.status === "completed" && (
                  <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <p className="text-sm text-cyan-700 font-medium">
                      🎉 Successfully completed! Thank you for reducing food waste.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Cancel Request?</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>

              {requestToDelete && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                  <p className="font-medium text-slate-900">{requestToDelete.donation?.foodType}</p>
                  <p className="text-sm text-slate-600">{requestToDelete.donation?.quantity} • {requestToDelete.donation?.pickupLocation}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Keep Request
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Request"
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