import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requestAPI } from "../../services/api";

export default function RequestHistory() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await requestAPI.getMyRequests(user.id);
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to load request history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(requestId);
      await requestAPI.delete(requestId);
      setRequests((prev) => prev.filter((req) => req.id !== requestId));

      alert("Request deleted successfully!");
    } catch (error) {
      console.error("Failed to delete request:", error);
      alert(
        "Error deleting request: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return " Waiting for donor approval";
      case "approved":
        return " Approved - Contact donor for pickup";
      case "rejected":
        return " Request declined";
      case "completed":
        return " Food received!";
      default:
        return status;
    }
  };

  const canDeleteRequest = (request) => {
    return request.status === "pending";
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
      <h3 className="text-2xl font-bold text-gray-900">Your Food Requests</h3>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Requests Yet
          </h3>
          <p className="text-gray-600">
            Browse available food donations to make your first request!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">
                    {request.donation?.foodType || "Food Donation"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {getStatusText(request.status)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                  {canDeleteRequest(request) && (
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      disabled={deletingId === request.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      {deletingId === request.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {request.donation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <strong>Food:</strong> {request.donation.foodType}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {request.donation.quantity}
                  </div>
                  <div>
                    <strong>Pickup Location:</strong>{" "}
                    {request.donation.pickupLocation}
                  </div>
                  <div>
                    <strong>Requested:</strong>{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {request.message && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <strong>Your message:</strong> {request.message}
                </div>
              )}

              {request.status === "approved" && request.donation && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-900 mb-2">
                    Request Approved!
                  </h5>
                  <p className="text-green-800">
                    Contact the donor to arrange pickup:
                  </p>
                  <p className="text-green-700 mt-1">
                    <strong>Location:</strong> {request.donation.pickupLocation}
                  </p>
                  <p className="text-green-700">
                    <strong>Donor Contact:</strong> Check your email for donor
                    details
                  </p>
                </div>
              )}

              {request.status === "rejected" && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800">
                    This request was declined by the donor.
                  </p>
                </div>
              )}

              {!canDeleteRequest(request) && request.status !== "pending" && (
                <div className="mt-3 text-xs text-gray-500">
                  This request cannot be deleted because it's already{" "}
                  {request.status}.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
