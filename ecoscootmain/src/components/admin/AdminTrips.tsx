
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban } from "lucide-react";

export default function AdminTrips() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trip Monitoring</h1>
          <p className="text-muted-foreground mt-1">This feature has been removed</p>
        </div>
      </header>
      
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Feature Removed</CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center">
          <Ban className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            Trip monitoring functionality has been removed from the admin dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
