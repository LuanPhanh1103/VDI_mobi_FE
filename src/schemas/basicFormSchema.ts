import { z } from 'zod';

export const basicFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z
    .string()
    .email('Please enter a valid email address'),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  
  country: z
    .string()
    .min(1, 'Please select a country'),
  
  state: z
    .string()
    .min(1, 'Please select a state'),
  
  city: z
    .string()
    .min(1, 'Please select a city'),
});

export type BasicFormData = z.infer<typeof basicFormSchema>;
