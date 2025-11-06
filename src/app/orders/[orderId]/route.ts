import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;
    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }
    const order = await prisma.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        status,
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
