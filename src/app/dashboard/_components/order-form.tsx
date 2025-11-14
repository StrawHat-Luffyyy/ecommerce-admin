"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from "@/components/ui/table";
import { TrashIcon } from "@radix-ui/react-icons";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderFormProps {
  products: Product[]; // Products passed from the server
}
export function OrderForm({ products }: OrderFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  //State for the product selection
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate the total whenever the cart changes
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const handleAddProduct = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const qty = Number(selectedQuantity);
    // Check if product is already in the cart
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
        },
      ]);
    }
  };

  //Remove Product
  const handleRemoveProduct = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };
  // On Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Cannot create an empty order. Please add products.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const orderData = {
      customerName,
      customerEmail,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }
      // Success Redirect to the main orders page
      router.push("/dashboard/orders");
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
    console.log("Submitting Order:", orderData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Order submitted (simulation)");
    setIsSubmitting(false);
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* CUSTOMER DETAILS */}
      <div className="space-y-4">
        <h2 className="text-xl text-gray-700 font-semibold">
          Customer Details
        </h2>
        <Input
          className="w-1/5 mt-2 mb-2 rounded-md mr-2 "
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <Input
          className="  w-1/5 mt-2 mb-2 rounded-md "
          type="email"
          placeholder="Customer Email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          required
        />
      </div>

      {/* ADD PRODUCTS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add Products</h2>
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={(value) => setSelectedProductId(value)}
            value={selectedProductId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({formatCurrency(product.price)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* QUANTITY FIXED so it's ALWAYS a number */}
          <Input
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => {
              const value = Number(e.target.value);
              setSelectedQuantity(isNaN(value) ? 1 : value);
            }}
            className="w-24"
          />

          <Button type="button" onClick={handleAddProduct}>
            Add
          </Button>
        </div>
      </div>

      {/* CART TABLE */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Order</h2>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cart.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No products added yet.
                  </TableCell>
                </TableRow>
              ) : (
                cart.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-2xl font-bold text-right">
          Total: {formatCurrency(total)}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Order"}
      </Button>
    </form>
  );
}
