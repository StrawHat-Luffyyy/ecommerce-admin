import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SalesChart } from "./_components/sales-chart";
import { RecentOrders } from "./_components/recent-orders";

async function getDashboardData() {
  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });
    const totalSales = await prisma.order.count();

    const monthlyRevenue = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: {
        total: true,
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    const graphData: { name: string; total: number }[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (const monthName of monthNames) {
      graphData.push({ name: monthName, total: 0 });
    }
    for (const orderGroup of monthlyRevenue) {
      const month = new Date(orderGroup.createdAt).getMonth(); // 0 for Jan, 1 for Feb, etc.
      graphData[month].total += orderGroup._sum.total || 0;
    }

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      totalSales: totalSales || 0,
      graphData: graphData,
      recentOrders: recentOrders,
    };
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    throw new Error("Failed to fetch data");
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.totalSales}</div>
          </CardContent>
        </Card>
        <SalesChart data={data.graphData} />
        <RecentOrders orders={data.recentOrders} />
      </div>
    </div>
  );
}
