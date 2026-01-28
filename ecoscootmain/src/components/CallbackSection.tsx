import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface ChargingStation {
  id: string;
  name: string;
  location: string; // Now a text field
  capacity: number;
  address?: string;
}

export function CallbackSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    fetchChargingStations();
  }, []);

  const fetchChargingStations = async () => {
    try {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*');
      
      if (error) throw error;
      
      setChargingStations(data || []);
    } catch (error) {
      console.error("Error fetching charging stations:", error);
    }
  };

  const handleCallbackRequest = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Thank you!",
      description: `We'll call you back at ${phoneNumber} soon.`,
    });
    setPhoneNumber("");
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use a temporary token for demo purposes
    // In production, use environment variables or user input
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1haS1kZW1vIiwiYSI6ImNsdXphbGNnaTBhc3kya3FwZHkzcWxhcnUifQ.a9mK_AgOas0hRdadpH0x_w';
    
    if (map.current) return; // Initialize map only once
    
    // Kochi, Kerala coordinates
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [76.2673, 9.9312], // Kochi coordinates [lng, lat]
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add charging stations markers when map loads
    map.current.on('load', () => {
      if (chargingStations.length > 0) {
        chargingStations.forEach(station => {
          if (station.location) {
            try {
              // Parse the location string to extract coordinates
              let coords: [number, number] = [76.2673, 9.9312]; // Default Kochi coords as a tuple
              
              // Clean up the location string and extract coordinates
              const locationStr = station.location.replace(/[()]/g, '').trim();
              const parts = locationStr.split(',');
              
              if (parts.length >= 2) {
                const lat = parseFloat(parts[0].trim());
                const lng = parseFloat(parts[1].trim());
                
                if (!isNaN(lat) && !isNaN(lng)) {
                  coords = [lng, lat]; // Mapbox uses [lng, lat]
                }
              }
              
              const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <h3 class="font-bold">${station.name}</h3>
                  <p>Capacity: ${station.capacity} scooters</p>
                  ${station.address ? `<p>Address: ${station.address}</p>` : ''}
                `);
                
              new mapboxgl.Marker({ color: "#10b981" }) // Use a green color for markers
                .setLngLat(coords)
                .setPopup(popup)
                .addTo(map.current!);
            } catch (error) {
              console.error("Error adding marker for station:", station.name, error);
            }
          }
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [chargingStations]);

  return (
    <section className="py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Call You Back!</h2>
            <p className="text-foreground/70 text-lg">
              Type your phone number to get a call back from us.
            </p>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Mobile Number</Label>
                <Input 
                  id="phone-number"
                  type="tel" 
                  placeholder="Your phone number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleCallbackRequest}
                className="gap-2 w-full md:w-auto"
              >
                <Phone className="h-4 w-4" />
                Get a Call Back
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-lg border border-border h-[400px]">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
