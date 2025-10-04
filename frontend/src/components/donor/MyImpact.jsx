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
    mealsProvided: 0,
    co2Reduced: 0, 
    waterSaved: 0, 
    moneySaved: 0, 
    peopleHelped: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all"); 

  useEffect(() => {
    if (user) {
      loadImpactData();
    }
  }, [user, timeframe]);

  const loadImpactData = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getMyDonations();
      const donations = response.data;
      
      calculateImpact(donations);
      loadRecentActivity(donations);
    } catch (error) {
      console.error("Error loading impact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateImpact = (donations) => {
    const completedDonations = donations.filter(d => d.status === 'completed');
    const activeDonations = donations.filter(d => d.status === 'available' || d.status === 'claimed');
    const mealsProvided = completedDonations.reduce((total, donation) => {
      const quantityMatch = donation.quantity.match(/\d+/);
      const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 0;
      return total + quantity;
    }, 0);
    const co2Reduced = mealsProvided * 2.5; 
    const waterSaved = mealsProvided * 1000; 
    const moneySaved = mealsProvided * 8; 
    const peopleHelped = completedDonations.length * 3; 

    setImpactData({
      totalDonations: donations.length,
      completedDonations: completedDonations.length,
      activeDonations: activeDonations.length,
      mealsProvided,
      co2Reduced: Math.round(co2Reduced),
      waterSaved: Math.round(waterSaved),
      moneySaved: Math.round(moneySaved),
      peopleHelped
    });
  };

  const loadRecentActivity = (donations) => {
    const recent = donations
      .filter(d => d.status === 'completed')
      .slice(0, 5)
      .map(donation => ({
        id: donation._id,
        foodType: donation.foodType,
        quantity: donation.quantity,
        date: donation.createdAt,
        recipient: donation.recipient?.name || 'Anonymous',
        impact: calculateDonationImpact(donation)
      }));
    
    setRecentActivity(recent);
  };

  const calculateDonationImpact = (donation) => {
    const quantityMatch = donation.quantity.match(/\d+/);
    const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 0;
    return {
      meals: quantity,
      co2: quantity * 2.5,
      water: quantity * 1000
    };
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeframeText = () => {
    switch (timeframe) {
      case 'month': return 'this month';
      case 'year': return 'this year';
      default: return 'all time';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50/30 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-12"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50/30 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-normal text-slate-900 tracking-tight">
                My Impact
              </h1>
              <p className="text-slate-600 font-light mt-2">
                See the difference you're making in your community and the environment
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <Link
                to="/donor/dashboard"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                + New Donation
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-light mb-1">Meals Provided</p>
                <p className="text-3xl font-serif font-normal text-slate-900 mb-2">
                  {formatNumber(impactData.mealsProvided)}
                </p>
                <p className="text-xs text-slate-500">
                  Enough to feed {Math.ceil(impactData.mealsProvided / 3)} people for a day
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-light mb-1">CO₂ Reduced</p>
                <p className="text-3xl font-serif font-normal text-slate-900 mb-2">
                  {formatNumber(impactData.co2Reduced)}kg
                </p>
                <p className="text-xs text-slate-500">
                  Equivalent to {Math.round(impactData.co2Reduced / 8)} car days
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-light mb-1">Water Saved</p>
                <p className="text-3xl font-serif font-normal text-slate-900 mb-2">
                  {formatNumber(impactData.waterSaved)}L
                </p>
                <p className="text-xs text-slate-500">
                  Enough for {Math.round(impactData.waterSaved / 150)} person-months
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-light mb-1">Value Created</p>
                <p className="text-3xl font-serif font-normal text-slate-900 mb-2">
                  ${formatNumber(impactData.moneySaved)}
                </p>
                <p className="text-xs text-slate-500">
                  Economic value of food rescued
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
              <h3 className="text-xl font-serif font-normal text-slate-900 mb-6">
                Your Donation Journey
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-2xl font-serif font-normal text-emerald-600 mb-2">
                    {impactData.totalDonations}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Total Donations</div>
                  <div className="text-xs text-emerald-600 mt-1">All time contributions</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-serif font-normal text-blue-600 mb-2">
                    {impactData.completedDonations}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Successfully Delivered</div>
                  <div className="text-xs text-blue-600 mt-1">Made a direct impact</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-serif font-normal text-purple-600 mb-2">
                    {impactData.peopleHelped}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">People Helped</div>
                  <div className="text-xs text-purple-600 mt-1">Lives touched</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Environmental Impact
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Carbon Footprint Reduced</span>
                      <span>{impactData.co2Reduced} kg CO₂</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (impactData.co2Reduced / 500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Water Conservation</span>
                      <span>{formatNumber(impactData.waterSaved)} liters</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (impactData.waterSaved / 10000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Food Waste Prevented</span>
                      <span>{impactData.mealsProvided} meals</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (impactData.mealsProvided / 200) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-serif font-normal text-slate-900 mb-6">
                Your Impact in Perspective
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-600 text-lg">🌍</span>
                    </div>
                    <div>
                      <div className="font-semibold text-emerald-900">Carbon Impact</div>
                      <div className="text-sm text-emerald-700">
                        Equivalent to planting {Math.round(impactData.co2Reduced / 21)} trees
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">💧</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">Water Impact</div>
                      <div className="text-sm text-blue-700">
                        Enough for {Math.round(impactData.waterSaved / 5000)} months of showers
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-amber-600 text-lg">🚗</span>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Travel Impact</div>
                      <div className="text-sm text-amber-700">
                        Equal to {Math.round(impactData.co2Reduced / 8)} car-free days
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">👥</span>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-900">Community Impact</div>
                      <div className="text-sm text-purple-700">
                        Helped {impactData.peopleHelped} neighbors in need
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-serif font-normal text-slate-900 text-lg mb-4">
                  Recent Impact
                </h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors duration-200">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 text-sm">✓</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 text-sm">
                            {activity.foodType}
                          </div>
                          <div className="text-xs text-slate-500 mb-1">
                            {activity.quantity} • {formatDate(activity.date)}
                          </div>
                          <div className="text-xs text-emerald-600">
                            Provided {activity.impact.meals} meals to {activity.recipient}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm">No completed donations yet</p>
                      <p className="text-slate-400 text-xs mt-1">Your impact will appear here</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="font-serif font-normal text-lg mb-3">
                  Share Your Impact
                </h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Inspire others by sharing how you're making a difference in your community.
                </p>
                <button className="w-full bg-white text-emerald-600 font-semibold py-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300">
                  Share My Story
                </button>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-serif font-normal text-slate-900 text-lg mb-4">
                  Next Milestone
                </h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-amber-600 text-2xl">🎯</span>
                  </div>
                  <div className="font-semibold text-slate-900 mb-2">
                    {50 - impactData.completedDonations} to 50 Deliveries
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(impactData.completedDonations / 50) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-600 text-sm">
                    {impactData.completedDonations} of 50 completed donations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}