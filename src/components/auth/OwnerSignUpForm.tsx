
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ownerSignUpSchema, type OwnerSignUpFormValues } from '@/lib/schemas/auth';
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

export function OwnerSignUpForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<OwnerSignUpFormValues>({
    resolver: zodResolver(ownerSignUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const handleOwnerSignUp = async (values: OwnerSignUpFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: 'admin',
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
        description: "Check your email for the confirmation link.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Sign Up</CardTitle>
        <CardDescription>
          Create your business owner account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleOwnerSignUp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName-owner">Full Name</Label>
            <Input id="fullName-owner" placeholder="John Doe" {...form.register("fullName")} />
            {form.formState.errors.fullName && <p className="text-destructive text-sm">{form.formState.errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-owner-signup">Email</Label>
            <Input id="email-owner-signup" type="email" placeholder="m@example.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-owner-signup">Password</Label>
            <Input id="password-owner-signup" type="password" {...form.register("password")} />
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
