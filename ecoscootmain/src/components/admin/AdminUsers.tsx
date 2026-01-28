
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserTable from './UserTable';
import UserSearchBar from './UserSearchBar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from 'lucide-react';

interface UserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  status: string;
  role_name: string;
  role_id: number;
}

interface Role {
  id: number;
  name: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error("Error fetching roles:", error);
        throw error;
      }
      
      console.log("Roles fetched successfully:", rolesData);
      setRoles(rolesData || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error fetching roles",
        description: "There was a problem retrieving role data.",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles with email explicitly selected
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at, role_id');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles data retrieved:", profilesData?.length, "profiles");
      
      // Count customers (role_id = 1)
      const customersCount = profilesData?.filter(profile => profile.role_id === 1).length || 0;
      setCustomerCount(customersCount);
      
      // Get roles data to map role IDs to names
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, name');
      
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }
      
      // Create a map of role ids to role names
      const roleMap = new Map();
      rolesData?.forEach(role => {
        roleMap.set(role.id, role.name);
      });
      
      console.log("Role mapping:", Object.fromEntries(roleMap.entries()));
      
      // Map profiles to user data format with proper handling for null values
      const mappedUsers = profilesData?.map(profile => {
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          created_at: profile.created_at || new Date().toISOString(),
          status: 'active', // Default status
          role_name: roleMap.get(profile.role_id) || 'user',
          role_id: profile.role_id
        };
      }) || [];
      
      console.log("Final mapped users:", mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: "There was a problem retrieving user data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'manage' | 'changeRole' | 'suspend' | 'notify') => {
    console.log(`User action: ${action} for user: ${userId}`);
    
    if (action === 'changeRole') {
      const user = users.find(u => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setSelectedRoleId(user.role_id);
        setIsRoleDialogOpen(true);
      }
    } else if (action === 'manage') {
      // Future implementation for managing user details
      toast({
        title: "Coming Soon",
        description: "User management details page is under development.",
      });
    } else if (action === 'notify') {
      // Future implementation for notifications
      toast({
        title: "Coming Soon",
        description: "User notification functionality is under development.",
      });
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: selectedRoleId })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Update user in local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === selectedUser.id) {
            const roleName = roles.find(r => r.id === selectedRoleId)?.name || 'user';
            return { ...user, role_id: selectedRoleId, role_name: roleName };
          }
          return user;
        })
      );

      toast({
        title: "Role updated",
        description: `User role has been updated successfully.`,
      });

      setIsRoleDialogOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: "There was a problem updating the user role.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
      </header>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-xl">Customer Overview</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Users className="h-4 w-4 mr-2 text-green-500" />
              <span>Total Customers: <span className="font-medium">{customerCount}</span></span>
            </CardDescription>
          </div>
          <UserSearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userCount={users.length}
          />
        </CardHeader>
        <CardContent>
          <UserTable 
            users={filteredUsers}
            isLoading={isLoading}
            onUserAction={handleUserAction}
            showRoleManagement={true}
          />
        </CardContent>
      </Card>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={selectedRoleId?.toString()} 
                onValueChange={(value) => setSelectedRoleId(parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
