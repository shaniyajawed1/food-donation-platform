import { useState, useRef } from 'react';
import { donationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FoodListingForm = () => {
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    description: '',
    expiryDate: '',
    pickupLocation: '',
    allergens: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      setImages(files.slice(0, 5));
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const donationData = {
        ...formData,
        donorId: user.id
      };
      
      await donationAPI.create(donationData);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          foodType: '',
          quantity: '',
          description: '',
          expiryDate: '',
          pickupLocation: '',
          allergens: ''
        });
        setImages([]);
        setCurrentStep(1);
      }, 3000);
      
    } catch (error) {
      alert('Error listing food: ' + (error.response?.data?.message || error.message));
    }
    
    setLoading(false);
  };

  // Progress steps
  const steps = [
    { number: 1, title: "Food Details", icon: "🍕" },
    { number: 2, title: "Location & Time", icon: "📍" },
    { number: 3, title: "Review & Submit", icon: "📝" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 py-8 px-4">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 animate-scale-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Success!</h3>
            <p className="text-gray-600 mb-6">Your food listing is live! Someone nearby will be grateful for your donation.</p>
            <div className="text-green-500 text-sm">Redirecting in 3 seconds...</div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl text-white">🎁</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700">
            Share Your Food
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your surplus food into someone's blessing. List it in just 2 minutes!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex flex-col items-center transition-all duration-500 ${
                  currentStep >= step.number ? 'scale-110' : 'scale-100 opacity-50'
                }`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3 transition-all duration-500 ${
                    currentStep >= step.number 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep > step.number ? '✓' : step.icon}
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${
                    currentStep >= step.number ? 'text-cyan-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
                    currentStep > step.number ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
          
          {/* Step 1: Food Details */}
          {currentStep === 1 && (
            <div className="p-8 animate-slide-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div 
                  className="border-3 border-dashed border-cyan-300 rounded-2xl p-8 text-center bg-gradient-to-br from-cyan-50 to-blue-50 cursor-pointer transition-all duration-300 hover:border-cyan-500 hover:scale-105"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-6xl mb-4">📸</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Add Food Photos</h3>
                  <p className="text-gray-600 mb-4">Drag & drop or click to upload</p>
                  <p className="text-sm text-gray-500">Max 5 images • JPG, PNG</p>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                    id="foodImages"
                  />
                  
                  {images.length > 0 && (
                    <div className="mt-6 p-4 bg-white rounded-xl border border-cyan-200">
                      <p className="text-cyan-600 font-semibold mb-2">
                        {images.length} image(s) selected
                      </p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {images.map((file, index) => (
                          <div key={index} className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                            {file.name.slice(0, 10)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Food Details */}
                <div className="space-y-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Food Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.foodType}
                      onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 text-lg"
                      placeholder="e.g., Fresh Fruits, Cooked Meals, Bakery Items"
                    />
                  </div>

                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 text-lg"
                      placeholder="e.g., 5 kg, 10 servings, 15 pieces"
                    />
                  </div>

                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 text-lg resize-none"
                      rows="4"
                      placeholder="Describe the food condition, packaging, ingredients, special notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Time */}
          {currentStep === 2 && (
            <div className="p-8 animate-slide-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 text-lg"
                    />
                  </div>

                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 text-lg"
                      placeholder="Full address for pickup with landmarks"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Allergens (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.allergens}
                      onChange={(e) => setFormData({...formData, allergens: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 text-lg"
                      placeholder="e.g., Contains nuts, gluten, dairy, etc."
                    />
                  </div>

                  {/* Pickup Time Suggestions */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                    <h4 className="font-bold text-gray-800 mb-3">Suggested Pickup Times</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['Today Evening', 'Tomorrow Morning', 'Tomorrow Afternoon', 'Flexible'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          className="p-3 bg-white border border-cyan-300 rounded-lg text-sm hover:bg-cyan-500 hover:text-white transition-colors"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="p-8 animate-slide-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👀</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Review Your Listing</h3>
                <p className="text-gray-600">Double-check everything before sharing</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">Food Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {formData.foodType || 'Not specified'}</div>
                      <div><strong>Quantity:</strong> {formData.quantity || 'Not specified'}</div>
                      <div><strong>Description:</strong> {formData.description || 'Not specified'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">Pickup Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Expiry:</strong> {formData.expiryDate || 'Not specified'}</div>
                      <div><strong>Location:</strong> {formData.pickupLocation || 'Not specified'}</div>
                      <div><strong>Allergens:</strong> {formData.allergens || 'None specified'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">
                  You're About to Make Someone's Day!
                </h4>
                <p className="text-green-700 text-sm">
                  Your food donation will be visible to people nearby who need it. 
                  Expect pickup requests within hours!
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8 py-4 border-2 border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              ← Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Listing Food...
                  </>
                ) : (
                  <>
                    PUBLISH LISTING
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-2xl p-4 border border-cyan-200 text-center">
            <div className="text-cyan-600 text-lg mb-1">⏱️</div>
            <div className="font-semibold">Takes 2 minutes</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-blue-200 text-center">
            <div className="text-blue-600 text-lg mb-1">👥</div>
            <div className="font-semibold">Help someone nearby</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-purple-200 text-center">
            <div className="text-purple-600 text-lg mb-1">🌱</div>
            <div className="font-semibold">Reduce food waste</div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FoodListingForm;