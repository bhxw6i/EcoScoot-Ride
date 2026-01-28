
import { Users, UserCog } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Profile } from './types';

interface UserTableProps {
  isLoading: boolean;
  filteredProfiles: Profile[];
  onViewUserDetails: (profile: Profile) => void;
  getFormattedDate: (dateString: string | null) => string;
}

export const UserTable = ({ 
  isLoading, 
  filteredProfiles, 
  onViewUserDetails,
  getFormattedDate
}: UserTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!filteredProfiles || filteredProfiles.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="py-12 text-center text-sm text-muted-foreground">
          <div className="mb-3">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          </div>
          <p>No customers found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.map((profile) => (
            <TableRow key={profile.id} className="border-b transition-colors hover:bg-muted/50">
              <TableCell className="font-medium">
                {profile.first_name || ''} {profile.last_name || ''}
              </TableCell>
              <TableCell>{profile.email || '-'}</TableCell>
              <TableCell>{profile.phone || '-'}</TableCell>
              <TableCell>{getFormattedDate(profile.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewUserDetails(profile)}
                >
                  <UserCog className="h-4 w-4 mr-1" />
                  Manage User
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
