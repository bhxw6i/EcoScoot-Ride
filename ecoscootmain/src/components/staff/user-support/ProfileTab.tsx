
import { Mail, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Profile } from './types';

interface ProfileTabProps {
  profile: Profile;
  getFormattedDate: (dateString: string | null) => string;
}

export const ProfileTab = ({ profile, getFormattedDate }: ProfileTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">
          {profile.first_name?.[0] || ''}
          {profile.last_name?.[0] || ''}
        </div>
        <div>
          <h3 className="font-medium text-lg">
            {profile.first_name || ''} {profile.last_name || ''}
          </h3>
          <p className="text-sm text-muted-foreground">
            Customer since {getFormattedDate(profile.created_at)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 py-2">
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <div className="flex items-center mt-1">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{profile.email || 'Not provided'}</span>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Phone</Label>
          <div className="flex items-center mt-1">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{profile.phone || 'Not provided'}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Date of Birth</Label>
          <p className="text-sm">{getFormattedDate(profile.date_of_birth)}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Gender</Label>
          <p className="text-sm capitalize">{profile.gender || 'Not provided'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">License Number</Label>
          <p className="text-sm">{profile.license_number || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">License Validity</Label>
          <p className="text-sm">{getFormattedDate(profile.license_validity)}</p>
        </div>
      </div>
      
      <div>
        <Label className="text-xs text-muted-foreground">User ID</Label>
        <p className="text-sm font-mono text-xs">{profile.id}</p>
      </div>
    </div>
  );
};
