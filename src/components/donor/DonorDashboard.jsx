import { useState } from 'react';
import FoodListingForm from './FoodListingForm';
import DonationHistory from './DonationHistory';

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState('donate');

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
                Manage your food donations and track your impact
              </p>
            </div>
           
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200">
            <button
              className={`flex items-center justify-center space-x-3 py-5 px-8 font-medium transition-all duration-300 ${
                activeTab === 'donate' 
                  ? 'text-amber-700 border-b-2 border-amber-700 bg-amber-50/50' 
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
              className={`flex items-center justify-center space-x-3 py-5 px-8 font-medium transition-all duration-300 ${
                activeTab === 'history' 
                  ? 'text-amber-700 border-b-2 border-amber-700 bg-amber-50/50' 
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
            {activeTab === 'donate' && <FoodListingForm />}
            {activeTab === 'history' && <DonationHistory />}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Safety Guidelines</h3>
                <p className="text-slate-600 text-sm font-light mt-1">Review food safety standards</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Tax Documents</h3>
                <p className="text-slate-600 text-sm font-light mt-1">Download donation receipts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Help Center</h3>
                <p className="text-slate-600 text-sm font-light mt-1">Get assistance anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}