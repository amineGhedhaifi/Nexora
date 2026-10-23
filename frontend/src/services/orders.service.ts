import { ORDERS_STORAGE_KEY } from "@/lib/constants";
import type { CreateOrderInput, Order } from "@/types/order";
import type { OrderConfirmation } from "@/services/orders-api.service";
import { ordersApiService, isOrderApiError } from "@/services/orders-api.service";

const TRACKING_TOKENS_KEY = "nexora-guest-tracking-tokens";

interface StoredOrder extends Order {
  /** The raw API response for reference. */
  apiResponse?: OrderConfirmation;
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

function readTrackingTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TRACKING_TOKENS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return (parsed as Record<string, string>) ?? {};
  } catch {
    return {};
  }
}

function writeTrackingTokens(tokens: Record<string, string>): void {
  try {
    localStorage.setItem(TRACKING_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // storage full or unavailable
  }
}

function getTrackingToken(orderId: string): string | undefined {
  const tokens = readTrackingTokens();
  return tokens[orderId];
}

function setTrackingToken(orderId: string, token: string): void {
  const tokens = readTrackingTokens();
  tokens[orderId] = token;
  writeTrackingTokens(tokens);
}

function parseShippingAddress(address: string): Partial<Order["shippingInfo"]> {
  // Best-effort parsing of the shipping address string.
  // Format: "street, city, postalCode, country"
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
  // Safely extract form data - handle both CreateOrderInput shape and the shape passed from Checkout
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
    const storedToken = getTrackingToken(orderId);
    const token = trackingToken ?? storedToken;
    const apiOrder = await ordersApiService.getOrder(orderId, token);
    return toFrontendOrder(apiOrder);
  } catch (error) {
    if (isOrderApiError(error)) {
      // Order not found or access denied - return null to fall back to localStorage
      return null;
    }
    // Network or server error - don't throw, fall back to localStorage
    return null;
  }
}

async function fetchOrdersFromApi(page = 1, limit = 10): Promise<Order[]> {
  try {
    const result = await ordersApiService.getMyOrders(page, limit);
    return result.orders.map((apiOrder) => toFrontendOrder(apiOrder));
  } catch (error) {
    if (isOrderApiError(error)) {
      // Auth failed or other API error - return empty to fall back to localStorage
      return [];
    }
    return [];
  }
}

export const ordersService = {
  /**
   * Store an order created via the API.
   * Merges the form data (with email, name parts, address breakdown)
   * with the API response (with server-calculated totals, status, items).
   */
  async storeOrder(apiOrder: OrderConfirmation, formData?: CreateOrderInput): Promise<Order> {
    const orders = readOrders();
    const order = toFrontendOrder(apiOrder, formData);
    const storedOrder: StoredOrder = {
      ...order,
      apiResponse: apiOrder,
    };
    writeOrders([storedOrder, ...orders]);

    // Store tracking token for guest orders
    if (apiOrder.trackingToken) {
      setTrackingToken(order.id, apiOrder.trackingToken);
    }

    return order;
  },

  /**
   * Get the guest tracking token for an order, if available.
   * Only returns a token for orders placed as a guest on this device.
   */
  getTrackingToken(orderId: string): string | undefined {
    return getTrackingToken(orderId);
  },

  /** Newest first. For authenticated users, fetches from API with localStorage fallback. */
  async getAll(): Promise<Order[]> {
    // Try to fetch from API for authenticated users
    const apiOrders = await fetchOrdersFromApi();
    if (apiOrders.length > 0) {
      // Merge with localStorage orders (for guests), avoiding duplicates by ID
      const localOrders = readOrders();
      const localOrderIds = new Set(localOrders.map((o) => o.id));
      const merged = [...apiOrders, ...localOrders.filter((o) => !localOrderIds.has(o.id))];
      return merged;
    }
    // Fallback to localStorage for guests or when API fails
    return readOrders();
  },

  async getById(id: string, trackingToken?: string): Promise<Order | null> {
    // First try localStorage (fast, works for guests with local orders)
    const localOrder = readOrders().find((order) => order.id === id);
    if (localOrder) return localOrder;

    // If not found locally, try API (for guests with tracking tokens or authenticated users)
    return fetchOrderFromApi(id, trackingToken);
  },
};