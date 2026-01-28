import { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import ChargingStationMapContainer from './ChargingStationMapContainer';
import { Battery, MapPin } from 'lucide-react';

interface ChargingStation {
  id: string;
  name: string;
  capacity: number;
  address?: string;
  location?: string;
}

// Kochi, Kerala coordinates
const KOCHI_COORDINATES: [number, number] = [9.9312, 76.2673];

const ChargingStationsMap = ({ className = '' }: { className?: string }) => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChargingStations();
  }, []);

  const fetchChargingStations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setStations(data || []);
      console.log("Fetched charging stations:", data);
    } catch (error) {
      console.error("Error fetching charging stations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to parse location string into coordinates
  const parseLocationString = (locationStr?: string): [number, number] | null => {
    if (!locationStr) return null;
    
    try {
      // Clean up the location string and extract coordinates
      const cleaned = locationStr.replace(/[()]/g, '').trim();
      const parts = cleaned.split(',');
      
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
      return null;
    } catch (e) {
      console.error("Error parsing location:", e);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-80 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ChargingStationMapContainer 
        center={KOCHI_COORDINATES}
        zoom={12}
      >
        {stations.map(station => {
          const coordinates = parseLocationString(station.location) || KOCHI_COORDINATES;
          return (
            <Marker key={station.id} position={coordinates}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {station.name}
                  </h3>
                  <div className="text-sm flex items-center mt-1">
                    <Battery className="h-4 w-4 mr-2 text-green-500" />
                    Capacity: {station.capacity} ports
                  </div>
                  {station.address && <p className="text-sm mt-1">{station.address}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </ChargingStationMapContainer>
    </div>
  );
};

export default ChargingStationsMap;
