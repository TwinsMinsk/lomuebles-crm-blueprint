
import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEntityFileUpload } from "@/hooks/useEntityFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, FileText, Loader2, ExternalLink, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadSectionProps {
  entityType: string;
  entityId?: number | string;
  existingFiles: any[] | null;
  onFilesChange: (files: any[]) => void;
  label?: string;
}

export const FileUploadSection = ({
  entityType,
  entityId,
  existingFiles = [],
  onFilesChange,
  label = "Прикрепленные файлы",
}: FileUploadSectionProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: uploadFile } = useEntityFileUpload();

  // Current files list - ensure it's always an array
  const files = Array.isArray(existingFiles) ? existingFiles : [];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user?.id || !entityId) return;
    
    setIsUploading(true);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const newFile = await uploadFile({
          file,
          entityType,
          entityId,
          userId: user.id,
        });
        
        uploadedFiles.push(newFile);
      }
      
      // Combine existing files with new uploads
      const updatedFiles = [...files, ...uploadedFiles];
      onFilesChange(updatedFiles);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{label}</h3>
        
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isUploading || !entityId}
            className="max-w-md"
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !entityId}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </Button>
        </div>
        
        {!entityId && (
          <p className="text-xs text-muted-foreground">
            Файлы можно будет загрузить после создания записи
          </p>
        )}
      </div>

      {files && files.length > 0 ? (
        <div className="border rounded-md">
          <ul className="divide-y">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 hover:bg-accent/50">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const marker = '/storage/v1/object/public/';
                      let targetUrl = file.url as string;
                      const idx = targetUrl.indexOf(marker);
                      if (idx !== -1) {
                        const after = targetUrl.substring(idx + marker.length);
                        const firstSlash = after.indexOf('/');
                        if (firstSlash > -1) {
                          const bucket = after.substring(0, firstSlash);
                          const path = after.substring(firstSlash + 1);
                          const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 5);
                          if (data?.signedUrl) targetUrl = data.signedUrl;
                        }
                      }
                      window.open(targetUrl, '_blank', 'noopener,noreferrer');
                    } catch (e) {
                      console.error('Failed to open file', e);
                    }
                  }}
                  className="flex items-center gap-2 flex-1 text-sm hover:underline text-primary text-left"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Нет прикрепленных файлов</p>
      )}
    </div>
  );
};
