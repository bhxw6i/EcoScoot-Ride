
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 transition-all duration-300 hover:bg-accent"
        >
          <Sun className={cn(
            "h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all duration-300",
            theme !== "light" && "scale-0 -rotate-90"
          )} />
          <Moon className={cn(
            "absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all duration-300",
            theme === "dark" && "rotate-0 scale-100"
          )} />
          <Monitor className={cn(
            "absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all duration-300",
            theme === "system" && "rotate-0 scale-100"
          )} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2">
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
