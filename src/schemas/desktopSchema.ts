import { z } from 'zod';

export const desktopSchema = z.object({
  name: z
    .string()
    .min(5, 'Desktop name must be at least 5 characters')
    .max(100, 'Desktop name must be less than 100 characters'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  
  userId: z
    .string()
    .min(1, 'Please select a user'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type DesktopFormData = z.infer<typeof desktopSchema>;
