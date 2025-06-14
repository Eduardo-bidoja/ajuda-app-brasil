
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (profile) {
      if (profile.role === 'admin') {
        if (!profile.company_id) {
          navigate('/create-company');
        } else {
          navigate('/dashboard');
        }
      } else if (profile.role === 'employee') {
        if (!profile.company_id) {
          navigate('/join-company');
        } else {
          navigate('/employee-dashboard');
        }
      }
    }
    // If there's a user but no profile yet, the hook is still loading it,
    // so we wait. The effect will re-run when profile is updated.

  }, [loading, user, profile, navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <h1 className="text-2xl font-semibold">Loading Your Experience</h1>
        <p className="text-lg text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
};

export default Index;
