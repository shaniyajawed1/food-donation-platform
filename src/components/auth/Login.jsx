import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      console.log('🔄 Attempting login...', formData.email);
      
      // ✅ TRY DIFFERENT DATA FORMATS
      const loginData = {
        // Try format 1: email field
        email: formData.email,
        password: formData.password
      };

      // Alternative format - uncomment if above doesn't work:
      // const loginData = {
      //   // Try format 2: username field  
      //   username: formData.email,
      //   password: formData.password
      // };

      console.log('📤 Sending login data:', loginData);
      
      const response = await authAPI.login(loginData);
      
      console.log('🔍 Login response:', response);
      
      if (response.status >= 200 && response.status < 300) {
        if (response.data && response.data.user) {
          console.log('✅ Login successful, setting user context...');
          login(response.data.user, response.data.token);
          navigate("/");
        } else {
          throw new Error("Invalid user data in response");
        }
      } else {
        throw new Error(response.data?.error || "Login failed");
      }
      
    } catch (error) {
      console.log('🔍 Login error details:', error);
      
      // ✅ BETTER ERROR DISPLAY - show the actual backend response
      if (error.response?.data) {
        console.log('📋 Full error response:', error.response.data);
        // Try to get the error message from different possible locations
        const errorMessage = error.response.data.error || 
                           error.response.data.message || 
                           error.response.data.details ||
                           "Login failed";
        setError(errorMessage);
      } else if (error.request) {
        setError("No response from server. Please check if backend is running.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ⚠️ {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-t-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-b-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link to="/register" className="text-green-600 hover:text-green-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}