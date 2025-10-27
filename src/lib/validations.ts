import { z } from "zod";

// Schema for API validation (accepts strings and coerces)
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
});

// Schema specifically for the form (strict number type)
export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
});