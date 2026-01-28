
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ScooterModelsSection } from "@/components/ScooterModelsSection";
import { SubscriptionPlansSection } from "@/components/SubscriptionPlansSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { CallbackSection } from "@/components/CallbackSection";
import { ChargingStationsSection } from "@/components/ChargingStationsSection";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen overflow-x-hidden">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <ScooterModelsSection />
        <SubscriptionPlansSection />
        <ChargingStationsSection />
        <TestimonialsSection />
        <CTASection />
        <div id="contact">
          <CallbackSection />
        </div>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default Index;
