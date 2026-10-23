import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { adminOrdersService } from "@/services/admin-orders.service";
import type { AdminOrderDetails } from "@/types/order";
import { getErrorMessage } from "@/services/api";

interface OrderDetailsViewProps {
  order: AdminOrderDetails | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onStatusUpdate: (order: AdminOrderDetails, newStatus: string) => void;
}

function OrderDetailsView({ order, loading, error, onClose, onStatusUpdate }: OrderDetailsViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-center gap-3" role="alert">
          <AlertCircle className="size-5 text-destructive shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

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
        open={true}
        onClose={onClose}
        order={order}
        onStatusUpdate={onStatusUpdate}
      />
    </div>
  );
}

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      adminOrdersService
        .getOrderById(id)
        .then((data) => {
          setOrder(data);
        })
        .catch((err) => {
          setError(getErrorMessage(err));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [id]);

  const handleStatusUpdate = () => {
    // The dialog will handle the confirmation and API call
    // We just need to pass the data
  };

  const handleClose = () => {
    // Navigate back to orders list
    window.history.back();
  };

  return (
    <OrderDetailsView
      order={order}
      loading={loading}
      error={error}
      onClose={handleClose}
      onStatusUpdate={handleStatusUpdate}
    />
  );
}