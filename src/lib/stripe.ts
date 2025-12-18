import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Webhook configuration
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: "usd",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
  shippingCountries: ["US"], // Expand as needed
} as const;
