import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, User, MessageCircle, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "./auth/AuthDialog";

export function Header() {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Roadwise</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#events"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </a>
            <a
              href="#rides"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <Car className="h-4 w-4" />
              <span>Rides</span>
            </a>

            {user && (
              <a
                href="#messages"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
              </a>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.name || user.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)}>Sign In</Button>
            )}
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </header>
  );
}
