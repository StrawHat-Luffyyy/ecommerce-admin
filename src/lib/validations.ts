import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive("Price must be positive")
  ),
});