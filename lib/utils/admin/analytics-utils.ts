import { Order } from "@/lib/types/orders";
import { User } from "@/lib/types/users"; /**
 * Filters orders based on a time range string
 */
export const getFilteredOrders = (orders: any[], range: string) => {
  const now = new Date();
  return orders.filter((order) => {
    const orderDate = new Date(order.created_at);

    if (range === "Last 7 Days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= sevenDaysAgo;
    }

    if (range === "Last Month") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= thirtyDaysAgo;
    }

    return true; // All Time
  });
};

/**
 * Formats data for the Pie Chart (Order Status)
 */
export const getPieData = (filteredOrders: any[]) => {
  const counts = filteredOrders.reduce(
    (acc, order) => {
      const s = order.status.toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return ["completed", "processing", "pending", "cancelled"]
    .map((status) => ({
      status,
      count: counts[status] || 0,
      fill: `var(--color-${status})`,
    }))
    .filter((item) => item.count > 0);
};

/**
 * Formats data for Top Selling Products Bar Chart
 */
export const getTopSellingProducts = (filteredOrders: any[]) => {
  const counts: Record<string, { name: string; quantity: number }> = {};

  filteredOrders.forEach((order) => {
    if (!order.order_items || !Array.isArray(order.order_items)) return;

    order.order_items.forEach((item: any) => {
      const productId = item.product_id;
      const productName = item.product?.name || "Unknown Product";

      if (!counts[productId]) {
        counts[productId] = { name: productName, quantity: 0 };
      }
      counts[productId].quantity += item.quantity || 0;
    });
  });

  return Object.values(counts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      quantity: item.quantity,
    }));
};

/**
 * Formats data for Revenue Area Chart
 */
export const getRevenueChartData = (filteredOrders: any[], range: string) => {
  const revenueMap: Record<
    string,
    { label: string; revenue: number; timestamp: number }
  > = {};

  filteredOrders.forEach((order) => {
    const date = new Date(order.created_at);
    let label = "";
    let groupKey = "";

    if (range === "Last 7 Days") {
      label = date.toLocaleDateString("en-US", { weekday: "short" });
      groupKey = date.toISOString().split("T")[0];
    } else if (range === "Last Month") {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      groupKey = date.toISOString().split("T")[0];
    } else {
      label = date.toLocaleDateString("en-US", { month: "long" });
      groupKey = `${date.getFullYear()}-${date.getMonth()}`;
    }

    if (!revenueMap[groupKey]) {
      revenueMap[groupKey] = {
        label,
        revenue: 0,
        timestamp: date.getTime(),
      };
    }
    revenueMap[groupKey].revenue += order.total_price;
  });

  return Object.values(revenueMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ label, revenue }) => ({ month: label, revenue }));
};

/**
 * Formats data for User Activity Line Chart
 */
export const getUserActivityData = (users: any[], range: string) => {
  if (!users?.length) return [];
  const customerUsers = users.filter((u) => u.role === "user");
  const now = new Date();
  let cutoffDate = new Date(0);

  if (range === "Last 7 Days")
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (range === "Last Month")
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const monthlyCounts: Record<string, number> = {};

  customerUsers.forEach((user) => {
    const userDate = new Date(user.created_at);
    if (userDate >= cutoffDate) {
      const monthYear = userDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    }
  });

  return Object.entries(monthlyCounts)
    .map(([month, count]) => ({ month, users: count }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};
