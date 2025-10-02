import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "donor",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      if (response.data && response.data.user && response.data.token) {
        login(response.data.user, response.data.token);
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
      
    } catch (error) {
      console.error('Register error details:', error.response);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
            Join FeedTheNeed
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account and start making a difference
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Create a password (min 6 characters)"
                minLength="6"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your phone number (optional)"
              />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.userType === "donor" 
                    ? "border-emerald-500 bg-emerald-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    value="donor"
                    checked={formData.userType === "donor"}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-2 ${
                    formData.userType === "donor" 
                      ? "border-emerald-500 bg-emerald-500" 
                      : "border-gray-300"
                  }`}>
                    {formData.userType === "donor" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    formData.userType === "donor" ? "text-emerald-700" : "text-gray-700"
                  }`}>
                    Donate Food
                  </span>
                  <p className="text-xs text-gray-500 mt-1 text-center">Share surplus food with your community</p>
                </label>
                
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.userType === "recipient" 
                    ? "border-emerald-500 bg-emerald-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    value="recipient"
                    checked={formData.userType === "recipient"}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-2 ${
                    formData.userType === "recipient" 
                      ? "border-emerald-500 bg-emerald-500" 
                      : "border-gray-300"
                  }`}>
                    {formData.userType === "recipient" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    formData.userType === "recipient" ? "text-emerald-700" : "text-gray-700"
                  }`}>
                    Receive Food
                  </span>
                  <p className="text-xs text-gray-500 mt-1 text-center">Find and request available food donations</p>
                </label>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100/50 rounded-xl border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Development Information:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>API Base: http://localhost:9900/api</p>
              <p>Endpoint: /auth/register</p>
              <p>Environment: Development</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}