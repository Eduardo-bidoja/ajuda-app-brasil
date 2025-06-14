import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

// Manually defining Company type to fix build errors
type Company = {
  id: string;
  owner_id: string;
  name: string;
  company_code: string;
  created_at: string;
};

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (profile?.company_id) {
        setLoading(true);
        const { data, error } = await (supabase as any)
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
        
        if (error) {
          console.error("Error fetching company", error);
        } else {
          setCompany(data);
        }
        setLoading(false);
      } else if (profile) {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
           <p className="text-muted-foreground">{profile?.full_name || user?.email}</p>
           <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
        </div>
      </header>
      
      {company ? (
        <div className="mt-4 p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-semibold">{company.name}</h2>
          <p className="text-muted-foreground mt-2">Share this unique code with your employees to let them join:</p>
          <p className="text-2xl font-mono bg-muted text-muted-foreground p-3 rounded inline-block mt-2">{company.company_code}</p>
        </div>
      ) : (
        <p>No company information found.</p>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Employee List</h3>
        <p className="text-muted-foreground mt-2">Employee management will be available here soon.</p>
      </div>
    </div>
  );
}
