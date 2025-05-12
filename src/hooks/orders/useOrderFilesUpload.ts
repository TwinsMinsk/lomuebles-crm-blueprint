
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadFileParams {
  file: File;
  orderId: number;
  userId: string;
}

interface UploadFileResult {
  name: string;
  url: string;
  uploaded_at: string;
  size?: number;
  type?: string;
}

const uploadOrderFile = async ({ file, orderId, userId }: UploadFileParams): Promise<UploadFileResult> => {
  // Create a unique path for the file using userId, orderId and timestamp
  const timestamp = Date.now();
  const filePath = `${userId}/${orderId}/${timestamp}_${file.name}`;

  // Upload the file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('order_files')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from('order_files')
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded file");
  }

  // Return the file metadata
  return {
    name: file.name,
    url: urlData.publicUrl,
    uploaded_at: new Date().toISOString(),
    size: file.size,
    type: file.type
  };
};

export const useOrderFilesUpload = () => {
  const mutation = useMutation({
    mutationFn: uploadOrderFile,
    onSuccess: () => {
      toast.success("Файл успешно загружен");
    },
    onError: (error: any) => {
      console.error("Error uploading file:", error);
      toast.error(`Ошибка загрузки файла: ${error.message}`);
    }
  });

  return mutation;
};
