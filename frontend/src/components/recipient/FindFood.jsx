import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icons } from "../Icons.jsx";
import { donationAPI } from "../../services/api";

export default function FindFood() {
  const [foodListings, setFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFoodListings();
  }, []);

  const fetchFoodListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await donationAPI.getAll();

      if (response.data) {
        const availableDonations = response.data.map((listing) => ({
          ...listing,
          status: getStatusBadge(listing),
        }));
        setFoodListings(availableDonations);
      } else {
        throw new Error("No data received from server");
      }
    } catch (err) {
      console.error("Error fetching food listings:", err);
      if (err.response?.status === 404) {
        setError(
          "Food listings endpoint not found. Please check if the server is running."
        );
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.message?.includes("Network Error")) {
        setError(
          "Cannot connect to server. Please check your internet connection and ensure the backend is running on port 9900."
        );
      } else {
        setError("Unable to load food listings. Please try again later.");
      }
      setFoodListings([]);
    } finally {
      setLoading(false);
    }
  };
  const getImageUrl = (listing) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    if (listing.image) {
      return listing.image;
    }
    return null;
  };

  const getStatusBadge = (listing) => {
    if (listing.status === "completed")
      return { text: "Completed", color: "bg-green-100 text-green-800" };
    if (listing.status === "reserved")
      return { text: "Reserved", color: "bg-blue-100 text-blue-800" };
    if (listing.status === "cancelled")
      return { text: "Cancelled", color: "bg-red-100 text-red-800" };
    return { text: "Available", color: "bg-emerald-100 text-emerald-800" };
  };

  const getDonorDisplayName = (listing) => {
    if (listing.donor?.name) {
      return listing.donor.name;
    }
    if (listing.donorName) {
      return listing.donorName;
    }
    if (listing.foodType) {
      return `${listing.foodType} Donation`;
    }
    return "Local Business";
  };

  const getFoodItems = (listing) => {
    if (listing.foodItems && listing.foodItems.length > 0) {
      return listing.foodItems;
    }
    if (listing.foodType) {
      return [listing.foodType];
    }
    return ["Fresh Food"];
  };

  const getDescription = (listing) => {
    if (listing.description) {
      return listing.description;
    }
    if (listing.foodType) {
      return `Fresh ${listing.foodType} available for pickup`;
    }
    return "Fresh food donation available for immediate pickup";
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (days) => {
    if (days === null) return null;
    if (days < 0) return { text: "Expired", color: "bg-red-100 text-red-800" };
    if (days === 0)
      return { text: "Expires today", color: "bg-red-100 text-red-800" };
    if (days <= 1)
      return { text: "1 day left", color: "bg-amber-100 text-amber-800" };
    if (days <= 3)
      return {
        text: `${days} days left`,
        color: "bg-yellow-100 text-yellow-800",
      };
    return { text: `${days} days left`, color: "bg-green-100 text-green-800" };
  };

  const filteredListings = foodListings.filter((listing) => {
    const matchesSearch =
      searchTerm === "" ||
      getDonorDisplayName(listing)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getFoodItems(listing).some((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      getDescription(listing)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      listing.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !filters.category || listing.category === filters.category;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    ...new Set(foodListings.map((listing) => listing.category)),
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading available food listings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
            Find Available Food
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fresh food donations from local businesses and restaurants
            near you
          </p>
        </div>
        <Link
          to="/recipient/map"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-200"
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          View Map
        </Link>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icons.Find className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search by food items, restaurant name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
                />
              </div>
            </div>
            <div>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <Icons.About className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Unable to load listings
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchFoodListings}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredListings.length} food listing
            {filteredListings.length !== 1 ? "s" : ""} available
          </p>
          {(searchTerm || filters.category) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({ ...filters, category: "" });
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Find className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {foodListings.length === 0
                ? "No food listings available"
                : "No matching listings found"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {foodListings.length === 0
                ? "There are currently no available food donations. Please check back later or contact local businesses directly."
                : "Try adjusting your search criteria or filters to see more results."}
            </p>
            {foodListings.length === 0 && (
              <button
                onClick={fetchFoodListings}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Refresh Listings
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const daysUntilExpiry = getDaysUntilExpiry(listing.expiryDate);
              const expiryBadge = getExpiryBadge(daysUntilExpiry);
              const statusBadge = listing.status;
              const imageUrl = getImageUrl(listing);

              return (
                <div
                  key={listing._id || listing.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-emerald-50/30 overflow-hidden">
                    {imageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imageUrl}
                          alt={getDonorDisplayName(listing)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            console.error("Image failed to load:", imageUrl);
                            e.target.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/80 to-blue-50/80";
                            fallback.innerHTML = `
                            <div class="text-center p-4">
                              <svg class="w-12 h-12 text-emerald-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p class="text-emerald-500 font-medium text-sm">Food Image</p>
                            </div>
                          `;
                            e.target.parentElement.appendChild(fallback);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-50"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/80 to-blue-50/80">
                        <div className="text-center p-4">
                          <svg
                            className="w-12 h-12 text-emerald-200 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-emerald-500 font-medium text-sm">
                            No Image
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/90 shadow-md ${statusBadge.color}`}
                      >
                        {statusBadge.text}
                      </span>
                      {expiryBadge && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/90 shadow-md ${expiryBadge.color}`}
                        >
                          {expiryBadge.text}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {getDonorDisplayName(listing)}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                        {getDescription(listing)}
                      </p>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                        <h4 className="text-xs font-semibold text-gray-700">
                          Food Items
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {getFoodItems(listing)
                          .slice(0, 2)
                          .map((item, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium border border-emerald-100"
                            >
                              {item}
                            </span>
                          ))}
                        {getFoodItems(listing).length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                            +{getFoodItems(listing).length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Quantity:</span>
                          <span className="font-semibold text-gray-800 text-right">
                            {listing.quantity || "Multiple"}
                          </span>
                        </div>

                        {listing.expiryDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Expires:</span>
                            <span className="font-semibold text-gray-800">
                              {new Date(
                                listing.expiryDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {listing.pickupLocation && (
                          <div className="flex justify-between items-start">
                            <span className="text-gray-500">Location:</span>
                            <span className="font-medium text-gray-800 text-right max-w-[60%] line-clamp-1 text-xs">
                              {listing.pickupLocation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/recipient/food-listings/${
                          listing._id || listing.id
                        }`}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
                      >
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredListings.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={fetchFoodListings}
              className="bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              Refresh Listings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
