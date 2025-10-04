import { useState, useRef } from "react";
import { donationAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const FoodListingForm = ({ onSuccess }) => {  
  const [formData, setFormData] = useState({
    foodType: "",
    quantity: "",
    description: "",
    expiryDate: "",
    pickupLocation: "",
    allergens: "",
    pickupTime: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const icons = {
    camera: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    food: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
        />
      </svg>
    ),
    location: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    review: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    check: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    clock: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
    leaf: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
        />
      </svg>
    ),
    arrowLeft: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    ),
    arrowRight: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    ),
    heart: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      toast.error("Please upload only JPG, PNG, or WebP images");
    }

    setImages(validFiles.slice(0, 5));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-emerald-500", "bg-emerald-50");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-emerald-500", "bg-emerald-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-emerald-500", "bg-emerald-50");

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type.startsWith("image/") &&
        ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (files.length > 0) {
      if (files.length > 5) {
        toast.error("Maximum 5 images allowed. Selected first 5 files.");
      }
      setImages(files.slice(0, 5));
    } else {
      toast.error("Please drop valid image files (JPG, PNG, WebP)");
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (
        !formData.foodType.trim() ||
        !formData.quantity.trim() ||
        !formData.description.trim()
      ) {
        toast.error("Please fill in all required food details");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.expiryDate || !formData.pickupLocation.trim()) {
        toast.error("Please fill in all required pickup information");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.foodType ||
      !formData.quantity ||
      !formData.description ||
      !formData.expiryDate ||
      !formData.pickupLocation
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const donationData = {
        ...formData,
        donorId: user?.id,
        images: images,
        status: "available",
        createdAt: new Date().toISOString(),
      };

      await donationAPI.create(donationData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          foodType: "",
          quantity: "",
          description: "",
          expiryDate: "",
          pickupLocation: "",
          allergens: "",
          pickupTime: "",
        });
        setImages([]);
        setCurrentStep(1);
        if (onSuccess) {
          onSuccess();
        }
        toast.success("Donation created successfully!");
        
      }, 2000);
      
    } catch (error) {
      console.error("Error listing food:", error);
      toast.error(
        "Error listing food: " +
          (error.response?.data?.message || error.message || "Please try again")
      );
    }

    setLoading(false);
  };

  const handlePickupTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, pickupTime: time }));
  };

  const steps = [
    { number: 1, title: "Food Details", icon: icons.food },
    { number: 2, title: "Location & Time", icon: icons.location },
    { number: 3, title: "Review & Submit", icon: icons.review },
  ];
  const suggestedTimes = [
    { value: "today-evening", label: "Today Evening (5-8 PM)" },
    { value: "tomorrow-morning", label: "Tomorrow Morning (8-11 AM)" },
    { value: "tomorrow-afternoon", label: "Tomorrow Afternoon (1-4 PM)" },
    { value: "flexible", label: "Flexible Timing" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-8 px-4">
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 animate-scale-in shadow-2xl border border-emerald-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {icons.success}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Success!</h3>
            <p className="text-gray-600 mb-6">
              Your food listing is live! Someone nearby will be grateful for
              your donation.
            </p>
            <div className="text-emerald-600 text-sm font-semibold animate-pulse">
              Refreshing dashboard...
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            {icons.food}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Share Your Food
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Turn your surplus food into someone's blessing. List it in just 2
            minutes!
          </p>
        </div>
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4 lg:space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex flex-col items-center transition-all duration-500 ${
                    currentStep >= step.number
                      ? "scale-105"
                      : "scale-100 opacity-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-500 ${
                      currentStep >= step.number
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {currentStep > step.number ? icons.check : step.icon}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors text-center ${
                      currentStep >= step.number
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 lg:w-16 h-1 rounded-full transition-all duration-500 ${
                      currentStep > step.number
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {currentStep === 1 && (
            <div className="p-6 lg:p-8 animate-slide-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-emerald-50 cursor-pointer transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-100"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-emerald-600 mb-4 mx-auto">
                    {icons.camera}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Add Food Photos
                  </h3>
                  <p className="text-gray-600 mb-2 text-sm">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-500">
                    Max 5 images • JPG, PNG, WebP
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                    id="foodImages"
                  />

                  {images.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
                      <p className="text-emerald-600 font-medium mb-2 text-sm">
                        {images.length} image(s) selected
                      </p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {images.map((file, index) => (
                          <div
                            key={index}
                            className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <span className="max-w-[60px] truncate text-xs">
                              {file.name.slice(0, 8)}...
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.foodType}
                      onChange={(e) =>
                        setFormData({ ...formData, foodType: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 placeholder-gray-400"
                      placeholder="e.g., Fresh Fruits, Cooked Meals, Bakery Items"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 placeholder-gray-400"
                      placeholder="e.g., 5 kg, 10 servings, 15 pieces"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 resize-none placeholder-gray-400"
                      rows="4"
                      placeholder="Describe the food condition, packaging, ingredients, special notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="p-6 lg:p-8 animate-slide-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <textarea
                      required
                      value={formData.pickupLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pickupLocation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 resize-none placeholder-gray-400"
                      rows="3"
                      placeholder="Full address for pickup with landmarks..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergens (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.allergens}
                      onChange={(e) =>
                        setFormData({ ...formData, allergens: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 placeholder-gray-400"
                      placeholder="e.g., Contains nuts, gluten, dairy, etc."
                    />
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      {icons.clock}
                      Preferred Pickup Time
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestedTimes.map((time) => (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => handlePickupTimeSelect(time.value)}
                          className={`p-3 bg-white border rounded-lg text-left transition-all duration-300 ${
                            formData.pickupTime === time.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 hover:border-emerald-300"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {time.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="p-6 lg:p-8 animate-slide-in">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {icons.review}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Review Your Listing
                </h3>
                <p className="text-gray-600">
                  Double-check everything before sharing
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      {icons.food}
                      Food Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <strong className="text-gray-600">Type:</strong>
                        <span className="text-gray-900">
                          {formData.foodType || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <strong className="text-gray-600">Quantity:</strong>
                        <span className="text-gray-900">
                          {formData.quantity || "Not specified"}
                        </span>
                      </div>
                      <div className="py-1">
                        <strong className="text-gray-600 block mb-1">
                          Description:
                        </strong>
                        <span className="text-gray-900">
                          {formData.description || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      {icons.location}
                      Pickup Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <strong className="text-gray-600">Expiry:</strong>
                        <span className="text-gray-900">
                          {formData.expiryDate || "Not specified"}
                        </span>
                      </div>
                      <div className="py-1 border-b border-gray-100">
                        <strong className="text-gray-600 block mb-1">
                          Location:
                        </strong>
                        <span className="text-gray-900">
                          {formData.pickupLocation || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <strong className="text-gray-600">Allergens:</strong>
                        <span className="text-gray-900">
                          {formData.allergens || "None specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Uploaded Images ({images.length})
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((file, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center"
                      >
                        <span className="text-xs text-gray-600 text-center px-1 truncate">
                          {file.name.split(".")[0].slice(0, 6)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                  {icons.heart}
                  You're About to Make Someone's Day!
                </h4>
                <p className="text-emerald-700 text-sm">
                  Your food donation will be visible to people nearby who need
                  it. Expect pickup requests within hours!
                </p>
              </div>
            </div>
          )}
          <div className="px-6 lg:px-8 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 order-2 sm:order-1"
            >
              {icons.arrowLeft}
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                Continue
                {icons.arrowRight}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    {icons.check}
                    PUBLISH LISTING
                  </>
                )}
              </button>
            )}
          </div>
        </form>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: icons.clock, text: "Takes 2 minutes", color: "emerald" },
            {
              icon: icons.users,
              text: "Help someone nearby",
              color: "emerald",
            },
            { icon: icons.leaf, text: "Reduce food waste", color: "green" },
          ].map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className={`text-${tip.color}-600 mb-1 mx-auto`}>
                {tip.icon}
              </div>
              <div className="font-medium text-gray-800 text-sm">
                {tip.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-in {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
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
