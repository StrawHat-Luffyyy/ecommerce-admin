import { ProductForm } from "../[productId]/_components/product-form";

export default function NewProductPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <ProductForm initialData={null} />
    </div>
  );
}
