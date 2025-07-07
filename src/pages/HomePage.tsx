
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
  CheckCircle,
  Route,
  Leaf,
  DollarSign
} from 'lucide-react';

const HomePage = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Route,
      title: "Smart Route Matching",
      description: "AI-powered algorithm finds the perfect carpool matches based on your route, schedule, and preferences.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Calendar,
      title: "Event Carpooling", 
      description: "Easily coordinate shared rides to concerts, festivals, conferences, and other events in your area.",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Verified profiles, real-time tracking, in-app messaging, and community reviews ensure your safety.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Leaf,
      title: "Eco-Friendly Impact",
      description: "Reduce carbon emissions and traffic congestion while building a sustainable transportation community.",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    }
  ];

  const stats = [
    { label: "Active Carpoolers", value: "50K+", icon: Users, color: "text-blue-600" },
    { label: "Successful Rides", value: "200K+", icon: Car, color: "text-cyan-600" },
    { label: "Cities Covered", value: "25+", icon: MapPin, color: "text-green-600" },
    { label: "CO₂ Reduced", value: "1M kg", icon: Globe, color: "text-emerald-600" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Daily Commuter",
      content: "Roadwise transformed my daily commute! I've saved over $200 monthly and made amazing friends along the way.",
      avatar: "SC",
      rating: 5,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Mike Rodriguez", 
      role: "Event Organizer",
      content: "The event integration is brilliant. Coordinating group travel for our music festival has never been easier.",
      avatar: "MR",
      rating: 5,
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      name: "Priya Patel",
      role: "University Student",
      content: "Perfect for student life! Affordable rides, eco-friendly choices, and a great community of travelers.",
      avatar: "PP", 
      rating: 5,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-dots opacity-20"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-200/50 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-emerald-200/50 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-primary px-6 py-3 rounded-full text-white text-sm font-medium mb-8 animate-bounce-in shadow-glow">
              <Car className="h-4 w-4" />
              <span>Smart Carpooling Made Simple</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold font-display mb-8 animate-fade-in-up">
              <span className="text-gradient-primary">Share</span> Your Journey,
              <br />
              <span className="text-gradient-secondary">Save</span> the Planet
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              Connect with fellow travelers, split costs, reduce emissions, and discover a smarter way to move around your city. Join the carpooling revolution today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animate-delay-400">
              <Link to="/rides">
                <Button className="bg-gradient-primary text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group btn-hover-glow ripple">
                  <Car className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Find a Ride
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/events">
                <Button variant="outline" className="font-semibold px-8 py-4 rounded-2xl text-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group btn-hover-lift">
                  <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Browse Events
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up animate-delay-500">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 animate-fade-in-up">
              Why Choose <span className="text-gradient-primary">Roadwise</span>?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              Experience the perfect blend of convenience, safety, and sustainability in every ride.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className={`
                  group cursor-pointer transition-all duration-500 hover:shadow-2xl border-0 shadow-card card-hover
                  ${hoveredFeature === index ? 'scale-105 shadow-float' : ''}
                  animate-fade-in-up animate-delay-${index * 200}
                  card-modern
                `}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold font-display mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 animate-fade-in-up">
              How It <span className="text-gradient-primary">Works</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 animate-fade-in-up animate-delay-200">
              Getting started is as easy as 1-2-3
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: MapPin, title: "Set Your Route", description: "Enter your starting point and destination" },
              { icon: Users, title: "Find Matches", description: "Browse available rides or offer your own" },
              { icon: Car, title: "Share & Save", description: "Connect with riders and split the cost" }
            ].map((step, index) => (
              <div key={step.title} className={`text-center animate-fade-in-up animate-delay-${index * 200}`}>
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-emerald-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 animate-fade-in-up">
              Loved by <span className="text-gradient-primary">Thousands</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 animate-fade-in-up animate-delay-200">
              Join our community of happy carpoolers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name}
                className={`
                  group hover:shadow-2xl transition-all duration-500 border-0 shadow-card hover:scale-105
                  animate-fade-in-up animate-delay-${index * 200}
                  card-modern
                `}
              >
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {testimonial.name}
                      </div>
                      <div className="text-slate-500 text-sm">
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
              Join thousands of smart commuters who are already saving money, time, and the environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animate-delay-400">
              <Link to="/rides">
                <Button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group btn-hover-glow">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button variant="outline" className="font-semibold px-8 py-4 rounded-2xl text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Impact Stats
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80 animate-fade-in-up animate-delay-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>100% Free to Join</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Instant Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Safe & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
