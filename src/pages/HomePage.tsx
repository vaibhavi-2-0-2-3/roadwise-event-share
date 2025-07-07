
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  ArrowRight, 
  Sparkles,
  Shield,
  Clock,
  Zap,
  Heart,
  Globe,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { AnimatedBanner } from '@/components/shared/AnimatedBanner';

const HomePage = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Car,
      title: "Smart Carpooling",
      description: "Find rides that match your schedule and route preferences with our intelligent matching system.",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
      icon: Calendar,
      title: "Event Integration", 
      description: "Coordinate rides to events seamlessly. Share costs and make new connections on the way.",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified profiles, real-time tracking, and community ratings ensure your safety every trip.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book rides in seconds with our streamlined interface. No more waiting around.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Rides Shared", value: "200K+", icon: Car },
    { label: "Cities", value: "25+", icon: MapPin },
    { label: "CO₂ Saved", value: "1M kg", icon: Globe }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Daily Commuter",
      content: "Roadwise has transformed my daily commute. I've saved money and made great friends!",
      avatar: "SC",
      rating: 5
    },
    {
      name: "Mike Johnson", 
      role: "Event Organizer",
      content: "The event integration is brilliant. Coordinating group travel has never been easier.",
      avatar: "MJ",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Student",
      content: "Perfect for student life. Affordable rides and a great community of travelers.",
      avatar: "PP", 
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-pink-900/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-dots opacity-30"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-200 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-primary px-4 py-2 rounded-full text-white text-sm font-medium mb-8 animate-bounce-in">
              <Sparkles className="h-4 w-4" />
              <span>The Future of Carpooling is Here</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold font-display mb-8 animate-fade-in-up">
              <span className="text-gradient-primary">Share</span> the Journey,
              <br />
              <span className="text-gradient-primary">Save</span> the Planet
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              Connect with fellow travelers, split costs, reduce emissions, and discover a smarter way to move around your city.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animate-delay-400">
              <Link to="/rides">
                <Button className="bg-gradient-primary text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <Car className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Find a Ride
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/events">
                <Button variant="outline" className="font-semibold px-8 py-4 rounded-2xl text-lg border-2 border-gray-200 hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 group">
                  <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`text-center animate-scale-in animate-delay-${index * 100}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-lg">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold font-display text-gradient-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 animate-fade-in-up">
              Why Choose <span className="text-gradient-primary">Roadwise</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              Experience the perfect blend of convenience, safety, and community in every ride.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className={`
                  group cursor-pointer transition-all duration-500 hover:shadow-2xl border-0 shadow-lg
                  ${hoveredFeature === index ? 'scale-105 shadow-2xl' : ''}
                  animate-fade-in-up animate-delay-${index * 200}
                `}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold font-display mb-4 group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                  
                  <div className="mt-6 flex items-center text-pink-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 animate-fade-in-up">
              Loved by <span className="text-gradient-primary">Thousands</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 animate-fade-in-up animate-delay-200">
              See what our amazing community has to say about their experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name}
                className={`
                  group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105
                  animate-fade-in-up animate-delay-${index * 200}
                `}
              >
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary"></div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce-in">
              <Heart className="h-4 w-4" />
              <span>Join the Movement</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-display mb-8 animate-fade-in-up">
              Ready to Transform
              <br />
              Your Daily Commute?
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in-up animate-delay-200">
              Join thousands of smart commuters who are already saving money and making a difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animate-delay-400">
              <Link to="/rides">
                <Button className="bg-white text-pink-600 font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button variant="outline" className="font-semibold px-8 py-4 rounded-2xl text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Live Stats
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-white/80 animate-fade-in-up animate-delay-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Instant verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
