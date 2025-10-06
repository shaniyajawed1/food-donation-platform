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
    reservedDonations: 0,
    mealsProvided: 0,
    co2Reduced: 0,
    waterSaved: 0,
    moneySaved: 0,
    peopleHelped: 0
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

  const loadImpactData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading impact data for user:", user?.id);
      
      const response = await donationAPI.getMyDonations();
      console.log("API Response:", response);
      
      const donations = response?.data || [];
      console.log("Donations found:", donations.length);
      
      if (donations.length === 0) {
        console.log("No donations found for user");
      }

      calculateImpact(donations);
      loadRecentActivity(donations);
      
    } catch (error) {
      console.error("Error loading impact data:", error);
      setError("Failed to load your impact data. Please try again later.");
      
      // Fallback demo data for development
      setImpactData({
        totalDonations: 8,
        completedDonations: 5,
        activeDonations: 2,
        reservedDonations: 1,
        mealsProvided: 42,
        co2Reduced: 105,
        waterSaved: 42000,
        moneySaved: 336,
        peopleHelped: 15
      });
      
      setRecentActivity([
        {
          id: "demo1",
          foodType: "Fresh Vegetables",
          quantity: "5 kg",
          date: new Date().toISOString(),
          status: "completed",
          recipient: "Community Shelter"
        },
        {
          id: "demo2",
          foodType: "Bakery Items",
          quantity: "3 kg", 
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "completed",
          recipient: "Local Food Bank"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateImpact = (donations) => {
    console.log("Calculating impact from donations:", donations);
    
    const completedDonations = donations.filter(d => d.status === 'completed');
    const activeDonations = donations.filter(d => d.status === 'available');
    const reservedDonations = donations.filter(d => d.status === 'reserved');

    // Calculate meals provided based on quantity field
    const mealsProvided = completedDonations.reduce((total, donation) => {
      const quantity = extractQuantity(donation.quantity);
      return total + quantity;
    }, 0);

    // Impact calculations (approximate)
    const co2Reduced = mealsProvided * 2.5; // kg CO2 per meal saved
    const waterSaved = mealsProvided * 1000; // liters water per meal
    const moneySaved = mealsProvided * 8; // $ value per meal
    const peopleHelped = completedDonations.length * 3; // approx people helped per donation

    const newImpactData = {
      totalDonations: donations.length,
      completedDonations: completedDonations.length,
      activeDonations: activeDonations.length,
      reservedDonations: reservedDonations.length,
      mealsProvided,
      co2Reduced: Math.round(co2Reduced),
      waterSaved: Math.round(waterSaved),
      moneySaved: Math.round(moneySaved),
      peopleHelped
    };

    console.log("Calculated impact data:", newImpactData);
    setImpactData(newImpactData);
  };

  // Helper function to extract quantity from string like "5 kg", "10 items", etc.
  const extractQuantity = (quantityString) => {
    if (!quantityString) return 1;
    
    const match = quantityString.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const loadRecentActivity = (donations) => {
    const recent = donations
      .filter(d => d.status === 'completed' || d.status === 'reserved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(donation => ({
        id: donation._id,
        foodType: donation.foodType,
        quantity: donation.quantity,
        date: donation.createdAt,
        status: donation.status,
        recipient: getRecipientName(donation),
        impact: calculateDonationImpact(donation)
      }));

    console.log("Recent activity:", recent);
    setRecentActivity(recent);
  };

  const getRecipientName = (donation) => {
    if (donation.status === 'completed' && donation.recipient) {
      return donation.recipient.name || 'Community Member';
    }
    return donation.status === 'reserved' ? 'Pending Pickup' : 'Available';
  };

  const calculateDonationImpact = (donation) => {
    const quantity = extractQuantity(donation.quantity);
    return {
      meals: quantity,
      co2: quantity * 2.5,
      water: quantity * 1000
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Delivered';
      case 'reserved': return 'Reserved';
      case 'available': return 'Available';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-12"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="h-12 bg-gray-200 rounded w-12 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Impact</h1>
              <p className="text-gray-600 mt-2">
                Track your food donations and environmental impact
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
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                + New Donation
              </Link>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Donations */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{impactData.totalDonations}</p>
                <p className="text-xs text-gray-500">All your contributions</p>
              </div>
            </div>

            {/* Meals Provided */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Meals Provided</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(impactData.mealsProvided)}</p>
                <p className="text-xs text-gray-500">Approximate meals saved</p>
              </div>
            </div>

            {/* CO2 Reduced */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">CO₂ Reduced</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(impactData.co2Reduced)}kg</p>
                <p className="text-xs text-gray-500">Carbon footprint saved</p>
              </div>
            </div>

            {/* People Helped */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats and Progress */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Donation Status Overview */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Donation Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {impactData.completedDonations}
                  </div>
                  <div className="text-sm font-medium text-blue-700">Completed</div>
                  <div className="text-xs text-blue-600 mt-1">Successfully delivered</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {impactData.reservedDonations}
                  </div>
                  <div className="text-sm font-medium text-orange-700">Reserved</div>
                  <div className="text-xs text-orange-600 mt-1">Awaiting pickup</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {impactData.activeDonations}
                  </div>
                  <div className="text-sm font-medium text-green-700">Available</div>
                  <div className="text-xs text-green-600 mt-1">Ready for donation</div>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Environmental Impact</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Food Waste Prevented</span>
                    <span>{impactData.mealsProvided} meals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (impactData.mealsProvided / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Carbon Emissions Reduced</span>
                    <span>{impactData.co2Reduced} kg CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (impactData.co2Reduced / 250) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Water Conservation</span>
                    <span>{formatNumber(impactData.waterSaved)} liters</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (impactData.waterSaved / 50000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Comparison */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Impact Equals</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🌳</span>
                  </div>
                  <div>
                    <div className="font-medium text-green-900">Planting {Math.round(impactData.co2Reduced / 21)} Trees</div>
                    <div className="text-sm text-green-700">Carbon offset equivalent</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💧</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Saving {Math.round(impactData.waterSaved / 1000)}k Liters</div>
                    <div className="text-sm text-blue-700">Water conservation</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🚗</span>
                  </div>
                  <div>
                    <div className="font-medium text-orange-900">{Math.round(impactData.co2Reduced / 8)} Car Days</div>
                    <div className="text-sm text-orange-700">Emissions saved</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div>
                    <div className="font-medium text-purple-900">{impactData.peopleHelped} Families</div>
                    <div className="text-sm text-purple-700">Meals provided</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity and Milestones */}
          <div className="space-y-8">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(activity.status)}`}>
                        <span className="text-xs font-medium">
                          {activity.status === 'completed' ? '✓' : '⏱'}
                        </span>
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
                            ? `Provided ${activity.impact.meals} meals to ${activity.recipient}`
                            : `Reserved for ${activity.recipient}`
                          }
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs mt-1">Your donations will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Milestone */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Milestone</h3>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                
                <div className="font-semibold text-gray-900 mb-2">
                  {Math.max(0, 10 - impactData.completedDonations)} to 10 Deliveries
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (impactData.completedDonations / 10) * 100)}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-600 text-sm">
                  {impactData.completedDonations} of 10 completed donations
                </p>
                
                {impactData.completedDonations >= 10 && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 text-sm font-medium">🎉 Milestone achieved!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold text-lg mb-3">Share Your Impact</h3>
              <p className="text-green-100 text-sm mb-4">
                Inspire others by sharing your food rescue journey and environmental impact.
              </p>
              <button className="w-full bg-white text-green-600 font-semibold py-2 rounded-lg hover:bg-green-50 transition-colors">
                Share My Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}