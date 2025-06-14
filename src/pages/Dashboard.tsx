
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Manually defining Company type to fix build errors
type Company = {
  id: string;
  owner_id: string;
  name: string;
  company_code: string;
  created_at: string;
};

// Manually defining Profile type to match use-auth.tsx
type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'admin' | 'employee';
  company_id: string | null;
  hourly_rate: number | null;
  created_at: string;
};


export default function Dashboard() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (profile?.company_id) {
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
      }
    };
    if (profile) {
      fetchCompany();
    }
  }, [profile]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (profile?.company_id) {
        setLoadingEmployees(true);
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('id, full_name, email, hourly_rate')
          .eq('company_id', profile.company_id)
          .eq('role', 'employee');

        if (error) {
          console.error("Error fetching employees", error);
          setEmployees([]);
        } else if (data) {
          setEmployees(data);
        }
        setLoadingEmployees(false);
      } else if (profile) {
        setLoadingEmployees(false);
      }
    };
    
    if (profile) {
        fetchEmployees();
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || typeof value === 'undefined') return '---';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">Painel do Administrador</h1>
        <div className="flex items-center gap-4">
           <p className="text-muted-foreground">{profile?.full_name || user?.email}</p>
           <Button onClick={handleSignOut} variant="outline">Sair</Button>
        </div>
      </header>
      
      {company ? (
        <div className="mt-4 p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-semibold">{company.name}</h2>
          <p className="text-muted-foreground mt-2">Share this unique code with your employees to let them join:</p>
          <p className="text-2xl font-mono bg-muted text-muted-foreground p-3 rounded inline-block mt-2">{company.company_code}</p>
        </div>
      ) : (
        <p>Nenhuma informação da empresa encontrada.</p>
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Funcionários</h3>
          <Button disabled>Adicionar Funcionário</Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Valor/Hora</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEmployees ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-[64px] inline-block" />
                    </TableCell>
                  </TableRow>
                ))
              ) : employees.length > 0 ? (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.full_name || 'N/A'}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{formatCurrency(employee.hourly_rate)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

