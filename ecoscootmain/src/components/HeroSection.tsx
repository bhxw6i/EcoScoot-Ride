import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import RideNowModal from "./RideNowModal";
import type { Json } from "@/integrations/supabase/types";

// Create a properly typed default scooter
const defaultScooter = {
  id: 'default-scooter',
  model: 'Default Scooter',
  status: 'available',
  battery_level: 100,
  hourly_rate: 5.99,
  battery_capacity: 'Standard',
  max_speed: '25 km/h',
  range: '30 km',
  charging_time: '4 hours',
  features: [],
  image_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_maintenance: new Date().toISOString(),
  location: null
};

export function HeroSection() {
  const [rideNowOpen, setRideNowOpen] = useState(false);
  const [selectedScooter, setSelectedScooter] = useState(defaultScooter);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in">
          <div>
            <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
              Eco-Friendly Urban Mobility
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Ride the Future.<br />
            <span className="text-primary">Electric Freedom.</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-lg">
            Experience the freedom of electric mobility with our premium scooter rental service. Fast, convenient, and eco-friendly.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 gap-2 group"
              onClick={() => setRideNowOpen(true)}
            >
              Ride Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full text-lg px-8"
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Plans
            </Button>
          </div>
          <div className="flex items-center gap-8 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span>No Deposit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span>Free to Unlock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span>Easy Booking</span>
            </div>
          </div>
        </div>
        
        <div className="relative select-none pointer-events-none">
          <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background z-10"></div>
          <img 
            src="./public/main/2.jpeg" 
            alt="Ola Electric Scooter" 
            className="w-full h-auto object-contain max-w-md mx-auto animate-float"
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
        <a href="#features" className="rounded-full p-2 bg-background border border-border shadow-lg">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>

      <RideNowModal 
        open={rideNowOpen}
        onOpenChange={setRideNowOpen}
        scooter={selectedScooter} 
        location="Your Current Location" 
      />
    </section>
  );
}

export default HeroSection;
