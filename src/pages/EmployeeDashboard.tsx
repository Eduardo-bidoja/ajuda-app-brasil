
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ClockInOut from '@/components/ClockInOut';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

// Manually defining TimeEntry type
type TimeEntry = {
  id: string;
  clock_in: string;
  clock_out: string | null;
};

const fetchTimeEntries = async (userId: string) => {
    const { data, error } = await supabase
        .from('time_entries')
        .select('id, clock_in, clock_out')
        .eq('user_id', userId)
        .order('clock_in', { ascending: false })
        .limit(10);
    
    if (error) throw new Error(error.message);
    return data;
};

export default function EmployeeDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['timeEntries', user?.id],
    queryFn: () => fetchTimeEntries(user!.id),
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '---';
    return format(parseISO(dateString), "dd/MM/yy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="container mx-auto p-4">
       <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">Dashboard do Funcionário</h1>
        <div className="flex items-center gap-4">
           <p className="text-muted-foreground">{profile?.full_name || user?.email}</p>
           <Button onClick={handleSignOut} variant="outline">Sair</Button>
        </div>
      </header>
      
      <div className="mb-8">
        <ClockInOut />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Seus Últimos Registros</h3>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Saída</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        </TableRow>
                    ))}
                    {timeEntries && timeEntries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.clock_in)}</TableCell>
                            <TableCell>{formatDate(entry.clock_out)}</TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && timeEntries?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                Nenhum registro de ponto encontrado.
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
