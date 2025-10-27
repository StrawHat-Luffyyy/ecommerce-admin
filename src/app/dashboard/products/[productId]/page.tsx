import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductForm } from './_components/product-form';
import { ReactElement } from 'react';

// In Next.js 15+, params is a Promise
export default async function ProductEditPage(props: { 
  params: Promise<{ productId: string }> 
}): Promise<ReactElement> {
  
  // 1. Await the params Promise
  const params = await props.params;
  const productId = params.productId;

  // 2. Check if productId exists
  if (!productId) {
    throw new Error("FATAL: Product ID was not found in the page props.");
  }

  // 3. Fetch the product
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductForm initialData={product} />
    </div>
  );
}