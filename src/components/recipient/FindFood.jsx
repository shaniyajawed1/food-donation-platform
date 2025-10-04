import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icons } from "../Icons.jsx";

export default function FindFood() {
  const [foodListings, setFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest"
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFoodListings();
  }, []);

  const fetchFoodListings = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Replace with your actual API endpoint
      const response = await fetch("/api/food-listings/available");
      
      if (!response.ok) {
        throw new Error("Failed to fetch food listings");
      }
      
      const data = await response.json();
      setFoodListings(data);
    } catch (err) {
      setError("Unable to load food listings. Please try again later.");
      console.error("Error fetching food listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = foodListings.filter(listing => {
    const matchesSearch = searchTerm === "" || 
      listing.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.foodItems?.some(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || listing.category === filters.category;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(foodListings.map(listing => listing.category))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available food listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
            Find Available Food
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fresh food donations from local businesses and restaurants near you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icons.Find className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search by food items, restaurant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <Icons.About className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Unable to load listings</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredListings.length} food listing{filteredListings.length !== 1 ? 's' : ''} available
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Food Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Find className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food listings found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || filters.category
                ? "Try adjusting your search criteria or filters to see more results."
                : "There are currently no available food listings. Please check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Listing Image */}
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.donorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icons.Meals className="w-12 h-12 text-emerald-400" />
                  )}
                </div>

                {/* Listing Content */}
                <div className="p-6">
                  {/* Donor Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {listing.donorName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {listing.description}
                    </p>
                  </div>

                  {/* Food Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Food Items:</h4>
                    <div className="flex flex-wrap gap-2">
                      {listing.foodItems?.slice(0, 3).map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium"
                        >
                          {item}
                        </span>
                      ))}
                      {listing.foodItems?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          +{listing.foodItems.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Available for:</span>
                      <span className="font-medium">{listing.quantity} people</span>
                    </div>
                    {listing.pickupTime && (
                      <div className="flex justify-between">
                        <span>Pickup by:</span>
                        <span className="font-medium">
                          {new Date(listing.pickupTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <Link
                      to={`/recipient/food-listings/${listing.id}`}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                    >
                      <Icons.Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredListings.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={fetchFoodListings}
              className="bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              Load More Listings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}