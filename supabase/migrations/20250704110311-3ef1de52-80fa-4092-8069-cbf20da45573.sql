
-- Create ride_locations table for live tracking
CREATE TABLE public.ride_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  ride_id UUID REFERENCES public.rides(id) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('driver', 'passenger')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for ride_locations
ALTER TABLE public.ride_locations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own location
CREATE POLICY "Users can insert their own location" 
  ON public.ride_locations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own location  
CREATE POLICY "Users can update their own location" 
  ON public.ride_locations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can view locations for rides they are part of (either as driver or passenger)
CREATE POLICY "Users can view ride locations for their rides" 
  ON public.ride_locations 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT driver_id FROM rides WHERE id = ride_id
      UNION
      SELECT user_id FROM bookings WHERE ride_id = ride_locations.ride_id
    )
  );

-- Add "in_progress" to ride_status enum
ALTER TYPE ride_status ADD VALUE IF NOT EXISTS 'in_progress';
