
import { Battery, Clock, MapPin, Smartphone } from "lucide-react";

const features = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Multiple Locations",
    description: "Find scooters at convenient locations throughout the city",
  },
  {
    icon: <Battery className="h-6 w-6" />,
    title: "Long Battery Life",
    description: "Our scooters can go up to 40 miles on a single charge",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Easy Booking",
    description: "Book and unlock scooters with just a few taps",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "24/7 Availability",
    description: "Ride whenever you need, day or night",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/50 dark:bg-gray-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Glide-n-Go?</h2>
          <p className="text-foreground/70 text-lg">
            Experience the future of urban transportation with our premium electric scooters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all hover:translate-y-[-4px] duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
