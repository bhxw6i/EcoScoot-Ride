
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system preferences</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>Manage your account information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email Address
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="admin@example.com"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Admin Name
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Admin User"
                />
              </div>
              
              <div className="pt-2">
                <Button>Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Manage alerts and notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="low-battery"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked
                />
                <label htmlFor="low-battery" className="text-sm font-medium leading-none">
                  Low Battery Alerts
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="maintenance"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked
                />
                <label htmlFor="maintenance" className="text-sm font-medium leading-none">
                  Maintenance Notifications
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-bookings"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked
                />
                <label htmlFor="new-bookings" className="text-sm font-medium leading-none">
                  New Booking Alerts
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="support"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked
                />
                <label htmlFor="support" className="text-sm font-medium leading-none">
                  Customer Support Requests
                </label>
              </div>
              
              <div className="pt-2">
                <Button>Update Preferences</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
