
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { OwnerSignUpForm } from "@/components/auth/OwnerSignUpForm";
import { EmployeeSignUpForm } from "@/components/auth/EmployeeSignUpForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
      <Tabs defaultValue="sign-in" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="owner-sign-up">Owner Sign Up</TabsTrigger>
          <TabsTrigger value="employee-sign-up">Employee Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <SignInForm />
        </TabsContent>
        <TabsContent value="owner-sign-up">
          <OwnerSignUpForm />
        </TabsContent>
        <TabsContent value="employee-sign-up">
          <EmployeeSignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
