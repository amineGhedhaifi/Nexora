import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { mockOrders } from "./Orders";

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<typeof mockOrders[0] | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (id) {
      const found = mockOrders.find((o) => o.id === id);
      setOrder(found ?? null);
    }
  }, [id]);

  if (!order) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          <p className="mt-1 text-muted-foreground">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        <p className="mt-1 text-muted-foreground">View and manage order {order.id}</p>
      </div>

      <OrderDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        order={order}
        onStatusUpdate={() => {}}
      />
    </div>
  );
}