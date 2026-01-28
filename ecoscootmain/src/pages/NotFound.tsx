
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="mb-8">
            <span className="inline-block w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
              404
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/">
              <ArrowLeft className="w-5 h-5" />
              Return to Home
            </a>
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NotFound;
