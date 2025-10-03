// src/pages/DonorPortal.jsx
import { useAuth } from '../contexts/AuthContext';
import DonorDashboard from '../components/donor/DonorDashboard';
import { Link, Navigate } from 'react-router-dom';

export default function DonorPortal() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to access donor features</p>
          <Link to="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is a donor
  if (user?.userType !== 'donor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This area is for food donors only. You're registered as a recipient.
          </p>
          <Link to="/recipient" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
            Go to Recipient Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <DonorDashboard />
    </div>
  );
}