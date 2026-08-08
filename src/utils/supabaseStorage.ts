import { supabase } from "@/integrations/supabase/client";

export type StorageFolder =
  | "banners"
  | "logos"
  | "favicon"
  | "produtos"
  | "categorias"
  | "configuracoes";

/**
 * Uploads a file to Supabase storage under a specific folder.
 * Returns the public URL of the uploaded file.
 */
export const uploadStorageFile = async (
  file: File,
  folder: StorageFolder
): Promise<string> => {
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  // Upload to festanca-storage bucket
  const { data, error } = await supabase.storage
    .from("festanca-storage")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    // If festanca-storage bucket is not found or fails, fallback to edge function or data URL
    console.warn("Direct storage upload warning:", error.message);
    
    // Fallback: Convert file to Base64 Data URL if bucket isn't setup on server yet
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  const { data: publicData } = supabase.storage
    .from("festanca-storage")
    .getPublicUrl(data.path);

  return publicData.publicUrl;
};
