// src/pages/About.js
import { Icons } from '../components/Icons';

export default function About() {
  const features = [
    {
      icon: <Icons.Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'All donations are verified and safe for consumption with proper quality checks.'
    },
    {
      icon: <Icons.Clock className="w-8 h-8" />,
      title: 'Quick Response',
      description: 'Get instant notifications and quick pickups to ensure food freshness.'
    },
    {
      icon: <Icons.Community className="w-8 h-8" />,
      title: 'Community Driven',
      description: 'Built by the community, for the community. Everyone can participate.'
    },
    {
      icon: <Icons.Eco className="w-8 h-8" />,
      title: 'Eco-Friendly',
      description: 'Reduce food waste and help the environment by sharing surplus food.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Meals Shared' },
    { number: '15,000+', label: 'Families Helped' },
    { number: '2,500+', label: 'Active Donors' },
    { number: '300+', label: 'Cities Served' }
  ];

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg mb-8">
                <span className="text-white font-bold text-5xl">FN</span>
              </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent mb-6">
              About FeedTheNeed
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to eliminate food waste and hunger by connecting surplus food with those who need it most.
            </p>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30"></div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every day, perfectly good food goes to waste while millions go hungry. FeedTheNeed was born from the simple idea that we can do better.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We've created a platform that makes it easy for restaurants, grocery stores, and individuals to donate surplus food directly to people in their communities who need it.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Icons.Heart className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Making a difference, one meal at a time.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/60">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                      <div className="text-3xl font-bold text-emerald-700 mb-2">{stat.number}</div>
                      <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform is designed with simplicity, safety, and community in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/60 hover:border-emerald-200">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
     

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of others who are already reducing food waste and helping their communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                Start Donating Today
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}