
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { employeeSignUpSchema, type EmployeeSignUpFormValues } from '@/lib/schemas/auth';
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

export function EmployeeSignUpForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<EmployeeSignUpFormValues>({
    resolver: zodResolver(employeeSignUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const handleEmployeeSignUp = async (values: EmployeeSignUpFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: 'employee',
        },
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link to join your company.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Sign Up</CardTitle>
        <CardDescription>
          Create your employee account to start tracking time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleEmployeeSignUp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName-employee">Full Name</Label>
            <Input id="fullName-employee" placeholder="Jane Doe" {...form.register("fullName")} />
            {form.formState.errors.fullName && <p className="text-destructive text-sm">{form.formState.errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-employee-signup">Email</Label>
            <Input id="email-employee-signup" type="email" placeholder="jane@example.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-employee-signup">Password</Label>
            <Input id="password-employee-signup" type="password" {...form.register("password")} />
            {form.formState.errors.password && <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
