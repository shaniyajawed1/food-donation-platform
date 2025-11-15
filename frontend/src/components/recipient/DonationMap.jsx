import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { donationAPI } from "../../services/api";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const foodIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgNDFDMTkuNDA0IDQxIDI1IDMxLjgyNzkgMjUgMjAuNUMyNSA5LjE3MjEgMTkuNDA0IDAgMTIuNSAwQzUuNTk1OTcgMCAwIDkuMTcyMSAwIDIwLjVDMCAzMS44Mjc5IDUuNTk1OTcgNDEgMTIuNSA0MVoiIGZpbGw9IiMxMEE4NTgiLz4KPHBhdGggZD0iTTEyLjUgMzZDMjEuMDU1OSAzNiAyOCAyOC4wNTU5IDI4IDE5LjVDMjggMTAuOTQ0MSAyMS4wNTU5IDQgMTIuNSA0QzMuOTQ0MDYgNCAwIDEwLjk0NDEgMCAxOS41QzAgMjguMDU1OSAzLjk0NDA2IDM2IDEyLjUgMzZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYuNSAxNS41QzE2LjUgMTcuMTU2OSAxNC42NTY5IDE5IDEzIDE5QzExLjM0MzEgMTkgOS41IDE3LjE1NjkgOS41IDE1LjVDOS41IDEzLjg0MzEgMTEuMzQzMSAxMiAxMyAxMkMxNC42NTY5IDEyIDE2LjUgMTMuODQzMSAxNi41IDE1LjVaIiBmaWxsPSIjMTBBODU4Ii8+CjxwYXRoIGQ9Ik0xMCAyMkMxMCAyMiAxMiAyNSAxMyAyNUMxNCAyNSAxNiAyMiAxNiAyMkMxNiAyMiAxOCAyNCAxOCAyNkMxOCAyOCAxNi41IDMwIDEzIDMwQzkuNSAzMCA4IDI4IDggMjZDOCAyNCAxMCAyMiAxMCAyMloiIGZpbGw9IiMxMEE4NTgiLz4KPC9zdmc+',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DonationMap() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const defaultCenter = [28.6139, 77.2090]; 

  useEffect(() => {
    fetchDonations();
    getUserLocation();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await donationAPI.getAll();
      
      if (response.data) {
        const availableDonations = response.data.filter(donation => donation.status === 'available');
        console.log("Available donations:", availableDonations);
        const donationsWithCoords = await geocodeAllDonations(availableDonations);
        setDonations(donationsWithCoords);
      }
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError("Failed to load donation locations");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.log("Geolocation error:", error);
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  };

  const geocodeAllDonations = async (donations) => {
    setGeocodingProgress(0);
    const results = [];
    
    for (let i = 0; i < donations.length; i++) {
      const donation = donations[i];
      try {
        const coordinates = await geocodeLocation(donation.pickupLocation);
        results.push({
          ...donation,
          coordinates: coordinates,
          originalAddress: donation.pickupLocation 
        });
      } catch (error) {
        console.warn(`Failed to geocode: ${donation.pickupLocation}`, error);
        results.push({
          ...donation,
          coordinates: [
            defaultCenter[0] + (Math.random() - 0.5) * 0.1,
            defaultCenter[1] + (Math.random() - 0.5) * 0.1
          ],
          originalAddress: donation.pickupLocation,
          geocodeFailed: true
        });
      }
      setGeocodingProgress(Math.round(((i + 1) / donations.length) * 100));
    }
    
    setGeocodingProgress(100);
    return results;
  };

  const geocodeLocation = async (address) => {
    if (address.coordinates && Array.isArray(address.coordinates) && address.coordinates.length === 2) {
      return address.coordinates;
    }
    if (address.latitude && address.longitude) {
      return [address.latitude, address.longitude];
    }
    if (typeof address === 'string') {
      const formattedAddress = encodeURIComponent(address.trim());
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${formattedAddress}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      }
      return geocodeFallback(address);
    }
    return defaultCenter;
  };

  const geocodeFallback = (address) => {
    const locationMap = {
      'delhi': [28.6139, 77.2090],
      'new delhi': [28.6139, 77.2090],
      'mumbai': [19.0760, 72.8777],
      'bangalore': [12.9716, 77.5946],
      'bengaluru': [12.9716, 77.5946],
      'chennai': [13.0827, 80.2707],
      'kolkata': [22.5726, 88.3639],
      'hyderabad': [17.3850, 78.4867],
      'pune': [18.5204, 73.8567],
      'ahmedabad': [23.0225, 72.5714],
      'jaipur': [26.9124, 75.7873],
      'surat': [21.1702, 72.8311],
      'lucknow': [26.8467, 80.9462],
      'kanpur': [26.4499, 80.3319],
      'nagpur': [21.1458, 79.0882],
      'indore': [22.7196, 75.8577],
      'thane': [19.2183, 72.9781],
      'bhopal': [23.2599, 77.4126],
      'visakhapatnam': [17.6868, 83.2185],
      'patna': [25.5941, 85.1376],
    };

    const lowerAddress = address.toLowerCase();
    for (const [key, coords] of Object.entries(locationMap)) {
      if (lowerAddress === key || lowerAddress.includes(key)) {
        return coords;
      }
    }
    for (const [key, coords] of Object.entries(locationMap)) {
      if (lowerAddress.includes(key)) {
        return coords;
      }
    }
    console.warn(`No geocoding match found for: ${address}`);
    return [
      defaultCenter[0] + (Math.random() - 0.5) * 0.1,
      defaultCenter[1] + (Math.random() - 0.5) * 0.1
    ];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'reserved': return 'text-yellow-600';
      case 'claimed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading donation map...</p>
            {geocodingProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${geocodingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Geocoding locations... {geocodingProgress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
            Find Food Near You
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore available food donations on the map. Click on markers to see details.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Unable to load map</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{donations.length}</div>
              <div className="text-sm text-gray-600">Total Donations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {donations.filter(d => d.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {donations.filter(d => d.status === 'claimed').length}
              </div>
              <div className="text-sm text-gray-600">Claimed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {donations.filter(d => d.status === 'reserved').length}
              </div>
              <div className="text-sm text-gray-600">Reserved</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          <div className="h-96 md:h-[500px] lg:h-[600px]">
            {userLocation && (
              <MapContainer
                center={userLocation}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={userLocation}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-semibold text-emerald-600">Your Location</div>
                      <div className="text-sm text-gray-600">You are here</div>
                    </div>
                  </Popup>
                </Marker>
                {donations.map((donation, index) => (
                  <Marker
                    key={donation._id || index}
                    position={donation.coordinates}
                    icon={foodIcon}
                  >
                    <Popup>
                      <div className="min-w-[250px]">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                          {donation.foodType}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-semibold">{donation.quantity}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${getStatusColor(donation.status)}`}>
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </span>
                          </div>

                          {donation.expiryDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expires:</span>
                              <span className="font-semibold">
                                {new Date(donation.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="text-gray-600 block mb-1">Pickup Location:</span>
                            <span className="font-medium text-sm">
                              {donation.originalAddress || donation.pickupLocation}
                            </span>
                            {donation.geocodeFailed && (
                              <p className="text-xs text-yellow-600 mt-1">
                                * Approximate location
                              </p>
                            )}
                          </div>

                          {donation.description && (
                            <div>
                              <span className="text-gray-600 block mb-1">Description:</span>
                              <span className="text-sm">{donation.description}</span>
                            </div>
                          )}
                        </div>

                        {donation.status === 'available' && (
                          <div className="mt-4">
                            <Link
                              to={`/recipient/food-listings/${donation._id}`}
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200 text-sm block text-center"
                            >
                              View Details & Claim
                            </Link>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#10A858] rounded-full"></div>
              <span>Food Donations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span>Other Locations</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={fetchDonations}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Refresh Map
          </button>
        </div>
      </div>
    </div>
  );
}