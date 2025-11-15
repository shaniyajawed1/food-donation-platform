import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { donationAPI } from "../../services/api";
import { Link } from "react-router-dom";

export default function MyImpact() {
  const { user } = useAuth();
  const [impactData, setImpactData] = useState({
    totalDonations: 0,
    completedDonations: 0,
    activeDonations: 0,
    expiredDonations: 0,
    reservedDonations: 0,
    mealsProvided: 0,
    co2Reduced: 0,
    waterSaved: 0,
    moneySaved: 0,
    peopleHelped: 0,
    foodCategories: {},
    monthlyTrend: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("all");

  useEffect(() => {
    if (user) {
      loadImpactData();
    }
  }, [user, timeframe]);
  const isDonationExpired = (donation) => {
    if (!donation.expiryDate) return false;
    const today = new Date();
    const expiry = new Date(donation.expiryDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today;
  };
  const getActualStatus = (donation) => {
    if (donation.status === 'expired' || donation.status === 'cancelled' || donation.status === 'completed') {
      return donation.status;
    }
    if (isDonationExpired(donation)) {
      return 'expired';
    }
    return donation.status;
  };

  const loadImpactData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await donationAPI.getMyDonations();
      const donations = response?.data || [];
      const enhancedDonations = donations.map(donation => ({
        ...donation,
        actualStatus: getActualStatus(donation)
      }));

      calculateImpact(enhancedDonations);
      loadRecentActivity(enhancedDonations);
      
    } catch (error) {
      console.error("Error loading impact data:", error);
      setError("Failed to load your impact data. Please try again later.");
      setImpactData({
        totalDonations: 0,
        completedDonations: 0,
        activeDonations: 0,
        expiredDonations: 0,
        reservedDonations: 0,
        mealsProvided: 0,
        co2Reduced: 0,
        waterSaved: 0,
        moneySaved: 0,
        peopleHelped: 0,
        foodCategories: {},
        monthlyTrend: []
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateImpact = (donations) => {
    const completedDonations = donations.filter(d => d.actualStatus === 'completed');
    const activeDonations = donations.filter(d => d.actualStatus === 'available');
    const expiredDonations = donations.filter(d => d.actualStatus === 'expired');
    const reservedDonations = donations.filter(d => d.actualStatus === 'reserved');
    const mealsProvided = completedDonations.reduce((total, donation) => {
      const quantity = extractQuantity(donation.quantity);
      const meals = quantity * getMealMultiplier(donation.foodType);
      return total + meals;
    }, 0);
    const co2Reduced = mealsProvided * 2.5; 
    const waterSaved = mealsProvided * 1250; 
    const moneySaved = mealsProvided * 12; 
    const peopleHelped = Math.round(mealsProvided / 3); 
    const foodCategories = donations.reduce((acc, donation) => {
      const category = donation.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    const monthlyTrend = calculateMonthlyTrend(donations);

    const newImpactData = {
      totalDonations: donations.length,
      completedDonations: completedDonations.length,
      activeDonations: activeDonations.length,
      expiredDonations: expiredDonations.length,
      reservedDonations: reservedDonations.length,
      mealsProvided,
      co2Reduced: Math.round(co2Reduced),
      waterSaved: Math.round(waterSaved),
      moneySaved: Math.round(moneySaved),
      peopleHelped,
      foodCategories,
      monthlyTrend
    };

    setImpactData(newImpactData);
  };

  const getMealMultiplier = (foodType) => {
    const type = foodType?.toLowerCase() || '';
    if (type.includes('vegetable') || type.includes('fruit') || type.includes('produce')) return 8;
    if (type.includes('bread') || type.includes('bakery') || type.includes('pastry')) return 6;
    if (type.includes('meal') || type.includes('prepared') || type.includes('cooked')) return 4;
    if (type.includes('meat') || type.includes('protein')) return 3;
    return 5; 
  };

  const calculateMonthlyTrend = (donations) => {
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthDonations = donations.filter(d => {
        const donationDate = new Date(d.createdAt);
        return donationDate.getMonth() === date.getMonth() && 
               donationDate.getFullYear() === date.getFullYear();
      });
      
      last6Months.push({
        month: monthKey,
        donations: monthDonations.length,
        completed: monthDonations.filter(d => d.actualStatus === 'completed').length
      });
    }
    
    return last6Months;
  };

  const extractQuantity = (quantityString) => {
    if (!quantityString) return 1;
    const match = quantityString.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const loadRecentActivity = (donations) => {
    const recent = donations
      .filter(d => d.actualStatus === 'completed' || d.actualStatus === 'reserved' || d.actualStatus === 'expired')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(donation => ({
        id: donation._id,
        foodType: donation.foodType,
        quantity: donation.quantity,
        date: donation.createdAt,
        status: donation.actualStatus,
        recipient: getRecipientName(donation),
        impact: calculateDonationImpact(donation)
      }));

    setRecentActivity(recent);
  };

  const getRecipientName = (donation) => {
    if (donation.actualStatus === 'completed' && donation.recipient) {
      return donation.recipient.name || 'Community Member';
    }
    if (donation.actualStatus === 'expired') {
      return 'Not Claimed';
    }
    return donation.actualStatus === 'reserved' ? 'Pending Pickup' : 'Available';
  };

  const calculateDonationImpact = (donation) => {
    const quantity = extractQuantity(donation.quantity);
    const meals = quantity * getMealMultiplier(donation.foodType);
    return {
      meals,
      co2: meals * 2.5,
      water: meals * 1250
    };
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'reserved': return 'text-blue-600 bg-blue-100';
      case 'available': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Delivered';
      case 'reserved': return 'Reserved';
      case 'available': return 'Available';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getTopFoodCategory = () => {
    const categories = Object.entries(impactData.foodCategories);
    if (categories.length === 0) return 'No donations yet';
    
    const topCategory = categories.reduce((max, [category, count]) => 
      count > max[1] ? [category, count] : max, ['', 0]
    );
    
    return `${topCategory[0]} (${topCategory[1]})`;
  };
  const ImpactIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const CO2Icon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const WaterIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  );

  const PeopleIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const FoodIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );

  const MoneyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PackageIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-green-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-green-200 rounded w-96 mb-12"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                  <div className="h-12 bg-green-200 rounded w-12 mb-4"></div>
                  <div className="h-4 bg-green-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-green-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Impact Dashboard</h1>
              <p className="text-gray-600 text-lg">
                See how your food donations are making a difference
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <Link
                to="/donor/dashboard"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
              >
                + New Donation
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-yellow-700">{error}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <ImpactIcon />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Impact</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{impactData.mealsProvided}</p>
                <p className="text-xs text-gray-500">Meals provided to community</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <CO2Icon />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">CO₂ Reduced</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(impactData.co2Reduced)}kg</p>
                <p className="text-xs text-gray-500">Carbon emissions saved</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <WaterIcon />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Water Saved</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(impactData.waterSaved)}L</p>
                <p className="text-xs text-gray-500">Water conservation</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <PeopleIcon />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">People Helped</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{impactData.peopleHelped}</p>
                <p className="text-xs text-gray-500">Community members supported</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Donation Statistics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {impactData.completedDonations}
                  </div>
                  <div className="text-sm font-medium text-green-700">Completed</div>
                  <div className="text-xs text-green-600 mt-1">Successfully delivered</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {impactData.activeDonations}
                  </div>
                  <div className="text-sm font-medium text-blue-700">Active</div>
                  <div className="text-xs text-blue-600 mt-1">Available now</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {impactData.reservedDonations}
                  </div>
                  <div className="text-sm font-medium text-orange-700">Reserved</div>
                  <div className="text-xs text-orange-600 mt-1">Awaiting pickup</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    {impactData.expiredDonations}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Expired</div>
                  <div className="text-xs text-gray-600 mt-1">Past expiry</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <FoodIcon />
                    </div>
                    <h4 className="font-semibold text-gray-900">Top Food Category</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {getTopFoodCategory()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Most donated food type</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <MoneyIcon />
                    </div>
                    <h4 className="font-semibold text-gray-900">Economic Impact</h4>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(impactData.moneySaved)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total value saved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <ChartIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Activity</h3>
              </div>
              
              <div className="space-y-4">
                {impactData.monthlyTrend.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-20">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (month.donations / Math.max(1, Math.max(...impactData.monthlyTrend.map(m => m.donations)))) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {month.donations} donations
                    </span>
                  </div>
                ))}
              </div>
              
              {impactData.monthlyTrend.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <ChartIcon />
                  </div>
                  <p className="text-gray-500">No donation history yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start donating to see your trends</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(activity.status)}`}>
                        {activity.status === 'completed' ? (
                          <CheckIcon />
                        ) : activity.status === 'expired' ? (
                          <ClockIcon />
                        ) : (
                          <ClockIcon />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {activity.foodType}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                            {getStatusText(activity.status)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {activity.quantity} • {formatDate(activity.date)}
                        </div>
                        <div className="text-xs text-green-600">
                          {activity.status === 'completed' 
                            ? `Provided ${activity.impact.meals} meals`
                            : activity.status === 'expired'
                            ? 'Expired before claim'
                            : `Reserved for pickup`
                          }
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <PackageIcon />
                    </div>
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-gray-400 text-sm mt-1">Your donations will appear here</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Impact Milestones</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">First Donation</span>
                  <span className={`text-sm font-medium ${impactData.totalDonations > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {impactData.totalDonations > 0 ? 'Achieved' : 'Not started'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">10 Meals Provided</span>
                  <span className={`text-sm font-medium ${impactData.mealsProvided >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    {impactData.mealsProvided >= 10 ? 'Achieved' : `${impactData.mealsProvided}/10`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">5 Donations</span>
                  <span className={`text-sm font-medium ${impactData.completedDonations >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                    {impactData.completedDonations >= 5 ? 'Achieved' : `${impactData.completedDonations}/5`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Community Hero</span>
                  <span className={`text-sm font-medium ${impactData.mealsProvided >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                    {impactData.mealsProvided >= 50 ? 'Achieved' : `${impactData.mealsProvided}/50`}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-3">Keep Making Impact</h3>
              <p className="text-green-100 text-sm mb-4">
                Continue your journey in fighting food waste and helping your community.
              </p>
              <Link
                to="/donor/dashboard"
                className="block w-full bg-white text-green-600 font-semibold py-3 rounded-lg hover:bg-green-50 transition-colors text-center"
              >
                Donate More Food
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}