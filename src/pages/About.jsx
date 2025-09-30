export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About FoodShare</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting communities through food donation to reduce waste and fight hunger.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              FoodShare aims to bridge the gap between food surplus and food scarcity by creating 
              a platform where individuals and businesses can easily donate excess food to those in need.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ul className="text-gray-600 space-y-2">
              <li>• Donors list surplus food with pickup details</li>
              <li>• Recipients browse available donations nearby</li>
              <li>• Real-time coordination for food pickup</li>
              <li>• Track donations from listing to delivery</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p className="text-gray-700 mb-6">
            Whether you have food to share or need assistance, FoodShare connects people who care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
              Start Donating
            </button>
            <button className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white">
              Find Food Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
