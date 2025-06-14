
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const joinCompanySchema = z.object({
  companyCode: z.string().length(6, { message: "Company code must be 6 digits." }),
});

type JoinCompanyFormValues = z.infer<typeof joinCompanySchema>;

export default function JoinCompanyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<JoinCompanyFormValues>({
    resolver: zodResolver(joinCompanySchema),
    defaultValues: { companyCode: "" },
  });

  const handleJoinCompany = async (values: JoinCompanyFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: company, error: companyError } = await (supabase as any)
      .from('companies')
      .select('id')
      .eq('company_code', values.companyCode)
      .single();

    if (companyError || !company) {
      setLoading(false);
      toast({ title: "Invalid Code", description: "No company found with that code. Please check and try again.", variant: "destructive" });
      return;
    }

    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .update({ company_id: company.id })
      .eq('id', user.id);
    
    setLoading(false);

    if (profileError) {
      toast({ title: "Error joining company", description: profileError.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "You have joined the company." });
      navigate('/employee-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Join Your Company</CardTitle>
          <CardDescription>Enter the 6-digit code provided by your employer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleJoinCompany)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyCode">Company Code</Label>
              <Input id="companyCode" placeholder="123456" {...form.register("companyCode")} />
              {form.formState.errors.companyCode && <p className="text-destructive text-sm">{form.formState.errors.companyCode.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining..." : "Join Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
