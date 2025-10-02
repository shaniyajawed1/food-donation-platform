// src/components/Header.js
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Icons } from '../Icons.jsx';

export default function Header() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 text-white shadow-2xl border-b border-emerald-600/30 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300">
                <Icons.Logo />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-light tracking-wide text-white">FeedTheNeed</span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-green-300 mt-1 rounded-full"></div>
            </div>
          </Link>
          
          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-1">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-light group relative ${
                location.pathname === "/" 
                  ? "bg-white/10 text-emerald-50 shadow-inner border border-white/10" 
                  : "hover:bg-white/5 text-emerald-100 border border-transparent"
              }`}
            >
              <Icons.Home />
              <span className="relative z-10">Home</span>
              {location.pathname === "/" && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-emerald-300 rounded-full"></div>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/donor" 
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-light group relative ${
                    location.pathname === "/donor" 
                      ? "bg-white/10 text-emerald-50 shadow-inner border border-white/10" 
                      : "hover:bg-white/5 text-emerald-100 border border-transparent"
                  }`}
                >
                  <Icons.Donate />
                  <span className="relative z-10">Donate Food</span>
                  {location.pathname === "/donor" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-emerald-300 rounded-full"></div>
                  )}
                </Link>
                
                <Link 
                  to="/recipient" 
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-light group relative ${
                    location.pathname === "/recipient" 
                      ? "bg-white/10 text-emerald-50 shadow-inner border border-white/10" 
                      : "hover:bg-white/5 text-emerald-100 border border-transparent"
                  }`}
                >
                  <Icons.Find />
                  <span className="relative z-10">Find Food</span>
                  {location.pathname === "/recipient" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-emerald-300 rounded-full"></div>
                  )}
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-emerald-600/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg border border-emerald-300/30">
                      <Icons.User />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-emerald-200">Welcome back</span>
                      <span className="text-white font-medium">{user?.name}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 group relative bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 border border-rose-500/30"
                  >
                    <Icons.Logout />
                    <span className="text-sm font-light">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/about" 
                  className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-light hover:bg-white/5 text-emerald-100 border border-transparent hover:border-white/5"
                >
                  <Icons.About />
                  <span>About</span>
                </Link>
                
                <Link 
                  to="/contact" 
                  className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-light hover:bg-white/5 text-emerald-100 border border-transparent hover:border-white/5"
                >
                  <Icons.Contact />
                  <span>Contact</span>
                </Link>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-emerald-600/40">
                  <Link 
                    to="/login" 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-light group ${
                      location.pathname === "/login" 
                        ? "bg-white/10 text-emerald-50 shadow-inner border border-white/10" 
                        : "hover:bg-white/5 text-emerald-100 border border-emerald-500/30"
                    }`}
                  >
                    <Icons.User />
                    <span>Login</span>
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="flex items-center gap-2 group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/30 font-light"
                  >
                    <span className="text-white">Get Started</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}