
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Battery, Menu, X, LogIn } from "lucide-react";
import { SignInModal } from "@/components/SignInModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate, Link } from "react-router-dom";

// Define a proper type for the user object
interface UserProfile {
  id?: string;
  email?: string;
  first_name?: string;
  role_id?: number;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, role_id')
          .eq('id', data.session.user.id)
          .single();
        
        setUser({
          ...data.session.user,
          first_name: profileData?.first_name
        });
        
        setIsAdmin(profileData?.role_id === 2);
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, role_id')
            .eq('id', session.user.id)
            .single();
          
          setUser({
            ...session.user,
            first_name: profileData?.first_name
          });
          
          setIsAdmin(profileData?.role_id === 2);
          
          toast({
            title: "Signed in successfully",
            description: `Welcome${profileData?.first_name ? `, ${profileData.first_name}` : ''}!`,
          });
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      authListener?.subscription.unsubscribe();
    };
  }, [toast, navigate]);

  const handleSignInClick = () => {
    setSignInModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleFindNearbyClick = () => {
    // Scroll to the charging stations section
    const section = document.getElementById('charging-stations');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight"
          >
            <span className="inline-block w-8 h-8 bg-primary rounded-full"></span>
            <span className="text-primary">Eco<span className="text-foreground">Scoot</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#scooters"
              onClick={(e) => handleNavLinkClick(e, 'scooters')}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Scooters
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleNavLinkClick(e, 'pricing')}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavLinkClick(e, 'contact')}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              className="hidden md:flex items-center gap-2 rounded-full"
              onClick={handleFindNearbyClick}
            >
              <Battery className="w-4 h-4" />
              <span>Find Nearby</span>
            </Button>
            
            {user ? (
              <UserMenu userEmail={user.email || ''} />
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex items-center gap-2 rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary"
                onClick={handleSignInClick}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            )}
            
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col glass-morphism mt-2 mx-4 rounded-xl overflow-hidden border border-border animate-fade-in">
              <a
                href="#scooters"
                onClick={(e) => handleNavLinkClick(e, 'scooters')}
                className="px-4 py-3 text-foreground/80 hover:bg-primary/10 hover:text-foreground transition-colors"
              >
                Scooters
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleNavLinkClick(e, 'pricing')}
                className="px-4 py-3 text-foreground/80 hover:bg-primary/10 hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#contact"
                onClick={(e) => handleNavLinkClick(e, 'contact')}
                className="px-4 py-3 text-foreground/80 hover:bg-primary/10 hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <a
                href="#charging-stations"
                className="px-4 py-3 bg-primary text-white flex items-center gap-2"
                onClick={handleFindNearbyClick}
              >
                <Battery className="w-4 h-4" />
                <span>Find Nearby</span>
              </a>
              
              {user ? (
                <div className="px-4 py-3 border-t border-border">
                  <UserMenu userEmail={user.email || ''} />
                </div>
              ) : (
                <button
                  className="px-4 py-3 border-t border-border flex items-center gap-2 text-primary w-full text-left"
                  onClick={handleSignInClick}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <SignInModal 
        isOpen={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)} 
      />
    </>
  );
}
