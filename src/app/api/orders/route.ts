import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, items } = body;
    if (!customerName || !customerEmail || !items || items.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    // --- Server-Side Price Calculation ---
    // Fetch product prices from the DB to ensure the total is correct
    // and not manipulated on the client.
    const productIds = items.map(
      (item: { productId: string }) => item.productId
    );
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });
    let total = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      total += product.price * item.quantity;
    }

    // --- Create the Order and OrderItems in a Transaction ---
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        total,
        status: "Pending", 
        items: {
          create: items.map(
            (item: { productId: string; quantity: number }) => ({
              product: {
                connect: { id: item.productId },
              },
              quantity: item.quantity,
            })
          ),
        },
      },
      include: {
        items: true, // Include the created items in the response
      },
    });
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("[ORDER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
