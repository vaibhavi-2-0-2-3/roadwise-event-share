
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Car,
  Calendar,
  Users,
  LayoutDashboard,
  User,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useTheme } from "@/components/ui/theme-provider";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Car },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Rides", href: "/rides", icon: Users },
    { name: "Taxi Demand", href: "/taxi-demand", icon: MapPin },
    ...(user
      ? [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full glass backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative rounded-2xl bg-gradient-primary p-3 group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent">
                  Roadwise
                </span>
                <div className="flex items-center space-x-1 opacity-60">
                  <Sparkles className="h-3 w-3 text-[var(--brand-primary)]" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Smart Carpooling
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item, index) => (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`
                      relative overflow-hidden transition-all duration-300 rounded-xl px-6 py-2.5
                      ${isActive(item.href) 
                        ? "bg-gradient-primary text-white shadow-glow hover:shadow-xl" 
                        : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20"
                      }
                      animate-fade-in-up animate-delay-${index * 100}
                    `}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.href) && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></div>
                    )}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="relative rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 transition-all duration-300"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* User menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-12 w-12 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-pink-100 dark:ring-pink-900">
                        <AvatarImage src={user.user_metadata?.image_url} />
                        <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                          {user.user_metadata?.name?.charAt(0) ||
                            user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-4 glass backdrop-blur-xl border-white/20 shadow-xl rounded-2xl" align="end">
                    <div className="flex items-center space-x-3 mb-4 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.image_url} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {user.user_metadata?.name?.charAt(0) ||
                            user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-2 space-y-1">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center rounded-xl p-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors cursor-pointer">
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center rounded-xl p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut} className="rounded-xl p-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-gradient-primary text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 space-y-3 animate-fade-in-up glass backdrop-blur-xl rounded-2xl mb-4 border border-white/20">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`animate-fade-in-up animate-delay-${index * 100}`}
                >
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`
                      w-full justify-start rounded-xl py-3 px-4 transition-all duration-300
                      ${isActive(item.href) 
                        ? "bg-gradient-primary text-white shadow-glow" 
                        : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20"
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
