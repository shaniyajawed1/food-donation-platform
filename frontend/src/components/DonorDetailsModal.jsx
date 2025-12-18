import { useState, useEffect } from 'react';

const DonorDetailsModal = ({ isOpen, onClose, donor }) => {
  const [activeTab, setActiveTab] = useState('ratings');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !donor) return null;


  const donorData = {
    name: donor.name || 'Anonymous Donor',
    email: donor.email || 'Not provided',
    phone: donor.phone || 'Not provided',
    joinDate: donor.joinDate || '2024-01-01',
    totalDonations: donor.totalDonations || 12,
    rating: donor.rating || 4.7,
    reviews: donor.reviews || 28,
    certificates: [
      { name: 'Food Safety Certificate', issued: '2024-01-15', validUntil: '2025-01-15' },
      { name: 'Health Department License', issued: '2024-02-01', validUntil: '2025-02-01' },
      { name: 'Food Handler Certificate', issued: '2024-01-20', validUntil: '2026-01-20' }
    ],
    ratings: [
      { user: 'Sarah M.', rating: 5, comment: 'Great quality food, very professional!', date: '2024-03-15' },
      { user: 'Mike R.', rating: 4, comment: 'Food was fresh and delivered on time.', date: '2024-03-10' },
      { user: 'Priya K.', rating: 5, comment: 'Very generous donor. Highly recommended!', date: '2024-03-08' }
    ]
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{donorData.name}</h2>
              <p className="text-emerald-100 mt-1">Verified Food Donor</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{donorData.totalDonations}</div>
              <div className="text-emerald-100 text-sm">Total Donations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{donorData.rating}</div>
              <div className="text-emerald-100 text-sm">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{donorData.reviews}</div>
              <div className="text-emerald-100 text-sm">Reviews</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('ratings')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === 'ratings'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ratings & Reviews
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === 'certificates'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Certificates
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === 'info'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contact Info
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'ratings' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{donorData.rating}</div>
                  {renderStars(Math.floor(donorData.rating))}
                  <div className="text-sm text-amber-600 mt-1">{donorData.reviews} reviews</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Overall Rating</h4>
                  <p className="text-sm text-gray-600">
                    Based on feedback from recipients who received donations from {donorData.name}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {donorData.ratings.map((review, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{review.user}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Verified Certificates</h4>
                    <p className="text-sm text-gray-600">All certificates are validated and up-to-date</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {donorData.certificates.map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{cert.name}</h5>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Valid
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Issued:</span>
                        <span className="text-gray-900 ml-2">{new Date(cert.issued).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valid Until:</span>
                        <span className="text-gray-900 ml-2">{new Date(cert.validUntil).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">{donorData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">{donorData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Donor Since</h4>
                <p className="text-gray-600">
                  {new Date(donorData.joinDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-800">Contact Information</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      Contact details are only shared after you request a donation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDetailsModal;