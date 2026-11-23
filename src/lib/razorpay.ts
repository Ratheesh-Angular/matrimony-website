const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export type RazorpayPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type CreateOrderParams = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export type CreatePlanParams = {
  period: RazorpayPeriod;
  interval: number;
  item: {
    name: string;
    amount: number;
    currency?: string;
    description?: string;
  };
  notes?: Record<string, string>;
};

export type CreateSubscriptionParams = {
  plan_id: string;
  total_count: number;
  customer_notify?: 0 | 1;
  quantity?: number;
  notes?: Record<string, string>;
  start_at?: number;
  expire_by?: number;
};

type RazorpayErrorBody = {
  error?: { description?: string; code?: string };
};

function getKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  if (!keyId) {
    throw new Error("RAZORPAY_KEY_ID is not configured");
  }
  return keyId;
}

function getKeySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured");
  }
  return secret;
}

function getWebhookSecret(): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export function getPublicRazorpayKeyId(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim() ||
    ""
  );
}

function toBase64(value: string): string {
  if (typeof btoa === "function") {
    return btoa(value);
  }
  // Node / Workers fallback
  return Buffer.from(value, "utf8").toString("base64");
}

function basicAuthHeader(): string {
  return `Basic ${toBase64(`${getKeyId()}:${getKeySecret()}`)}`;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function razorpayRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T & RazorpayErrorBody;

  if (!response.ok) {
    const message =
      data?.error?.description ||
      `Razorpay request failed (${response.status}) for ${path}`;
    throw new Error(message);
  }

  return data;
}

export async function createOrder(params: CreateOrderParams) {
  const currency = params.currency || "INR";
  return razorpayRequest<{
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status: string;
    notes?: Record<string, string>;
  }>("/orders", "POST", {
    amount: params.amount,
    currency,
    receipt: params.receipt,
    notes: params.notes,
  });
}

export async function createPlan(params: CreatePlanParams) {
  return razorpayRequest<{
    id: string;
    period: RazorpayPeriod;
    interval: number;
    item: {
      id: string;
      name: string;
      amount: number;
      currency: string;
      description?: string;
    };
    notes?: Record<string, string>;
  }>("/plans", "POST", {
    period: params.period,
    interval: params.interval,
    item: {
      name: params.item.name,
      amount: params.item.amount,
      currency: params.item.currency || "INR",
      description: params.item.description,
    },
    notes: params.notes,
  });
}

export async function createSubscription(params: CreateSubscriptionParams) {
  return razorpayRequest<{
    id: string;
    plan_id: string;
    status: string;
    total_count: number;
    paid_count: number;
    current_start?: number | null;
    current_end?: number | null;
    notes?: Record<string, string>;
  }>("/subscriptions", "POST", {
    plan_id: params.plan_id,
    total_count: params.total_count,
    customer_notify: params.customer_notify ?? 1,
    quantity: params.quantity ?? 1,
    notes: params.notes,
    start_at: params.start_at,
    expire_by: params.expire_by,
  });
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd = false,
) {
  return razorpayRequest<{
    id: string;
    status: string;
    total_count: number;
    paid_count: number;
    current_start?: number | null;
    current_end?: number | null;
  }>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    "POST",
    { cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 },
  );
}

export async function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<boolean> {
  const expected = await hmacSha256Hex(
    getKeySecret(),
    `${params.orderId}|${params.paymentId}`,
  );
  return timingSafeEqual(expected, params.signature);
}

export async function verifySubscriptionSignature(params: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}): Promise<boolean> {
  const expected = await hmacSha256Hex(
    getKeySecret(),
    `${params.paymentId}|${params.subscriptionId}`,
  );
  return timingSafeEqual(expected, params.signature);
}

export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const expected = await hmacSha256Hex(getWebhookSecret(), rawBody);
  return timingSafeEqual(expected, signatureHeader);
}
