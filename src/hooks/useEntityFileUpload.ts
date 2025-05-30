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
 * Sanitizes a filename to ensure it's safe for storage
 * @param filename Original filename
 * @returns Sanitized filename safe for storage
 */
const sanitizeFilename = (filename: string): string => {
  // Remove or replace problematic characters
  let sanitized = filename
    // Replace Cyrillic and other non-ASCII characters with transliteration or remove them
    .replace(/[а-яё]/gi, (char) => {
      const cyrillicMap: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return cyrillicMap[char.toLowerCase()] || '';
    })
    // Replace spaces and special characters with underscores
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    // Remove multiple consecutive underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
    // Ensure it's not empty
    || 'file';

  // Split filename and extension
  const lastDotIndex = sanitized.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return sanitized;
  }
  
  const name = sanitized.substring(0, lastDotIndex);
  const extension = sanitized.substring(lastDotIndex);
  
  // Limit filename length (keeping room for timestamp and extension)
  const maxNameLength = 50;
  const truncatedName = name.length > maxNameLength ? name.substring(0, maxNameLength) : name;
  
  return truncatedName + extension;
};

/**
 * Validates file before upload
 * @param file File to validate
 * @returns Validation result with success flag and error message
 */
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (limit to 50MB)
  const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `Файл слишком большой. Максимальный размер: 50MB`
    };
  }

  // Check file type (allow common document and image types)
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Неподдерживаемый тип файла: ${file.type}`
    };
  }

  return { isValid: true };
};

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
    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);
    
    // Create a unique path for the file with timestamp
    const timestamp = Date.now();
    const filePath = `${entityType}/${userId}/${entityId}/${timestamp}_${sanitizedFilename}`;
    const bucketName = 'crm_files';

    console.log('Uploading file:', {
      originalName: file.name,
      sanitizedName: sanitizedFilename,
      filePath,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite existing files
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        
        // Provide more specific error messages
        if (uploadError.message.includes('The resource already exists')) {
          throw new Error('Файл с таким именем уже существует. Попробуйте переименовать файл.');
        } else if (uploadError.message.includes('Invalid key')) {
          throw new Error('Недопустимое имя файла. Используйте только латинские символы и цифры.');
        } else if (uploadError.message.includes('Payload too large')) {
          throw new Error('Файл слишком большой для загрузки.');
        } else {
          throw new Error(`Ошибка загрузки файла: ${uploadError.message}`);
        }
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Не удалось создать публичную ссылку на загруженный файл");
      }

      console.log('File uploaded successfully:', {
        path: uploadData.path,
        url: urlData.publicUrl
      });

      // Return the file metadata
      return {
        name: file.name, // Keep original name for display
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
    onSuccess: (result) => {
      console.log('File upload completed:', result);
      toast.success("Файл успешно загружен");
    },
    onError: (error: any) => {
      console.error("Error uploading file:", error);
      toast.error(`Ошибка загрузки файла: ${error.message}`);
    }
  });
};
