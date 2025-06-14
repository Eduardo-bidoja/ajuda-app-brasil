
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Clock, Locate, LocateOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Manually defining TimeEntry type as supabase/types.ts is not yet updated
type TimeEntry = {
  id: string;
  user_id: string;
  company_id: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
  clock_out_latitude: number | null;
  clock_out_longitude: number | null;
};

const fetchLatestTimeEntry = async (userId: string): Promise<TimeEntry | null> => {
  const { data, error } = await (supabase as any)
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('clock_out', null)
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export default function ClockInOut() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { getPosition, loading: geoLoading, error: geoError } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: latestTimeEntry, isLoading: isLoadingTimeEntry } = useQuery({
    queryKey: ['latestTimeEntry', user?.id],
    queryFn: () => fetchLatestTimeEntry(user!.id),
    enabled: !!user,
  });

  const clockInMutation = useMutation({
    mutationFn: async (coords: GeolocationCoordinates | null): Promise<TimeEntry> => {
      const { data, error } = await (supabase as any).from('time_entries').insert({
        user_id: user!.id,
        company_id: profile!.company_id!,
        clock_in: new Date().toISOString(),
        clock_in_latitude: coords?.latitude,
        clock_in_longitude: coords?.longitude,
      }).select().single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success('Ponto de entrada registrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['latestTimeEntry', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries', user?.id] });
    },
    onError: (error) => {
      toast.error('Erro ao registrar ponto', { description: error.message });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async ({ id, coords }: { id: string, coords: GeolocationCoordinates | null }): Promise<TimeEntry> => {
      const { data, error } = await (supabase as any)
        .from('time_entries')
        .update({
          clock_out: new Date().toISOString(),
          clock_out_latitude: coords?.latitude,
          clock_out_longitude: coords?.longitude,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success('Ponto de saída registrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['latestTimeEntry', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries', user?.id] });
    },
    onError: (error) => {
      toast.error('Erro ao registrar ponto de saída', { description: error.message });
    },
  });

  const handleAction = async (action: 'clock_in' | 'clock_out') => {
    setIsSubmitting(true);
    try {
      const coords = await getPosition();
      if (action === 'clock_in') {
        await clockInMutation.mutateAsync(coords);
      } else if (action === 'clock_out' && latestTimeEntry) {
        await clockOutMutation.mutateAsync({ id: latestTimeEntry.id, coords });
      }
    } catch (error: any) {
      // Don't show toast for geolocation error if it's already displayed by the icon
      if (!geoError) {
        toast.error('Erro de Geolocalização', {
            description: error.message || 'Não foi possível obter sua localização. Verifique as permissões.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const loading = isLoadingTimeEntry || isSubmitting || geoLoading;
  const clockedIn = !!latestTimeEntry;

  return (
    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Registro de Ponto</h3>
          {clockedIn ? (
             <p className="text-primary mt-1">
                Trabalhando há {formatDistanceToNow(parseISO(latestTimeEntry.clock_in), { addSuffix: false, locale: ptBR })}
            </p>
          ) : (
            <p className="text-muted-foreground mt-1">Você não está em horário de trabalho.</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {loading && <Loader2 className="animate-spin" />}
          {geoError && <LocateOff className="text-destructive" />}

          {!clockedIn && (
            <Button size="lg" onClick={() => handleAction('clock_in')} disabled={loading}>
              <Locate className="mr-2" /> Bater Ponto (Entrada)
            </Button>
          )}

          {clockedIn && (
            <Button size="lg" variant="destructive" onClick={() => handleAction('clock_out')} disabled={loading}>
              <Clock className="mr-2" /> Bater Ponto (Saída)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
