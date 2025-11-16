import { useState, useEffect } from 'react';
import { donationAPI, requestAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FoodListings = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    foodType: '',
    distance: 'all',
    expiry: 'all'
  });
  const { user } = useAuth();

  useEffect(() => {
    loadDonations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donations, filters]);
  const isDonationExpired = (donation) => {
    if (!donation.expiryDate) return false;
    
    const expiryDate = new Date(donation.expiryDate);
    const now = new Date();
  
    return expiryDate < now;
  };

  const getActualStatus = (donation) => {
    if (isDonationExpired(donation)) {
      return 'expired';
    }
    return donation.status;
  };

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getAll();
      
      if (response.data) {
        const allDonations = response.data;
        console.log("All donations:", allDonations);
        setDonations(allDonations);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      setDonations([]); 
      toast.error('Failed to load food listings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...donations];
    if (filters.search) {
      result = result.filter(donation => 
        donation.foodType?.toLowerCase().includes(filters.search.toLowerCase()) ||
        donation.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        donation.pickupLocation?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.foodType) {
      result = result.filter(donation => 
        donation.foodType?.toLowerCase().includes(filters.foodType.toLowerCase())
      );
    }
    if (filters.expiry !== 'all') {
      const today = new Date();
      result = result.filter(donation => {
        if (!donation.expiryDate) return true;
        const expiryDate = new Date(donation.expiryDate);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        switch (filters.expiry) {
          case 'today':
            return diffDays === 0;
          case 'tomorrow':
            return diffDays === 1;
          case 'week':
            return diffDays <= 7 && diffDays >= 0;
          case 'month':
            return diffDays <= 30 && diffDays >= 0;
          case 'expired':
            return diffDays < 0;
          default:
            return true;
        }
      });
    }

    setFilteredDonations(result);
  };

  const handleRequest = async (donationId) => {
    try {
      if (!user || !user.id) {
        toast.error('Please login to request food');
        return;
      }

      setRequestLoading(donationId);
      const requestData = {
        donationId: donationId,
        recipientId: user.id,
        message: "I would like to request this food donation."
      };
      
      await requestAPI.create(requestData);
      toast.success('Food request sent successfully! The donor will review your request.');
      
      loadDonations();
      
    } catch (error) {
      console.error('Request error:', error);
      toast.error('Error sending request: ' + (error.response?.data?.message || error.message));
    } finally {
      setRequestLoading(null);
    }
  };
  const stats = {
    totalDonations: donations.length,
    availableDonations: donations.filter(d => getActualStatus(d) === 'available').length,
    expiredDonations: donations.filter(d => getActualStatus(d) === 'expired').length,
    reservedDonations: donations.filter(d => getActualStatus(d) === 'reserved').length,
    expiringToday: donations.filter(d => {
      if (!d.expiryDate) return false;
      const today = new Date();
      const expiry = new Date(d.expiryDate);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return diffDays === 0 && !isDonationExpired(d);
    }).length,
    expiringThisWeek: donations.filter(d => {
      if (!d.expiryDate) return false;
      const today = new Date();
      const expiry = new Date(d.expiryDate);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7 && !isDonationExpired(d);
    }).length,
    totalQuantity: donations.reduce((sum, d) => sum + (parseInt(d.quantity) || 0), 0),
    uniqueDonors: new Set(donations.map(d => d.donor?.id)).size
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 30; 
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryColor = (days) => {
    if (days < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 1) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (days <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getExpiryText = (days) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const getStatusColor = (donation) => {
    const actualStatus = getActualStatus(donation);
    
    switch (actualStatus) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'reserved': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'claimed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (donation) => {
    const actualStatus = getActualStatus(donation);
    
    switch (actualStatus) {
      case 'available': return 'Available';
      case 'expired': return 'Expired';
      case 'reserved': return 'Reserved';
      case 'claimed': return 'Claimed';
      default: return 'Unknown';
    }
  };

  const foodTypeOptions = [...new Set(donations.map(d => d.foodType).filter(Boolean))].slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                Food Donations Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Discover and request available food donations in your area
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={loadDonations}
                className="bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDonations}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Now</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.availableDonations}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.expiredDonations}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.expiringThisWeek}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meals</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalQuantity}+</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Donations
                </label>
                <input
                  type="text"
                  placeholder="Search food, description, location..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <select
                  value={filters.foodType}
                  onChange={(e) => setFilters({...filters, foodType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
                >
                  <option value="">All Types</option>
                  {foodTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <select
                  value={filters.expiry}
                  onChange={(e) => setFilters({...filters, expiry: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
                >
                  <option value="all">Any Expiry</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">Within Week</option>
                  <option value="month">Within Month</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="expired">Expired</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', foodType: '', distance: 'all', expiry: 'all', status: 'all' })}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {filters.search || filters.foodType || filters.expiry !== 'all' || filters.status !== 'all' ? "No Donations Found" : "No Donations Available"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filters.search || filters.foodType || filters.expiry !== 'all' || filters.status !== 'all' 
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Check back later for new food donations from your local community."}
            </p>
            {(filters.search || filters.foodType || filters.expiry !== 'all' || filters.status !== 'all') && (
              <button
                onClick={() => setFilters({ search: '', foodType: '', distance: 'all', expiry: 'all', status: 'all' })}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Show All Donations
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Food Donations ({filteredDonations.length})
              </h2>
              <div className="text-sm text-gray-600">
                Showing: <span className="font-medium">All donations</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDonations.map(donation => {
                const daysUntilExpiry = getDaysUntilExpiry(donation.expiryDate);
                const isExpired = isDonationExpired(donation);
                const actualStatus = getActualStatus(donation);

                return (
                  <div key={donation._id} className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
                    isExpired ? 'border-red-200/60 opacity-80' : 'border-gray-200/60'
                  }`}>
                    <div className={`px-4 py-2 border-b ${getStatusColor(donation)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{getStatusText(donation)}</span>
                        {isExpired && (
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`font-semibold text-lg line-clamp-1 ${
                          isExpired ? 'text-gray-500' : 'text-gray-900 group-hover:text-emerald-600 transition-colors'
                        }`}>
                          {donation.foodType || 'Food Donation'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getExpiryColor(daysUntilExpiry)}`}>
                          {getExpiryText(daysUntilExpiry)}
                        </span>
                      </div>
                      
                      <p className={`text-sm leading-relaxed line-clamp-2 ${
                        isExpired ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {donation.description || 'No description available'}
                      </p>
                    </div>

                    <div className="p-6 pt-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isExpired ? 'bg-gray-100' : 'bg-blue-100'
                          }`}>
                            <svg className={`w-4 h-4 ${isExpired ? 'text-gray-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>Quantity</div>
                            <div className={`text-sm ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>{donation.quantity || 'Not specified'}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isExpired ? 'bg-gray-100' : 'bg-emerald-100'
                          }`}>
                            <svg className={`w-4 h-4 ${isExpired ? 'text-gray-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>Pickup Location</div>
                            <div className={`text-sm line-clamp-1 ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>{donation.pickupLocation || 'Location not specified'}</div>
                          </div>
                        </div>

                        {donation.donor && (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isExpired ? 'bg-gray-100' : 'bg-amber-100'
                            }`}>
                              <svg className={`w-4 h-4 ${isExpired ? 'text-gray-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>Donated By</div>
                              <div className={`text-sm ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>{donation.donor.name || 'Anonymous'}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {donation.allergens && (
                        <div className={`mb-4 p-3 rounded-lg border ${
                          isExpired ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className={`flex items-center gap-2 text-sm ${
                            isExpired ? 'text-gray-500' : 'text-red-800'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium">Contains:</span> {donation.allergens}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleRequest(donation._id)}
                        disabled={requestLoading === donation._id || isExpired || !user || actualStatus !== 'available'}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          isExpired || actualStatus !== 'available'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : !user
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                        }`}
                      >
                        {requestLoading === donation._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Requesting...
                          </>
                        ) : isExpired ? (
                          'Expired'
                        ) : actualStatus !== 'available' ? (
                          getStatusText(donation)
                        ) : !user ? (
                          'Login to Request'
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Request Pickup
                          </>
                        )}
                      </button>

                      {!user && actualStatus === 'available' && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 underline">
                            Sign in
                          </Link> to request this donation
                        </p>
                      )}

                      {isExpired && (
                        <p className="text-xs text-red-600 text-center mt-2">
                          This donation has expired and cannot be requested
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodListings;