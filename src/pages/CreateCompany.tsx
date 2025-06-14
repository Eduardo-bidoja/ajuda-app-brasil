
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

const companySchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CreateCompanyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { companyName: "" },
  });

  const handleCreateCompany = async (values: CompanyFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create a company.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: values.companyName,
        owner_id: user.id,
      })
      .select()
      .single();

    if (companyError || !companyData) {
      setLoading(false);
      toast({ title: "Error creating company", description: companyError?.message || "An unknown error occurred.", variant: "destructive" });
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ company_id: companyData.id })
      .eq('id', user.id);

    setLoading(false);

    if (profileError) {
      toast({ title: "Error updating profile", description: profileError.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your company has been created." });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create Your Company</CardTitle>
          <CardDescription>
            Just one more step. Let's get your company set up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleCreateCompany)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="My Awesome Company" {...form.register("companyName")} />
              {form.formState.errors.companyName && <p className="text-destructive text-sm">{form.formState.errors.companyName.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
