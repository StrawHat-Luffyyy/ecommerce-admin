"use client";

import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productFormSchema } from "@/lib/validations";
import { Product } from "@prisma/client";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData: Product | null;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue, // <-- Get setValue from the hook
    watch, // <-- Get watch from the hook
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price ? Number(initialData.price) : undefined,
      images: initialData?.images || [],
    },
  });

  // Watch the images array so we can display them
  const images = watch("images");

  //Handles successful upload ---
  const onUpload = (result: {
    info?:
    | string
    | {
      secure_url?: string;
      url?: string;
    };
  }) => {
    if (!result.info) return;

    // Handle case where info is a string URL
    if (typeof result.info === "string") {
      setValue("images", [...images, result.info]);
      return;
    }

    // Handle case where info is an object with secure_url or url
    const newImageUrl = result.info.secure_url || result.info.url;
    if (newImageUrl) {
      setValue("images", [...images, newImageUrl]);
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      setError(null);
      const method = initialData ? "PATCH" : "POST";
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
          `Failed to ${initialData ? "update" : "create"} product`
        );
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Images</label>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-md overflow-hidden"
            >
              <Image
                fill
                className="object-cover"
                alt="Product Image"
                src={url}
              />
            </div>
          ))}
        </div>

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={onUpload}
        >
          {({ open }) => {
            return (
              <Button type="button" variant="secondary" onClick={() => open()}>
                Upload an Image
              </Button>
            );
          }}
        </CldUploadWidget>
        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Product Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="w-full p-2 border rounded-md bg-transparent"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          className="w-full p-2 border rounded-md bg-transparent"
        />
        {errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
