/**
 * CORS compartilhado por todas as Edge Functions.
 *
 * Origens fixas conhecidas. Deploys de preview da Vercel recebem subdomínios
 * aleatórios, por isso *.vercel.app é validado por padrão (ver isAllowed).
 */
const STATIC_ORIGINS = [
  "https://festancadecoracoes.com.br",
  "https://www.festancadecoracoes.com.br",
  "https://gray-echidna-179762.hostingersite.com",
  "http://localhost:5173",
  "http://localhost:8080",
];

/** Permite adicionar origens sem novo deploy: ALLOWED_ORIGINS="https://a.com,https://b.com" */
function extraOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function isAllowed(origin: string): boolean {
  if (STATIC_ORIGINS.includes(origin) || extraOrigins().includes(origin)) {
    return true;
  }
  // Produção e previews da Vercel: https://<qualquer-coisa>.vercel.app
  return /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/.test(origin);
}

/**
 * Cabeçalhos de CORS para a requisição.
 *
 * Só devolve Access-Control-Allow-Origin quando a origem é permitida. Devolver
 * a origem "errada" como fallback fazia o navegador bloquear a requisição com
 * uma mensagem enganosa de falha de conexão.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    // Inclui os x-supabase-client-* enviados pelo supabase-js ao invocar
    // funções e ao fazer upload; sem eles o preflight falha.
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, " +
      "x-supabase-client-platform, x-supabase-client-platform-version, " +
      "x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}
