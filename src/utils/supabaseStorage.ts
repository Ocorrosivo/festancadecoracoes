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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("admin_token", token);
    formData.append("bucket", BUCKET);
    formData.append("folder", folder);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/upload-product-image`;

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const contentType = response.headers.get("content-type");
      let data: any = null;
      let errorText = "";

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        errorText = await response.text();
      }

      if (!response.ok) {
        const message = data?.error || errorText || `HTTP status ${response.status}`;
        const err = new Error(message);
        (err as any).context = { status: response.status };
        return { data: null, error: err };
      }

      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
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

  if (error) {
    const status = (error as any).context?.status || 500;
    const errorMsg = error.message || "Erro desconhecido";
    throw new Error(`Erro ao enviar imagem: ${errorMsg}`);
  }

  const result = data as { error?: string; url?: string; success?: boolean } | null;
  if (result?.error || result?.success === false) {
    throw new Error(`Erro ao enviar imagem: ${result?.error || "Desconhecido"}`);
  }
  if (!result?.url) {
    throw new Error("Erro ao enviar imagem: Falha ao obter a URL da imagem.");
  }

  return result.url;
};
