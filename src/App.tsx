import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import RidesPage from "./pages/RidesPage";
import RideDetailsPage from "./pages/RideDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import TaxiDemandPage from "./pages/TaxiDemandPage";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="roadwise-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:eventId" element={<EventDetailsPage />} />
                <Route path="/rides" element={<RidesPage />} />
                <Route path="/rides/:rideId" element={<RideDetailsPage />} />
                <Route path="/profile/:profileId" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/taxi-demand" element={<TaxiDemandPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
