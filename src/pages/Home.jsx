import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [stats, setStats] = useState({
    mealsDonated: 0,
    activeUsers: 0,
    communitiesServed: 0
  });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef(null);

  // Food items floating animation
  const floatingFoods = ['🍕', '🍎', '🥪', '🍰', '🥗', '🍇', '🥐', '🍗'];

  // Testimonials data
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Restaurant Owner",
      text: "Saved 50+ kg food monthly! This platform transformed our food waste into blessings.",
      avatar: "👩‍🍳"
    },
    {
      name: "Rahul Kumar",
      role: "College Student",
      text: "As a student, free meals helped me focus on studies. Grateful to the donors!",
      avatar: "👨‍🎓"
    },
    {
      name: "Anita Patel",
      role: "NGO Volunteer",
      text: "Connected 200+ families with daily meals. Technology + compassion = real change!",
      avatar: "👩‍💼"
    }
  ];

  // Animated counter
  useEffect(() => {
    const animateCounter = (target, setter, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(1250, (val) => setStats(prev => ({...prev, mealsDonated: val})));
    animateCounter(500, (val) => setStats(prev => ({...prev, activeUsers: val})));
    animateCounter(25, (val) => setStats(prev => ({...prev, communitiesServed: val})));
  }, []);

  // Testimonial auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingFoods.map((food, index) => (
          <div
            key={index}
            className="absolute text-4xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${index * 2}s`,
              animationDuration: `${15 + index * 2}s`
            }}
          >
            {food}
          </div>
        ))}
      </div>

      {/* Hero Section with Parallax */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-600 overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-72 h-72 bg-yellow-300 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-72 h-72 bg-red-300 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-1000"></div>
          <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          {/* Main heading with typewriter effect */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-red-300">
                FEED
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200">
                THE NEED
              </span>
            </h1>
            <p className="text-2xl md:text-3xl mb-8 font-light opacity-90">
              Your <span className="font-bold text-yellow-300">surplus food</span> could be someone's{' '}
              <span className="font-bold text-red-300">next meal</span>
            </p>
          </div>

          {/* Animated CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link 
              to="/donor" 
              className="group relative bg-white text-green-600 font-bold py-5 px-10 rounded-2xl transition-all duration-500 transform hover:scale-110 text-xl shadow-2xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                DONATE FOOD NOW
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </Link>
            
            <Link 
              to="/recipient" 
              className="group relative border-2 border-white text-white font-bold py-5 px-10 rounded-2xl transition-all duration-500 transform hover:scale-110 text-xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                FIND FOOD NEARBY
              </span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </Link>
          </div>

          {/* Floating stats preview */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <div className="flex gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{stats.mealsDonated}+</div>
                <div className="text-white/80">Meals Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-300">{stats.activeUsers}+</div>
                <div className="text-white/80">Heroes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{stats.communitiesServed}+</div>
                <div className="text-white/80">Cities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Interactive How It Works */}
      <section className="py-20 bg-black text-white relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556909114-4d0d853e5e25')] bg-cover bg-fixed opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              HOW IT <span className="text-green-400">WORKS</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to become a food hero in your community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "📸", title: "SNAP & LIST", desc: "Click photos of surplus food, add details, and list it in 2 minutes" },
              { step: "2", icon: "📍", title: "GET FOUND", desc: "Your listing appears to people nearby. Receive instant requests" },
              { step: "3", icon: "🎯", title: "MAKE IMPACT", desc: "Coordinate pickup and witness your food bring smiles" }
            ].map((item, index) => (
              <div 
                key={index}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 hover:from-green-900 hover:to-green-800 transition-all duration-500 transform hover:scale-105 border border-gray-700 hover:border-green-500"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{item.title}</div>
                  <div className="text-gray-300 text-lg">{item.desc}</div>
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 text-black rounded-full flex items-center justify-center text-xl font-black">
                  {item.step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Impact Counter */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl opacity-20 -top-48 -left-48"></div>
          <div className="absolute w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-20 -bottom-48 -right-48"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-16">
            LIVE <span className="text-yellow-300">IMPACT</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-yellow-300 transition-all duration-300">
              <div className="text-6xl md:text-7xl font-black text-yellow-300 mb-4">
                {stats.mealsDonated}
              </div>
              <div className="text-2xl font-bold">MEALS DONATED</div>
              <div className="text-white/70 mt-2">And counting every second...</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-green-300 transition-all duration-300">
              <div className="text-6xl md:text-7xl font-black text-green-300 mb-4">
                {stats.activeUsers}
              </div>
              <div className="text-2xl font-bold">FOOD HEROES</div>
              <div className="text-white/70 mt-2">People making a difference</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-red-300 transition-all duration-300">
              <div className="text-6xl md:text-7xl font-black text-red-300 mb-4">
                {stats.communitiesServed}
              </div>
              <div className="text-2xl font-bold">CITIES ACTIVE</div>
              <div className="text-white/70 mt-2">Communities transformed</div>
            </div>
          </div>

          {/* Real-time activity feed */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/10">
            <div className="text-yellow-300 text-lg font-bold mb-4">🚀 LIVE ACTIVITY</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>🍕 Pizza donated in Mumbai</span>
                <span className="text-green-300">2 mins ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🥗 Salad shared in Delhi</span>
                <span className="text-green-300">5 mins ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🍰 Cake rescued in Bangalore</span>
                <span className="text-green-300">8 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Testimonials */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-16">
            REAL <span className="text-purple-400">STORIES</span>
          </h2>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl p-8 border border-purple-500">
            <div className="text-8xl mb-6">{testimonials[currentTestimonial].avatar}</div>
            <p className="text-2xl italic mb-6">"{testimonials[currentTestimonial].text}"</p>
            <div className="text-xl font-bold text-yellow-300">{testimonials[currentTestimonial].name}</div>
            <div className="text-purple-300">{testimonials[currentTestimonial].role}</div>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-yellow-400 scale-125' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with Particle Effect */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            READY TO BE A
            <span className="block text-yellow-300">FOOD HERO?</span>
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the movement that's feeding thousands and saving the planet, one meal at a time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="group bg-yellow-400 text-black font-black py-5 px-12 rounded-2xl text-xl transition-all duration-500 transform hover:scale-110 hover:bg-yellow-300 shadow-2xl"
            >
              🦸 BECOME A HERO
            </Link>
          </div>
          
          <div className="mt-8 text-sm opacity-70">
            ⚡ Average signup time: 2 minutes • 🎁 Start donating in 5 minutes
          </div>
        </div>
      </section>

      {/* Add custom animations to CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;