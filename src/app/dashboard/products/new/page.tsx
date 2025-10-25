"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          price: parseFloat(price),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create product");
      }
      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-mg transparent"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price
          </label>
          <input
            id="price"
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
