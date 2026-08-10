import { supabase } from "@/integrations/supabase/client";
import {
  getAccessToken,
  refreshAccessToken,
  handleExpiredSession,
  SessionExpiredError,
} from "@/utils/adminSession";

/** Erro 401 vindo de uma Edge Function (token rejeitado no servidor). */
const isUnauthorized = (error: unknown, data: unknown): boolean => {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  if (status === 401) return true;
  const message = (data as { error?: string } | null)?.error ?? "";
  return /sessão inválida|sessão expirada|não autorizado/i.test(message);
};

interface InvokeOptions {
  /**
   * Quando false, um `{ error }` no corpo da resposta é devolvido ao chamador
   * em vez de virar exceção. Útil para telas que tratam mensagens específicas
   * do servidor (ex.: falta de privilégios). O tratamento de 401 + refresh
   * continua valendo nos dois modos.
   */
  throwOnPayloadError?: boolean;
}

/**
 * Invoca uma Edge Function administrativa com token sempre válido.
 *
 * O token é obtido imediatamente antes da chamada. Se o servidor ainda
 * responder 401, força um refresh e repete a chamada UMA única vez. Se o
 * segundo 401 vier, a sessão é encerrada e o usuário volta ao login.
 */
export const invokeAdminFunction = async <T = unknown>(
  functionName: string,
  payload: Record<string, unknown> = {},
  { throwOnPayloadError = true }: InvokeOptions = {}
): Promise<T> => {
  const run = async (token: string) =>
    supabase.functions.invoke(functionName, {
      body: { ...payload, admin_token: token },
    });

  let token: string;
  try {
    token = await getAccessToken();
  } catch {
    await handleExpiredSession();
    throw new SessionExpiredError();
  }

  let { data, error } = await run(token);

  if (isUnauthorized(error, data)) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      await handleExpiredSession();
      throw new SessionExpiredError();
    }
    ({ data, error } = await run(refreshed));

    if (isUnauthorized(error, data)) {
      await handleExpiredSession();
      throw new SessionExpiredError();
    }
  }

  if (error) throw error;
  if (throwOnPayloadError && (data as { error?: string } | null)?.error) {
    throw new Error((data as { error: string }).error);
  }

  return data as T;
};

/** Atalho para a Edge Function admin-data. */
export const invokeAdminData = <T = unknown>(payload: Record<string, unknown>) =>
  invokeAdminFunction<T>("admin-data", payload);
