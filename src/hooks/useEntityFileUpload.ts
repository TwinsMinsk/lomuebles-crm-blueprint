
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadParams {
  file: File;
  entityType: string;
  entityId: number | string;
  userId: string;
}

interface FileUploadResult {
  name: string;
  url: string;
  uploaded_at: string;
  size?: number;
  type?: string;
}

/**
 * Universal hook for uploading files related to different entities in the CRM
 * 
 * @returns A mutation object for file uploads
 */
export const useEntityFileUpload = () => {
  const uploadEntityFile = async ({
    file,
    entityType,
    entityId,
    userId,
  }: FileUploadParams): Promise<FileUploadResult> => {
    // Create a unique path for the file
    const timestamp = Date.now();
    const filePath = `${entityType}/${userId}/${entityId}/${timestamp}_${file.name}`;
    const bucketName = 'crm_files';

    try {
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucketName)
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
    } catch (error) {
      console.error('Error in file upload process:', error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: uploadEntityFile,
    onSuccess: () => {
      toast.success("Файл успешно загружен");
    },
    onError: (error: any) => {
      console.error("Error uploading file:", error);
      toast.error(`Ошибка загрузки файла: ${error.message}`);
    }
  });
};
