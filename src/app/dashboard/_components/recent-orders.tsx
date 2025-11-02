import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma } from "@prisma/client";

type OrderWithItemsAndProducts = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } };
}>;

interface RecentOrdersProps {
  orders: OrderWithItemsAndProducts[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>A list of your most recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.customerEmail}
                  </div>
                </TableCell>
                <TableCell>
                  {order.items.map((item) => item.product.name).join(", ")}
                </TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
