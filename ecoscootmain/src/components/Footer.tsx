
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/70 dark:bg-gray-900/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <a href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight mb-4">
              <span className="inline-block w-8 h-8 bg-primary rounded-full"></span>
              <span className="text-primary">Eco<span className="text-foreground">Scoot</span></span>
            </a>
            <p className="text-foreground/70 mb-4">
              Premium electric scooter rentals for urban explorers. Eco-friendly, convenient, and fun.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#scooters" className="text-foreground/70 hover:text-primary transition-colors">
                  Scooters
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-foreground/70 hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#locations" className="text-foreground/70 hover:text-primary transition-colors">
                  Locations
                </a>
              </li>
              <li>
                <a href="#about" className="text-foreground/70 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="text-foreground/70 hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Rental Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <p className="text-foreground/70 mb-2">1234 Urban Avenue</p>
            <p className="text-foreground/70 mb-2">Metropolis, MP 12345</p>
            <p className="text-foreground/70 mb-2">+1 (555) 123-4567</p>
            <p className="text-foreground/70 mb-4">support@ecoscoot.com</p>
            <p className="text-primary">Download our app</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-foreground/60 text-sm">
          <p>&copy; {new Date().getFullYear()} EcoScoot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
