import { ORDERS_STORAGE_KEY } from "@/lib/constants";
import type { CreateOrderInput, Order } from "@/types/order";

/**
 * The only layer that knows where orders live.
 * Today: this browser's localStorage, so guests (and everyone else) can see
 * their orders on this device without an account, email or tracking number.
 * Later: the Express API stores orders and links guest orders to the visitor
 * with an httpOnly cookie. Only this file changes.
 */

const MOCK_LATENCY_MS = 600;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // storage full or unavailable
  }
}

function generateOrderId(existing: Order[]): string {
  const taken = new Set(existing.map((order) => order.id));
  let id = "";
  do {
    id = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (taken.has(id));
  return id;
}

export const ordersService = {
  async create(input: CreateOrderInput): Promise<Order> {
    // TODO (backend): POST /api/orders
    await wait(MOCK_LATENCY_MS);
    const orders = readOrders();
    const order: Order = {
      ...input,
      id: generateOrderId(orders),
      status: "ordered",
      createdAt: new Date().toISOString(),
    };
    writeOrders([order, ...orders]);
    return order;
  },

  /** Newest first. */
  async getAll(): Promise<Order[]> {
    // TODO (backend): GET /api/orders
    await wait(300);
    return readOrders();
  },

  async getById(id: string): Promise<Order | null> {
    // TODO (backend): GET /api/orders/:id
    await wait(300);
    return readOrders().find((order) => order.id === id) ?? null;
  },
};
