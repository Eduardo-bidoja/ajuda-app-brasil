
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="container mx-auto p-4">
       <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <div className="flex items-center gap-4">
           <p className="text-muted-foreground">{profile?.full_name || user?.email}</p>
           <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
        </div>
      </header>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Clock In / Clock Out</h3>
        <p className="text-muted-foreground mt-2">Time tracking functionality will be here soon.</p>
      </div>
    </div>
  );
}
