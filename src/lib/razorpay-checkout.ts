export type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

export type RazorpayOrderSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpaySubscriptionSuccess = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export type OpenRazorpayCheckoutOptions = {
  key: string;
  name?: string;
  description?: string;
  image?: string;
  currency?: string;
  amount?: number;
  order_id?: string;
  subscription_id?: string;
  prefill?: RazorpayPrefill;
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (
    response: RazorpayOrderSuccess | RazorpaySubscriptionSuccess,
  ) => void | Promise<void>;
  onDismiss?: () => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: () => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout requires a browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay checkout")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  }).catch((err) => {
    scriptPromise = null;
    throw err;
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(
  options: OpenRazorpayCheckoutOptions,
): Promise<RazorpayInstance> {
  if (!options.key) {
    throw new Error("Razorpay key is required");
  }
  if (!options.order_id && !options.subscription_id) {
    throw new Error("order_id or subscription_id is required");
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK is unavailable");
  }

  const instance = new window.Razorpay({
    key: options.key,
    name: options.name,
    description: options.description,
    image: options.image,
    currency: options.currency || "INR",
    amount: options.amount,
    order_id: options.order_id,
    subscription_id: options.subscription_id,
    prefill: options.prefill,
    notes: options.notes,
    theme: options.theme,
    handler: options.handler,
    modal: {
      ondismiss: options.onDismiss,
    },
  });

  if (options.onDismiss) {
    instance.on("payment.failed", options.onDismiss);
  }

  instance.open();
  return instance;
}

export function isOrderSuccess(
  response: RazorpayOrderSuccess | RazorpaySubscriptionSuccess,
): response is RazorpayOrderSuccess {
  return "razorpay_order_id" in response;
}

export function isSubscriptionSuccess(
  response: RazorpayOrderSuccess | RazorpaySubscriptionSuccess,
): response is RazorpaySubscriptionSuccess {
  return "razorpay_subscription_id" in response;
}
