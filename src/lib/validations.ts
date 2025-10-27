import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters long.",
  }),
  price: z.number().positive({
    message: "Price must be a positive number.",
  }),
});
