
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AuthSocialButtons() {
  const { toast } = useToast();

  const handleSocialSignIn = (provider: string) => {
    toast({
      title: `${provider} Sign-in`,
      description: `${provider} sign-in will be implemented soon!`,
    });
  };

  return (
    <>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => handleSocialSignIn("Google")}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => handleSocialSignIn("Apple")}
        >
          Apple
        </Button>
      </div>
    </>
  );
}
