import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { productSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();


    const validation = productSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, price } = validation.data;
    
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        price,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}