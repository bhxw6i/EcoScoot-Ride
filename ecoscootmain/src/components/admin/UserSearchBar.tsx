
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userCount: number;
}

export default function UserSearchBar({ 
  searchQuery, 
  onSearchChange, 
  userCount
}: UserSearchBarProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        User Accounts ({userCount} total)
      </h3>
      <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8 h-9 w-[250px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
