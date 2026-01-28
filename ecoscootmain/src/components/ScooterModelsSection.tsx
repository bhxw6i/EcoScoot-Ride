
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScooterBookingDialog } from "./ScooterBookingDialog";
import { Battery, Clock, Gauge, Zap, CheckCircle2, Award, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { binaryToImageSrc } from "@/utils/imageUtils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Json } from "@/integrations/supabase/types";
import { Scooter } from "@/components/staff/user-support/types";

interface ScooterModel extends Omit<Scooter, 'features'> {
  features: string[];
  battery: string;
  speed: string;
  chargingTime: string;
  featured?: boolean;
}

export function ScooterModelsSection() {
  const [selectedModel, setSelectedModel] = useState<ScooterModel | null>(null);
  const [scooterModels, setScooterModels] = useState<ScooterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchScooters() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('scooters')
          .select('id, model, image_url, battery_level, status, range, battery_capacity, max_speed, charging_time, features, hourly_rate, created_at, updated_at, last_maintenance, location')
          .eq('status', 'available')
          .order('battery_level', { ascending: false });
        
        if (error) {
          console.error("Error fetching scooters:", error);
          throw error;
        } 
        
        if (data && data.length > 0) {
          const mappedScooters = data.map((scooter, index) => {
            let processedFeatures: string[] = [];
            
            if (Array.isArray(scooter.features)) {
              processedFeatures = scooter.features.map(feature => 
                typeof feature === 'string' ? feature : String(feature)
              );
            }
            
            return {
              id: scooter.id,
              model: scooter.model,
              image_url: scooter.image_url,
              battery_level: scooter.battery_level,
              status: scooter.status,
              range: scooter.range || "N/A",
              speed: scooter.max_speed || "N/A",
              battery: scooter.battery_capacity || "N/A",
              chargingTime: scooter.charging_time || "N/A",
              features: processedFeatures,
              hourly_rate: scooter.hourly_rate || 5.99,
              featured: index === 1,
              battery_capacity: scooter.battery_capacity,
              max_speed: scooter.max_speed,
              charging_time: scooter.charging_time,
              created_at: scooter.created_at,
              updated_at: scooter.updated_at,
              last_maintenance: scooter.last_maintenance,
              location: scooter.location
            };
          });
          
          setScooterModels(mappedScooters);
        } else {
          console.log("No scooters found in database, using fallback data");
          setScooterModels([]);
        }
      } catch (error) {
        console.error("Error in fetchScooters:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScooters();
  }, []);

  const shouldUseCarousel = scooterModels.length > 3 || isMobile;

  return (
    <section id="scooters" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Premium Fleet</h2>
          <p className="text-foreground/70 text-lg">
            Choose from our selection of high-performance electric scooters designed for your urban adventures.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading scooters...</span>
          </div>
        ) : scooterModels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No scooters available at the moment.</p>
          </div>
        ) : shouldUseCarousel ? (
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {scooterModels.map((model, index) => (
                <CarouselItem 
                  key={model.id} 
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <ScooterCard 
                    model={model} 
                    onSelect={() => setSelectedModel(model)} 
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-4">
              <CarouselPrevious className="relative" />
              <CarouselNext className="relative" />
            </div>
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {scooterModels.map((model) => (
              <ScooterCard 
                key={model.id} 
                model={model} 
                onSelect={() => setSelectedModel(model)} 
              />
            ))}
          </div>
        )}

        {selectedModel && (
          <ScooterBookingDialog
            open={!!selectedModel}
            setOpen={(open) => !open && setSelectedModel(null)}
            scooter={selectedModel as any}
          />
        )}
      </div>
    </section>
  );
}

function ScooterCard({ model, onSelect }: { model: ScooterModel, onSelect: () => void }) {
  // Convert binary image data to usable src
  const imageSrc = binaryToImageSrc(model.image_url);

  return (
    <Card 
      className={`overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 relative h-full ${
        model.featured ? "ring-2 ring-primary md:scale-105 z-10" : ""
      }`}
    >
      {model.featured && (
        <div className="absolute top-4 right-4 z-20 bg-primary text-primary-foreground rounded-full py-1 px-3 flex items-center gap-1 font-medium text-sm shadow-md animate-pulse">
          <Award className="h-4 w-4" />
          <span>Most Popular</span>
        </div>
      )}
      <div className="h-56 overflow-hidden">
        <img 
          src={imageSrc} 
          alt={model.model} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{model.model}</h3>
          <div className="text-primary font-bold">
            ₹{model.hourly_rate?.toFixed(2)}/hr
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-foreground/60">Mileage</p>
              <p className="font-medium text-sm">{model.range}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-foreground/60">Battery</p>
              <p className="font-medium text-sm">{model.battery}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-foreground/60">Max Speed</p>
              <p className="font-medium text-sm">{model.speed}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-foreground/60">Charging</p>
              <p className="font-medium text-sm">{model.chargingTime}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Features</h4>
          <ul className="space-y-1">
            {model.features.map((feature, fIndex) => (
              <li key={fIndex} className="flex items-center text-sm">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button 
          className="w-full rounded-lg"
          onClick={onSelect}
        >
          Select This Model
        </Button>
      </CardFooter>
    </Card>
  );
}
