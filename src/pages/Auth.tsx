
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ownerSignUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const employeeSignUpSchema = ownerSignUpSchema;

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type OwnerSignUpFormValues = z.infer<typeof ownerSignUpSchema>;
type EmployeeSignUpFormValues = z.infer<typeof employeeSignUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const ownerSignUpForm = useForm<OwnerSignUpFormValues>({
    resolver: zodResolver(ownerSignUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const employeeSignUpForm = useForm<EmployeeSignUpFormValues>({
    resolver: zodResolver(employeeSignUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
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

  const handleSignIn = async (values: SignInFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
      <Tabs defaultValue="sign-in" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="owner-sign-up">Owner Sign Up</TabsTrigger>
          <TabsTrigger value="employee-sign-up">Employee Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input id="email-signin" type="email" placeholder="m@example.com" {...signInForm.register("email")} />
                  {signInForm.formState.errors.email && <p className="text-destructive text-sm">{signInForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input id="password-signin" type="password" {...signInForm.register("password")} />
                   {signInForm.formState.errors.password && <p className="text-destructive text-sm">{signInForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="owner-sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Owner Sign Up</CardTitle>
              <CardDescription>
                Create your business owner account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={ownerSignUpForm.handleSubmit(handleOwnerSignUp)} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="fullName-owner">Full Name</Label>
                  <Input id="fullName-owner" placeholder="John Doe" {...ownerSignUpForm.register("fullName")} />
                  {ownerSignUpForm.formState.errors.fullName && <p className="text-destructive text-sm">{ownerSignUpForm.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-owner-signup">Email</Label>
                  <Input id="email-owner-signup" type="email" placeholder="m@example.com" {...ownerSignUpForm.register("email")} />
                  {ownerSignUpForm.formState.errors.email && <p className="text-destructive text-sm">{ownerSignUpForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-owner-signup">Password</Label>
                  <Input id="password-owner-signup" type="password" {...ownerSignUpForm.register("password")} />
                  {ownerSignUpForm.formState.errors.password && <p className="text-destructive text-sm">{ownerSignUpForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="employee-sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Employee Sign Up</CardTitle>
              <CardDescription>
                Create your employee account to start tracking time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={employeeSignUpForm.handleSubmit(handleEmployeeSignUp)} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="fullName-employee">Full Name</Label>
                  <Input id="fullName-employee" placeholder="Jane Doe" {...employeeSignUpForm.register("fullName")} />
                  {employeeSignUpForm.formState.errors.fullName && <p className="text-destructive text-sm">{employeeSignUpForm.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-employee-signup">Email</Label>
                  <Input id="email-employee-signup" type="email" placeholder="jane@example.com" {...employeeSignUpForm.register("email")} />
                  {employeeSignUpForm.formState.errors.email && <p className="text-destructive text-sm">{employeeSignUpForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-employee-signup">Password</Label>
                  <Input id="password-employee-signup" type="password" {...employeeSignUpForm.register("password")} />
                  {employeeSignUpForm.formState.errors.password && <p className="text-destructive text-sm">{employeeSignUpForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
