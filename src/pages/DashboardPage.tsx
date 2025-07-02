
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Car, Users, Star, Calendar, MapPin, MessageCircle, TrendingUp, Award, User, Phone, Mail, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    phone: ''
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setProfileData({
          name: data.name || '',
          bio: data.bio || '',
          phone: data.phone || ''
        });
      }
    }
  });

  // Fetch user's rides as driver
  const { data: myRides } = useQuery({
    queryKey: ['my-rides', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          events (title, location),
          bookings (
            id,
            seats_booked,
            status,
            profiles:user_id (name, image_url)
          )
        `)
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's bookings as passenger
  const { data: myBookings } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rides (
            *,
            profiles:driver_id (name, image_url),
            events (title, location)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch reviews received as driver
  const { data: reviewsReceived } = useQuery({
    queryKey: ['reviews-received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey (name, image_url)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch reviews given by user
  const { data: reviewsGiven } = useQuery({
    queryKey: ['reviews-given', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          driver_profile:profiles!reviews_driver_id_fkey (name, image_url),
          rides (origin, destination, departure_time)
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          bio: data.bio,
          phone: data.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setEditingProfile(false);
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  });

  // Calculate stats
  const stats = {
    totalRidesOffered: myRides?.length || 0,
    totalRidesBooked: myBookings?.length || 0,
    totalPassengers: myRides?.reduce((acc, ride) => acc + ride.bookings.length, 0) || 0,
    averageRating: reviewsReceived?.length 
      ? (reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / reviewsReceived.length).toFixed(1)
      : 'N/A'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile, rides, and reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalRidesOffered}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Rides Offered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalRidesBooked}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Rides Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalPassengers}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500 rounded-full">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.averageRating}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="my-rides">My Rides</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="reviews-received">Reviews Received</TabsTrigger>
          <TabsTrigger value="reviews-given">Reviews Given</TabsTrigger>
        </TabsList>

        {/* Profile Management Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Profile Information
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(!editingProfile)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate(profileData);
                }} className="space-y-6">
                  <div className="flex items-center gap-6 mb-6">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profile?.image_url} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{profile?.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself, your driving experience, car details..."
                      className="min-h-[100px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">{profileData.bio.length}/500 characters</p>
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full">
                    {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profile?.image_url} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{profile?.name}</h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {profile?.email}
                        </div>
                        {profile?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {profile.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {profile?.bio && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium mb-2">About Me</h4>
                      <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Rides Tab */}
        <TabsContent value="my-rides" className="space-y-4">
          {myRides && myRides.length > 0 ? (
            myRides.map((ride) => (
              <Card key={ride.id} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{ride.origin} → {ride.destination}</span>
                        <Badge className={ride.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {ride.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(ride.departure_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {ride.bookings.length}/{ride.seats} passengers
                        </div>
                      </div>
                      {ride.events && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Event: {ride.events.title}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {ride.bookings.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Passengers:</h4>
                      <div className="space-y-2">
                        {ride.bookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={booking.profiles?.image_url} />
                                <AvatarFallback>
                                  {booking.profiles?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{booking.profiles?.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {booking.seats_booked} seat(s)
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No rides offered yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Start offering rides to help fellow travelers!</p>
            </div>
          )}
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="my-bookings" className="space-y-4">
          {myBookings && myBookings.length > 0 ? (
            myBookings.map((booking) => (
              <Card key={booking.id} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {booking.rides.origin} → {booking.rides.destination}
                        </span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.rides.departure_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {booking.seats_booked} seat(s) booked
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={booking.rides.profiles?.image_url} />
                          <AvatarFallback>
                            {booking.rides.profiles?.name?.charAt(0) || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Driver: {booking.rides.profiles?.name}</span>
                      </div>
                      {booking.rides.events && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Event: {booking.rides.events.title}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Book your first ride to get started!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews-received" className="space-y-4">
          {reviewsReceived && reviewsReceived.length > 0 ? (
            reviewsReceived.map((review) => (
              <Card key={review.id} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer_profile?.image_url} />
                        <AvatarFallback>
                          {review.reviewer_profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.reviewer_profile?.name}</p>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews received yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete more rides to receive reviews!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews-given" className="space-y-4">
          {reviewsGiven && reviewsGiven.length > 0 ? (
            reviewsGiven.map((review) => (
              <Card key={review.id} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.driver_profile?.image_url} />
                        <AvatarFallback>
                          {review.driver_profile?.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Driver: {review.driver_profile?.name}</p>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.rides && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Ride: {review.rides.origin} → {review.rides.destination}
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews given yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete rides and leave reviews for drivers!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
