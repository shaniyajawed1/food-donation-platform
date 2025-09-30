import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-green-600 text-white shadow-lg">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <span></span>
            <span>FoodShare</span>
          </Link>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === "/" ? "bg-green-700" : "hover:bg-green-500"
              }`}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/donor" 
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === "/donor" ? "bg-green-700" : "hover:bg-green-500"
                  }`}
                >
                  Donate Food
                </Link>
                <Link 
                  to="/recipient" 
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === "/recipient" ? "bg-green-700" : "hover:bg-green-500"
                  }`}
                >
                  Find Food
                </Link>
                <div className="flex items-center gap-2">
                  <span>Welcome, {user?.name}</span>
                  <button 
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === "/login" ? "bg-green-700" : "hover:bg-green-500"
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-green-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
