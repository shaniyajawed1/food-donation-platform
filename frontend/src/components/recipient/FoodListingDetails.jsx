import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { donationAPI, requestAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { Icons } from "../Icons.jsx";
import toast from "react-hot-toast";

export default function FoodListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getAll();

      if (response.data) {
        const foundListing = response.data.find(
          (item) => item._id === id || item.id === id
        );

        if (foundListing) {
          setListing(foundListing);
        } else {
          console.error("Listing not found in response data");
          setListing(null);
        }
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error fetching listing details:", error);
      toast.error("Failed to load food listing details");
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async () => {
    if (!user) {
      toast.error("Please login to request food");
      navigate("/login");
      return;
    }

    try {
      setRequestLoading(true);
      const requestData = {
        donationId: id,
        recipientId: user.id,
        message:
          requestMessage || "I would like to request this food donation.",
      };

      await requestAPI.create(requestData);
      toast.success(
        "Food request sent successfully! The donor will review your request."
      );
      setShowRequestModal(false);
      setRequestMessage("");
      navigate("/recipient/requests");
    } catch (error) {
      console.error("Request error:", error);
      toast.error(error.response?.data?.message || "Error sending request");
    } finally {
      setRequestLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryColor = (days) => {
    if (days < 0) return "text-red-600 bg-red-50 border-red-200";
    if (days === 0) return "text-red-600 bg-red-50 border-red-200";
    if (days <= 1) return "text-amber-600 bg-amber-50 border-amber-200";
    if (days <= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getExpiryText = (days) => {
    if (days < 0) return "Expired";
    if (days === 0) return "Expires today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get donor name from the listing data
  const getDonorName = () => {
    if (!listing) return "Anonymous Donor";
    
    // Check different possible donor name fields
    if (listing.donor?.name) {
      return listing.donor.name;
    }
    if (listing.donorName) {
      return listing.donorName;
    }
    if (listing.donor?.username) {
      return listing.donor.username;
    }
    if (listing.donor?.email) {
      return listing.donor.email.split('@')[0]; // Use part of email as fallback
    }
    
    return "Anonymous Donor";
  };

  // Get donor contact info if available
  const getDonorContact = () => {
    if (!listing) return null;
    
    if (listing.donor?.email) {
      return listing.donor.email;
    }
    if (listing.donor?.phone) {
      return listing.donor.phone;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.About className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Listing Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The food listing you're looking for doesn't exist or has been
            removed.
          </p>
          <Link
            to="/recipient/food-listings"
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(listing.expiryDate);
  const isExpired = daysUntilExpiry < 0;
  const donorName = getDonorName();
  const donorContact = getDonorContact();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link
            to="/recipient/food-listings"
            className="hover:text-emerald-600 transition-colors"
          >
            Food Listings
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Listing Details</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <div className="h-80 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.foodType || "Food donation"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            listing.images[0]
                          );
                          e.target.style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.className =
                            "w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-100";
                          fallback.innerHTML = `
                            <div class="text-center">
                              <svg class="w-16 h-16 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p class="text-emerald-500 font-medium mt-2">Food Image</p>
                            </div>
                          `;
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    ) : listing.image ? (
                      <img
                        src={listing.image}
                        alt={listing.foodType || "Food donation"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Icons.Meals className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                        <p className="text-emerald-500 font-medium">
                          No Image Available
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Thumbnails (if multiple images exist) */}
                {listing.images && listing.images.length > 1 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      More Images ({listing.images.length})
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {listing.images.map((image, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
                          onClick={() => {
                            // Simple image switcher - in a real app you might want a proper gallery
                            const mainImg =
                              document.querySelector(".main-food-image");
                            if (mainImg) {
                              mainImg.src = image;
                            }
                          }}
                        >
                          <img
                            src={image}
                            alt={`${listing.foodType} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donor Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Donor Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{donorName}</h4>
                  {donorContact && (
                    <p className="text-gray-600 text-sm mt-1">{donorContact}</p>
                  )}
                  <p className="text-emerald-600 text-sm font-medium mt-2">
                    Verified Food Donor
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowRequestModal(true)}
                  disabled={isExpired || !user}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isExpired
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : !user
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {isExpired
                    ? "Expired"
                    : !user
                    ? "Login to Request"
                    : "Request This Food"}
                </button>

                <Link
                  to="/recipient/food-listings"
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Listings
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.foodType || "Food Donation"}
                  </h1>
                  <p className="text-lg text-gray-600">
                    from {donorName}
                  </p>
                </div>
                {daysUntilExpiry !== null && (
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getExpiryColor(
                      daysUntilExpiry
                    )}`}
                  >
                    {getExpiryText(daysUntilExpiry)}
                  </span>
                )}
              </div>

              {listing.description && (
                <p className="text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
              )}
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Food Items</h3>
              <div className="flex flex-wrap gap-3">
                {listing.foodItems?.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm"
                  >
                    {item}
                  </span>
                ))}
                {(!listing.foodItems || listing.foodItems.length === 0) && (
                  <span className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                    Various food items available
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Quantity</div>
                      <div className="text-gray-600">
                        {listing.quantity || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Pickup Location
                      </div>
                      <div className="text-gray-600">
                        {listing.pickupLocation || "Location not specified"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {listing.pickupTime && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Pickup Time
                        </div>
                        <div className="text-gray-600">
                          {formatTime(listing.pickupTime)}
                        </div>
                      </div>
                    </div>
                  )}

                  {listing.expiryDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Expiry Date
                        </div>
                        <div className="text-gray-600">
                          {formatDate(listing.expiryDate)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(listing.allergens || listing.specialInstructions) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Important Information
                </h3>
                <div className="space-y-4">
                  {listing.allergens && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Contains Allergens
                      </div>
                      <p className="text-red-700 text-sm">
                        {listing.allergens}
                      </p>
                    </div>
                  )}

                  {listing.specialInstructions && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Special Instructions
                      </div>
                      <p className="text-blue-700 text-sm">
                        {listing.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-xl">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Request Food
                </h3>
                <p className="text-sm text-gray-600">
                  Send a request to {donorName}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Donor (Optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={`Add a personal message to ${donorName}...`}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage("");
                }}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 border border-transparent hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSubmit}
                disabled={requestLoading}
                className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {requestLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}