'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import { productSchema } from '@/lib/validations';


const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
});



type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create product');

      router.push('/dashboard/products');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name</label>
          <input 
            id="name" 
            {...register('name')}
            className="w-full p-2 border rounded-md bg-transparent" 
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
          <input 
            id="price" 
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="w-full p-2 border rounded-md bg-transparent" 
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}