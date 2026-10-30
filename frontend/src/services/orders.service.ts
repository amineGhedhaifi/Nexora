import { ORDERS_STORAGE_KEY } from "@/lib/constants";
import type { CreateOrderInput, Order } from "@/types/order";
import type { OrderConfirmation } from "@/services/orders-api.service";
import { ordersApiService, isOrderApiError } from "@/services/orders-api.service";

const GUEST_ORDER_REFS_KEY = "nexora-guest-order-refs";
const LEGACY_TRACKING_TOKENS_KEY = "nexora-guest-tracking-tokens";

interface StoredOrder extends Order {
  /** The raw API response for reference. */
  apiResponse?: OrderConfirmation;
}

interface GuestOrderRef {
  orderId: string;
  trackingToken: string;
}

function readOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: StoredOrder[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // storage full or unavailable
  }
}

function readGuestOrderRefs(): GuestOrderRef[] {
  try {
    const raw = localStorage.getItem(GUEST_ORDER_REFS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((ref): ref is GuestOrderRef =>
        typeof ref === "object" && ref !== null && typeof ref.orderId === "string" && typeof ref.trackingToken === "string"
      );
    }
    return [];
  } catch {
    return [];
  }
}

function writeGuestOrderRefs(refs: GuestOrderRef[]): void {
  try {
    localStorage.setItem(GUEST_ORDER_REFS_KEY, JSON.stringify(refs));
  } catch {
    // storage full or unavailable
  }
}

function migrateLegacyTrackingTokens(): GuestOrderRef[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_TRACKING_TOKENS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const legacy = parsed as Record<string, string>;
    const migrated: GuestOrderRef[] = Object.entries(legacy)
      .filter(([, token]) => typeof token === "string" && token.length > 0)
      .map(([orderId, trackingToken]) => ({ orderId, trackingToken }));
    if (migrated.length === 0) return null;

    // Merge with any existing refs, deduplicating by orderId
    const existingRefs = readGuestOrderRefs();
    const existingIds = new Set(existingRefs.map((r) => r.orderId));
    const merged = [...existingRefs, ...migrated.filter((r) => !existingIds.has(r.orderId))];

    writeGuestOrderRefs(merged);
    // Remove legacy key only after successful write
    localStorage.removeItem(LEGACY_TRACKING_TOKENS_KEY);
    return merged;
  } catch {
    // Migration failed - leave legacy data intact for next attempt
    return null;
  }
}

function getTrackingTokenFromRefs(orderId: string): string | undefined {
  const refs = readGuestOrderRefs();
  const ref = refs.find((r) => r.orderId === orderId);
  return ref?.trackingToken;
}

function setTrackingTokenInRefs(orderId: string, token: string): void {
  const refs = readGuestOrderRefs();
  const existingIndex = refs.findIndex((r) => r.orderId === orderId);
  if (existingIndex >= 0) {
    refs[existingIndex] = { orderId, trackingToken: token };
  } else {
    refs.push({ orderId, trackingToken: token });
  }
  writeGuestOrderRefs(refs);
}

function parseShippingAddress(address: string): Partial<Order["shippingInfo"]> {
  const parts = address.split(",").map((p) => p.trim());
  return {
    address: parts[0] ?? "",
    city: parts[1] ?? "",
    postalCode: parts[2] ?? "",
    country: parts[3] ?? "",
  };
}

interface FormShippingInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

function toFrontendOrder(apiOrder: OrderConfirmation, formData?: CreateOrderInput): Order {
  const formShippingInfo = (formData as { shippingInfo?: FormShippingInfo } | undefined)?.shippingInfo;
  const firstName = formShippingInfo?.firstName ?? "";
  const lastName = formShippingInfo?.lastName ?? "";
  const email = formShippingInfo?.email ?? "";
  const addressParts = parseShippingAddress(apiOrder.shippingAddress);

  const statusMap: Record<string, Order["status"]> = {
    PENDING: "ordered",
    CONFIRMED: "ordered",
    SHIPPED: "shipping",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  return {
    id: apiOrder.id,
    items: apiOrder.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: item.unitPrice,
      image: item.product.imageUrl,
      quantity: item.quantity,
    })),
    shippingInfo: {
      firstName,
      lastName,
      email,
      phone: apiOrder.customerPhone,
      address: addressParts.address ?? apiOrder.shippingAddress,
      city: addressParts.city ?? "",
      postalCode: addressParts.postalCode ?? "",
      country: addressParts.country ?? "",
    },
    subtotal: apiOrder.totalAmount,
    shippingCost: 0,
    total: apiOrder.totalAmount,
    status: statusMap[apiOrder.status] ?? "ordered",
    createdAt: apiOrder.createdAt,
  };
}

async function fetchOrderFromApi(orderId: string, trackingToken?: string): Promise<Order | null> {
  try {
    const apiOrder = await ordersApiService.getOrder(orderId, trackingToken);
    return toFrontendOrder(apiOrder);
  } catch (error) {
    if (isOrderApiError(error)) {
      // Order not found (404), access denied (403), or other API error - return null
      return null;
    }
    // Network error or other unexpected error - re-throw so TanStack Query can handle retry/error state
    throw error;
  }
}

async function fetchOrdersFromApi(page = 1, limit = 10): Promise<Order[]> {
  try {
    const result = await ordersApiService.getMyOrders(page, limit);
    return result.orders.map((apiOrder) => toFrontendOrder(apiOrder));
  } catch (error) {
    if (isOrderApiError(error)) {
      return [];
    }
    throw error;
  }
}

export const ordersService = {
  async storeOrder(apiOrder: OrderConfirmation, formData?: CreateOrderInput): Promise<Order> {
    const order = toFrontendOrder(apiOrder, formData);
    const storedOrder: StoredOrder = {
      ...order,
      apiResponse: apiOrder,
    };

    // Write order and tracking token atomically (best effort)
    // First, add order to localStorage (avoid duplicates)
    const orders = readOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = storedOrder;
    } else {
      orders.unshift(storedOrder);
    }

    // Write both order and tracking token
    let ordersWriteSuccess = false;
    let tokenWriteSuccess = false;

    try {
      writeOrders(orders);
      ordersWriteSuccess = true;
    } catch {
      // storage full or unavailable - order not persisted
    }

    if (apiOrder.trackingToken) {
      try {
        setTrackingTokenInRefs(order.id, apiOrder.trackingToken);
        tokenWriteSuccess = true;
      } catch {
        // storage full or unavailable - token not persisted
      }
    } else {
      // No token to persist - consider this a success for token part
      tokenWriteSuccess = true;
    }

    // If order was written but token failed, we have an untrackable order.
    // This is a partial failure - log for debugging but don't throw (order creation succeeded on backend).
    if (ordersWriteSuccess && !tokenWriteSuccess && apiOrder.trackingToken) {
      // Intentionally empty; untrackable orders are accepted as partial success.
    }

    return order;
  },

  getTrackingToken(orderId: string): string | undefined {
    // Attempt migration on first token lookup
    migrateLegacyTrackingTokens();
    return getTrackingTokenFromRefs(orderId);
  },

  async getAll(): Promise<Order[]> {
    const apiOrders = await fetchOrdersFromApi();
    if (apiOrders.length > 0) {
      const localOrders = readOrders();
      const localOrderIds = new Set(localOrders.map((o) => o.id));
      const merged = [...apiOrders, ...localOrders.filter((o) => !localOrderIds.has(o.id))];
      return merged;
    }
    return readOrders();
  },

  async getById(id: string, trackingToken?: string): Promise<Order | null> {
    const token = trackingToken ?? getTrackingTokenFromRefs(id);

    if (token) {
      const apiOrder = await fetchOrderFromApi(id, token);
      if (apiOrder) return apiOrder;
      // API returned 404/403 or other error - don't fall back to stale localStorage
      return null;
    }

    // No tracking token available - order cannot be verified with backend
    // Return null to indicate unverified status rather than stale data
    return null;
  },

  getGuestOrderRefs(): GuestOrderRef[] {
    migrateLegacyTrackingTokens();
    return readGuestOrderRefs();
  },

  /** Returns the locally cached order without backend verification. For display-only purposes. */
  getLocalOrder(id: string): Order | undefined {
    return readOrders().find((order) => order.id === id);
  },
};