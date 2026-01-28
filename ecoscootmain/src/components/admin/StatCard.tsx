
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}

export function StatCard({ title, value, icon: Icon, color, onClick, clickable }: StatCardProps) {
  return (
    <Card 
      className={cn("overflow-hidden transition-all duration-200", 
        clickable && "hover:shadow-md hover:border-primary/50 cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
        {clickable && (
          <div className="text-xs text-muted-foreground mt-1">
            Click to view details
          </div>
        )}
      </CardContent>
    </Card>
  );
}
