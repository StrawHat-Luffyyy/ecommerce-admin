import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), {
        status: 400,
      });
    }
    const { name, price } = validation.data;
    const product = await prisma.product.create({
      data: {
        name: name,
        price: price,
        isArchived: false,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
