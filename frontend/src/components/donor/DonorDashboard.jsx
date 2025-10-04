import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { donationAPI } from '../../services/api';
import FoodListingForm from './FoodListingForm';
import DonationHistory from './DonationHistory';

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState('donate');
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalImpact: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchDonorStats(),
        fetchRecentDonations()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonorStats = async () => {
    try {
      const response = await donationAPI.getMyDonations();
      const donations = response.data;
      calculateStats(donations);
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  const calculateStats = (donations) => {
    console.log('Calculating stats from donations:', donations);
    
    const totalDonations = donations.length;
    const activeDonations = donations.filter(d => d.status === 'available').length;
    const completedDonations = donations.filter(d => d.status === 'completed').length;
    
    
    const totalImpact = donations
      .filter(d => d.status === 'completed')
      .reduce((total, donation) => {
        const quantityMatch = donation.quantity.match(/\d+/);
        const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 0;
        return total + quantity;
      }, 0);

    console.log('Calculated stats:', {
      totalDonations,
      activeDonations,
      completedDonations,
      totalImpact
    });

    setStats({
      totalDonations,
      activeDonations,
      completedDonations,
      totalImpact
    });
  };

  const fetchRecentDonations = async () => {
    try {
      const response = await donationAPI.getMyDonations();
      const donations = response.data;
      const recent = donations.slice(0, 3);
      console.log('Recent donations:', recent);
      setRecentDonations(recent);
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'claimed': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getMemberSince = () => {
    try {
      const dateString = user?.createdAt || user?.created_at || user?.dateJoined || user?.registrationDate;
      
      if (!dateString) {
        return 'Recent';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recent';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting member since date:', error);
      return 'Recent';
    }
  };

  const handleDonationSuccess = () => {
    console.log('Donation created successfully, refreshing data...');
    fetchDashboardData();
    setActiveTab('history'); 
  };

  const handleDonationUpdate = () => {
    console.log('Donation updated, refreshing stats...');
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-8"></div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-normal text-slate-900 tracking-tight">
                Donor Dashboard
              </h1>
              <p className="text-slate-600 font-light mt-2">
                Welcome back, {user?.name || 'Donor'}. Manage your food donations and track your impact.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Member since</p>
              <p className="text-slate-700 font-medium">
                {getMemberSince()}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-light mb-1">Total Donations</p>
              <p className="text-2xl font-serif font-normal text-slate-900">{stats.totalDonations}</p>
              <p className="text-xs text-slate-500 mt-1">All time contributions</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-light mb-1">Active Listings</p>
              <p className="text-2xl font-serif font-normal text-slate-900">{stats.activeDonations}</p>
              <p className="text-xs text-slate-500 mt-1">Currently available</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-light mb-1">Completed</p>
              <p className="text-2xl font-serif font-normal text-slate-900">{stats.completedDonations}</p>
              <p className="text-xs text-slate-500 mt-1">Successfully delivered</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-light mb-1">Total Impact</p>
              <p className="text-2xl font-serif font-normal text-slate-900">{stats.totalImpact}+</p>
              <p className="text-xs text-slate-500 mt-1">Meals provided</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
              <div className="flex border-b border-slate-200">
                <button
                  className={`flex items-center justify-center space-x-3 py-5 px-8 font-medium transition-all duration-300 flex-1 ${
                    activeTab === 'donate' 
                      ? 'text-amber-700 border-b-2 border-amber-700 bg-amber-50/30' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveTab('donate')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Donation</span>
                </button>
                <button
                  className={`flex items-center justify-center space-x-3 py-5 px-8 font-medium transition-all duration-300 flex-1 ${
                    activeTab === 'history' 
                      ? 'text-amber-700 border-b-2 border-amber-700 bg-amber-50/30' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Donation History</span>
                </button>
              </div>
              <div className="p-8">
                {activeTab === 'donate' && <FoodListingForm onSuccess={handleDonationSuccess} />}
                {activeTab === 'history' && <DonationHistory onUpdate={handleDonationUpdate} />}
              </div>
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-normal text-slate-900 text-lg">Recent Donations</h3>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {recentDonations.length > 0 ? (
                    recentDonations.map((donation) => (
                      <div key={donation._id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 text-sm truncate">
                            {donation.foodType}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">
                          {donation.quantity}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDate(donation.createdAt)}
                        </div>
                        {donation.recipient && (
                          <div className="text-xs text-slate-500 mt-1">
                            Claimed by: {donation.recipient.name}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-slate-500 text-sm">No donations yet</p>
                      <button 
                        onClick={() => setActiveTab('donate')}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-1"
                      >
                        Create your first donation
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-serif font-normal text-slate-900 text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 group">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-slate-900 text-sm">Safety Guidelines</div>
                      <div className="text-slate-500 text-xs font-light">Food handling standards</div>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 group">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-slate-900 text-sm">Tax Documents</div>
                      <div className="text-slate-500 text-xs font-light">Download receipts</div>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 group">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-slate-900 text-sm">Help Center</div>
                      <div className="text-slate-500 text-xs font-light">Get support</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}