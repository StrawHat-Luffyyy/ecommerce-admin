import { prisma } from '@/lib/prisma';
import { OrderForm } from '@/app/dashboard/_components/order-form'

// This is a Server Component, so we can fetch data directly
export default async function NewOrderPage() {
  // Fetch all non-archived products to pass to the form
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Order</h1>
      {/* Pass the products to the client component form */}
      <OrderForm products={products} />
    </div>
  );
}