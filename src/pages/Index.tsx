
import { Header } from '@/components/Header';
import { EventsSection } from '@/components/events/EventsSection';
import { RidesSection } from '@/components/rides/RidesSection';
import { AuthProvider } from '@/hooks/useAuth';
import { Car, Users, MessageCircle, Shield } from 'lucide-react';

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share the Journey with Roadwise
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with fellow travelers, share rides to events, and make every journey memorable
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-semibold mb-2">Easy Ride Sharing</h3>
                <p className="text-sm text-blue-100">Find or offer rides with just a few clicks</p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-semibold mb-2">Event-Based</h3>
                <p className="text-sm text-blue-100">Connect with others going to the same events</p>
              </div>
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-semibold mb-2">Real-Time Chat</h3>
                <p className="text-sm text-blue-100">Coordinate with drivers and fellow passengers</p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-semibold mb-2">Trusted Community</h3>
                <p className="text-sm text-blue-100">Rate and review drivers for everyone's safety</p>
              </div>
            </div>
          </div>
        </section>

        <EventsSection />
        <RidesSection />

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold">Roadwise</h3>
            </div>
            <p className="text-gray-400">
              Making every journey better through shared experiences
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default Index;
