import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SalesChart } from "./_components/sales-chart";

async function getDashboardData() {
  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });
    const totalSales = await prisma.order.count();

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      totalSales: totalSales || 0,
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
        <SalesChart />
      </div>
    </div>
  );
}
