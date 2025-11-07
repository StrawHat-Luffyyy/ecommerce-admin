import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }
    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return NextResponse.json(
      { message: "Internal error", error: String(error) },
      { status: 500 }
    );
  }
}
