/**
 * Vercel AI Gateway: auth vía `vercel env pull` → `VERCEL_OIDC_TOKEN`, o `AI_GATEWAY_API_KEY`.
 * @see https://vercel.com/docs/ai-gateway
 */
export function aiGatewayEnabled(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}
