// GHL payment link for the Mind Dump product. Set VITE_MIND_DUMP_CHECKOUT_URL in Vercel
// (a public URL, not a secret). Empty hides the buy button.
export const MIND_DUMP_CHECKOUT_URL: string =
  (import.meta.env.VITE_MIND_DUMP_CHECKOUT_URL as string | undefined) ?? '';
