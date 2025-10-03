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

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getAll();
      setDonations(response.data || []); 
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
        donation.foodType.toLowerCase().includes(filters.search.toLowerCase()) ||
        donation.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        donation.pickupLocation.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.foodType) {
      result = result.filter(donation => 
        donation.foodType.toLowerCase().includes(filters.foodType.toLowerCase())
      );
    }
    if (filters.expiry !== 'all') {
      const today = new Date();
      result = result.filter(donation => {
        const expiryDate = new Date(donation.expiryDate);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        switch (filters.expiry) {
          case 'today':
            return diffDays === 0;
          case 'tomorrow':
            return diffDays === 1;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
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

  const getDaysUntilExpiry = (expiryDate) => {
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

  const foodTypeOptions = [...new Set(donations.map(d => d.foodType))].slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50/30 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-normal text-slate-900 tracking-tight">
                Available Food Donations
              </h1>
              <p className="text-slate-600 font-light mt-2">
                Discover fresh food donations from your local community
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="font-semibold text-emerald-600">{filteredDonations.length}</span> of{' '}
                <span className="font-semibold">{donations.length}</span> donations available
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Donations
                </label>
                <input
                  type="text"
                  placeholder="Search food, description, location..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Food Type
                </label>
                <select
                  value={filters.foodType}
                  onChange={(e) => setFilters({...filters, foodType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Types</option>
                  {foodTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expiry Date
                </label>
                <select
                  value={filters.expiry}
                  onChange={(e) => setFilters({...filters, expiry: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">Any Expiry</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">Within Week</option>
                  <option value="month">Within Month</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', foodType: '', distance: 'all', expiry: 'all' })}
                  className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        {filteredDonations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-normal text-slate-900 mb-4">
              {filters.search || filters.foodType || filters.expiry !== 'all' ? "No Donations Found" : "No Donations Available"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {filters.search || filters.foodType || filters.expiry !== 'all' 
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Check back later for new food donations from your local community."}
            </p>
            {(filters.search || filters.foodType || filters.expiry !== 'all') && (
              <button
                onClick={() => setFilters({ search: '', foodType: '', distance: 'all', expiry: 'all' })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Show All Donations
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDonations.map(donation => {
              const daysUntilExpiry = getDaysUntilExpiry(donation.expiryDate);
              const isExpired = daysUntilExpiry < 0;

              return (
                <div key={donation._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-serif font-normal text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                        {donation.foodType}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getExpiryColor(daysUntilExpiry)}`}>
                        {getExpiryText(daysUntilExpiry)}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {donation.description}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">Quantity</div>
                          <div className="text-sm text-slate-600">{donation.quantity}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">Pickup Location</div>
                          <div className="text-sm text-slate-600 line-clamp-1">{donation.pickupLocation}</div>
                        </div>
                      </div>

                      {donation.donor && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">Donated By</div>
                            <div className="text-sm text-slate-600">{donation.donor.name}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {donation.allergens && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="font-medium">Contains:</span> {donation.allergens}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleRequest(donation._id)}
                      disabled={requestLoading === donation._id || isExpired || !user}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isExpired 
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                          : !user
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                      }`}
                    >
                      {requestLoading === donation._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Requesting...
                        </>
                      ) : isExpired ? (
                        'Expired'
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

                    {!user && (
                      <p className="text-xs text-slate-500 text-center mt-2">
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 underline">
                          Sign in
                        </Link> to request this donation
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodListings;