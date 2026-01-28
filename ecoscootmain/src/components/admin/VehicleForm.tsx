import { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64, binaryToImageSrc, fileToUint8Array } from '@/utils/imageUtils';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface VehicleFormProps {
  vehicle?: {
    id: string;
    model: string;
    battery_level: number;
    status: string;
    range?: string;
    battery_capacity?: string;
    max_speed?: string;
    charging_time?: string;
    features?: any;
    image_url?: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const isEditing = !!vehicle;
  const [model, setModel] = useState(vehicle?.model || '');
  const [batteryLevel, setBatteryLevel] = useState(vehicle?.battery_level.toString() || '100');
  const [status, setStatus] = useState(vehicle?.status || 'available');
  const [range, setRange] = useState(vehicle?.range || '');
  const [batteryCapacity, setBatteryCapacity] = useState(vehicle?.battery_capacity || '');
  const [maxSpeed, setMaxSpeed] = useState(vehicle?.max_speed || '');
  const [chargingTime, setChargingTime] = useState(vehicle?.charging_time || '');
  const [featuresText, setFeaturesText] = useState(
    vehicle?.features ? 
      (Array.isArray(vehicle.features) ? 
        vehicle.features.join('\n') : 
        typeof vehicle.features === 'string' ? 
          vehicle.features : 
          JSON.stringify(vehicle.features)
      ) : ''
  );
  const [imageData, setImageData] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    vehicle?.image_url ? binaryToImageSrc(vehicle.image_url) : '/placeholder.svg'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Update preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to base64 for storage
      const base64String = await fileToBase64(file);
      setImageData(base64String);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the image',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!model) {
      toast({
        title: "Validation Error",
        description: "Please enter a model name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse features text into an array
      const featuresArray = featuresText
        .split('\n')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);
        
      const vehicleData = {
        model,
        battery_level: parseInt(batteryLevel),
        status,
        range,
        battery_capacity: batteryCapacity,
        max_speed: maxSpeed,
        charging_time: chargingTime,
        features: featuresArray,
      };

      // Add image data if it exists
      if (imageData) {
        Object.assign(vehicleData, { image_url: imageData });
      }
      
      if (isEditing) {
        // Update existing vehicle
        const { error } = await supabase
          .from('scooters')
          .update(vehicleData)
          .eq('id', vehicle.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Vehicle updated successfully"
        });
      } else {
        // Add new vehicle
        const { error } = await supabase
          .from('scooters')
          .insert(vehicleData);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "New vehicle added successfully"
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vehicle",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Update Vehicle' : 'Add New Vehicle'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Image</Label>
              <div className="flex flex-col items-center space-y-4">
                <div className="border rounded-md overflow-hidden w-40 h-40 flex items-center justify-center bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Vehicle preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {previewUrl !== '/placeholder.svg' ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input 
                id="model" 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. XR-1000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="battery">Battery Level (%)</Label>
              <Input 
                id="battery" 
                type="number"
                min="0"
                max="100"
                value={batteryLevel} 
                onChange={(e) => setBatteryLevel(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="range">Range</Label>
              <Input 
                id="range" 
                value={range} 
                onChange={(e) => setRange(e.target.value)}
                placeholder="e.g. 120 km"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="battery-capacity">Battery Capacity</Label>
              <Input 
                id="battery-capacity" 
                value={batteryCapacity} 
                onChange={(e) => setBatteryCapacity(e.target.value)}
                placeholder="e.g. 3.4 kWh Li-ion"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-speed">Max Speed</Label>
              <Input 
                id="max-speed" 
                value={maxSpeed} 
                onChange={(e) => setMaxSpeed(e.target.value)}
                placeholder="e.g. 80 km/h"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="charging-time">Charging Time</Label>
              <Input 
                id="charging-time" 
                value={chargingTime} 
                onChange={(e) => setChargingTime(e.target.value)}
                placeholder="e.g. 4-5 hours"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea 
              id="features" 
              value={featuresText} 
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="e.g. Smart Connectivity&#10;LED Headlamp&#10;Regenerative Braking"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">Enter each feature on a new line</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Update Vehicle' : 'Add Vehicle'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
