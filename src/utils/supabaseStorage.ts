import { supabase } from "@/integrations/supabase/client";
import {
  getAccessToken,
  refreshAccessToken,
  handleExpiredSession,
  SessionExpiredError,
} from "@/utils/adminSession";

export type StorageFolder =
  | "banners"
  | "logos"
  | "favicon"
  | "produtos"
  | "categorias"
  | "configuracoes";

/** Bucket único da aplicação. Deve casar com ALLOWED_BUCKETS da Edge Function. */
const BUCKET = "festanca-storage";

const isUnauthorized = (error: unknown, data: unknown): boolean => {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  if (status === 401) return true;
  const message = (data as { error?: string } | null)?.error ?? "";
  return /sessão inválida|sessão expirada|não autorizado/i.test(message);
};

/**
 * Envia um arquivo para o Storage via Edge Function e devolve a URL pública.
 *
 * O access_token é obtido imediatamente antes de cada tentativa. Em caso de
 * 401, renova a sessão e repete o upload UMA única vez; se falhar de novo,
 * encerra a sessão e volta ao login.
 */
export const uploadStorageFile = async (
  file: File,
  folder: StorageFolder
): Promise<string> => {
  const run = async (token: string) => {
    // FormData precisa ser recriado por tentativa: o stream é consumido no envio.
    const formData = new FormData();
    formData.append("file", file);
    formData.append("admin_token", token);
    formData.append("bucket", BUCKET);
    formData.append("folder", folder);

    return supabase.functions.invoke("upload-product-image", { body: formData });
  };

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

  const result = data as { error?: string; url?: string } | null;
  if (result?.error) throw new Error(result.error);
  if (!result?.url) throw new Error("Falha no upload da imagem.");

  return result.url;
};
