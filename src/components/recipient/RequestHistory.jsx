import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requestAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function RequestHistory() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter]);

  const loadRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await requestAPI.getMyRequests(user.id);
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
      setDeletingId(requestToDelete.id);
      await requestAPI.delete(requestToDelete.id);
      setRequests((prev) => prev.filter((req) => req.id !== requestToDelete.id));
      toast.success("Request deleted successfully!");
    } catch (error) {
      console.error("Failed to delete request:", error);
      toast.error("Error deleting request");
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
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "completed":
        return "bg-cyan-50 text-cyan-700 border border-cyan-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
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
        return "Awaiting approval";
      case "approved":
        return "Ready for pickup";
      case "rejected":
        return "Request declined";
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
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-emerald-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-emerald-200 rounded w-96 mb-8"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-normal text-emerald-900 tracking-tight">
                Request History
              </h1>
              <p className="text-emerald-700 font-light mt-2">
                Track the status of your food donation requests
              </p>
            </div>
            <Link
              to="/recipient/food-listings"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 mt-4 lg:mt-0 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find More Food
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-emerald-100 text-center shadow-sm">
              <div className="text-2xl font-serif font-normal text-emerald-900 mb-1">
                {requests.length}
              </div>
              <div className="text-emerald-700 text-sm">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-amber-100 text-center shadow-sm">
              <div className="text-2xl font-serif font-normal text-amber-600 mb-1">
                {getStatusCount("pending")}
              </div>
              <div className="text-amber-700 text-sm">Pending</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-emerald-100 text-center shadow-sm">
              <div className="text-2xl font-serif font-normal text-emerald-600 mb-1">
                {getStatusCount("approved")}
              </div>
              <div className="text-emerald-700 text-sm">Approved</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-cyan-100 text-center shadow-sm">
              <div className="text-2xl font-serif font-normal text-cyan-600 mb-1">
                {getStatusCount("completed")}
              </div>
              <div className="text-cyan-700 text-sm">Completed</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-emerald-100 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-emerald-900"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-emerald-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-normal text-emerald-900 mb-2">
              {statusFilter === "all" ? "No Requests Yet" : "No Matching Requests"}
            </h3>
            <p className="text-emerald-700 mb-6">
              {statusFilter === "all" 
                ? "Start by requesting food from available donations"
                : "No requests match the current filter"}
            </p>
            {statusFilter === "all" && (
              <Link
                to="/recipient/food-listings"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Browse Donations
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-emerald-100 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-normal text-xl text-emerald-900 mb-1">
                      {request.donation?.foodType || "Food Donation"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                  {request.status === "pending" && (
                    <button
                      onClick={() => handleDeleteClick(request)}
                      className="text-emerald-400 hover:text-rose-500 transition-colors duration-200 p-1"
                      title="Delete request"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm text-emerald-700">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span><strong>Quantity:</strong> {request.donation?.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-emerald-700">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span><strong>Location:</strong> {request.donation?.pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-emerald-700">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span><strong>Requested:</strong> {formatDate(request.createdAt)}</span>
                  </div>
                </div>
                {request.message && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700">
                      <strong>Your note:</strong> {request.message}
                    </p>
                  </div>
                )}
                {request.status === "approved" && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700">
                      <strong>Ready for pickup!</strong> Contact the donor to arrange collection.
                    </p>
                  </div>
                )}

                {request.status === "rejected" && (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <p className="text-sm text-rose-700">
                      This request was declined by the donor.
                    </p>
                  </div>
                )}

                {request.status === "completed" && (
                  <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <p className="text-sm text-cyan-700">
                      <strong>Thank you!</strong> Your request has been successfully completed.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-emerald-900">Delete Request?</h3>
              </div>

              <p className="text-emerald-700 mb-4">
                Are you sure you want to delete this request? This action cannot be undone.
              </p>

              {requestToDelete && (
                <div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-200">
                  <p className="font-medium text-emerald-900">{requestToDelete.donation?.foodType}</p>
                  <p className="text-sm text-emerald-700">{requestToDelete.donation?.quantity}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Request"
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