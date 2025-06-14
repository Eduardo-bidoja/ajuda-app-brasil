
import * as z from 'zod';

export const ownerSignUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const employeeSignUpSchema = ownerSignUpSchema;

export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type OwnerSignUpFormValues = z.infer<typeof ownerSignUpSchema>;
export type EmployeeSignUpFormValues = z.infer<typeof employeeSignUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
