import { supabase } from "@/integrations/supabase/client";

/** Chave única com os dados de exibição do admin (nome, papel, permissões). */
const PROFILE_KEY = "festanca_admin_profile";

/** Margem de segurança: renova o token se faltar menos que isto para expirar. */
const REFRESH_MARGIN_SECONDS = 120;

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
}

/** Lançado quando não há sessão válida e o refresh não foi possível. */
export class SessionExpiredError extends Error {
  constructor(message = "Sessão expirada. Faça login novamente.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

/**
 * Retorna um access_token garantidamente válido.
 *
 * Fonte única de verdade: supabase.auth.getSession(). Se o token estiver
 * expirado (ou perto disso), força refreshSession(). Nunca devolve um token
 * expirado e nunca lê JWT do localStorage.
 */
export const getAccessToken = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new SessionExpiredError();

  const session = data.session;
  if (!session?.access_token) throw new SessionExpiredError();

  const expiresAt = session.expires_at ?? 0;
  const secondsLeft = expiresAt - Math.floor(Date.now() / 1000);

  if (secondsLeft > REFRESH_MARGIN_SECONDS) {
    return session.access_token;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) throw new SessionExpiredError();
  return refreshed;
};

/**
 * Força a renovação da sessão. Devolve o novo access_token ou null se o
 * refresh_token também já não for válido.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) return null;
  return data.session.access_token;
};

/** Existe sessão utilizável agora (renovando se necessário)? */
export const hasValidSession = async (): Promise<boolean> => {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
};

export const setAdminProfile = (profile: AdminProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

/** Dados apenas de exibição. A autorização real é sempre server-side. */
export const getAdminProfile = (): AdminProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch {
    return null;
  }
};

/** Encerra a sessão no Supabase Auth e limpa os dados locais de exibição. */
export const adminLogout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } finally {
    localStorage.removeItem(PROFILE_KEY);
  }
};

/** Redireciona para o login preservando o histórico limpo. */
export const redirectToLogin = (): void => {
  window.location.replace("/admin");
};

/** Sessão irrecuperável: faz logout e volta para o login. */
export const handleExpiredSession = async (): Promise<void> => {
  await adminLogout();
  redirectToLogin();
};
