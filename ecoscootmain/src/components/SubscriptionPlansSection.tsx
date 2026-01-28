
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const plans = [
  {
    name: "Hourly",
    price: "₹69",
    period: "hour",
    description: "Perfect for quick trips",
    features: [
      "Deposit ₹0",
      "Range 80-120 Kms",
      "Road Side Assistance",
      "1 helmet included for rider",
      "Helmet ₹50 (Add-on)",
      "Battery Swap ₹100 (Add-on)",
    ],
    // Removed popular: false,
  },
  {
    name: "Daily",
    price: "₹599",
    period: "day",
    description: "Great for day trips",
    features: [
      "Deposit ₹0",
      "Range 80-120 Kms",
      "Road Side Assistance",
      "1 helmet included for rider",
      "Helmet ₹50 (Add-on)",
      "Battery Swap ₹100 (Add-on)",
    ],
    // Removed popular: true,
  },
  {
    name: "Weekly",
    price: "₹1650",
    period: "week",
    description: "Perfect for extended trips",
    features: [
      "Deposit ₹0 (with charger)",
      "Range 80-120 Kms",
      "Road Side Assistance",
      "1 helmet included for rider",
      "Helmet ₹50 (Add-on)",
      "Battery Swap ₹100 (Add-on)",
    ],
    // Removed popular: false,
  },
  {
    name: "Monthly",
    price: "₹7599",
    period: "month",
    description: "Ideal for regular riders",
    features: [
      "Deposit ₹0 (with charger)",
      "Range 80-120 Kms",
      "Road Side Assistance",
      "1 helmet included for rider",
      "Helmet ₹50 (Add-on)",
      "Battery Swap ₹100 (Add-on)",
    ],
    // Removed popular: false,
  },
];

export function SubscriptionPlansSection() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCallbackRequest = () => {
    // This would typically submit the phone number to a backend service
    alert(`We'll call you back at ${phoneNumber} to discuss our leasing options.`);
    setPhoneNumber("");
  };

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-foreground/70 text-lg">
            Choose the plan that works best for your lifestyle. All plans include maintenance and servicing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className="overflow-hidden transition-all border-border hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                
                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="h-4 w-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leasing Option */}
        <div className="max-w-xl mx-auto mt-12 bg-muted rounded-xl p-6 border border-border">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Bike for Lease</h3>
              <p className="text-lg font-semibold text-primary mb-1">₹5999/Month</p>
              <p className="text-sm text-muted-foreground mb-4">
                Type your phone number to get a call back for more details.
              </p>
              
              <div className="flex items-center gap-2">
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCallbackRequest}>
                  Get a Call Back
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Info className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Our leasing option is perfect for long-term users. Includes maintenance, insurance, and more.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
