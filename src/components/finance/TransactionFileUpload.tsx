
import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEntityFileUpload } from "@/hooks/useEntityFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, FileText, Loader2, ExternalLink, X } from "lucide-react";

interface TransactionFileUploadProps {
  transactionId?: string;
  existingFiles: any[] | null;
  onFilesChange: (files: any[]) => void;
}

export const TransactionFileUpload = ({
  transactionId,
  existingFiles = [],
  onFilesChange,
}: TransactionFileUploadProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { mutateAsync: uploadFile } = useEntityFileUpload();

  // Current files list - ensure it's always an array
  const files = Array.isArray(existingFiles) ? existingFiles : [];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user?.id) return;
    
    const newFiles = Array.from(e.target.files);
    
    // If we have a transaction ID, upload immediately
    if (transactionId) {
      setIsUploading(true);
      
      try {
        const uploadedFiles = [];
        
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const newFile = await uploadFile({
            file,
            entityType: "transactions",
            entityId: transactionId,
            userId: user.id,
          });
          
          uploadedFiles.push(newFile);
        }
        
        // Combine existing files with new uploads
        const updatedFiles = [...files, ...uploadedFiles];
        onFilesChange(updatedFiles);
        
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no transaction ID, store files as pending for later upload
      const newPendingFiles = [...pendingFiles, ...newFiles];
      setPendingFiles(newPendingFiles);
      
      // Create temporary file objects for display
      const tempFiles = newFiles.map(file => ({
        name: file.name,
        url: "#", // Temporary URL
        uploaded_at: new Date().toISOString(),
        size: file.size,
        type: file.type,
        isPending: true
      }));
      
      const updatedFiles = [...files, ...tempFiles];
      onFilesChange(updatedFiles);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to upload pending files after transaction is created
  const uploadPendingFiles = async (newTransactionId: string) => {
    if (pendingFiles.length === 0 || !user?.id) return [];
    
    const uploadedFiles = [];
    
    for (const file of pendingFiles) {
      try {
        const uploadedFile = await uploadFile({
          file,
          entityType: "transactions",
          entityId: newTransactionId,
          userId: user.id,
        });
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        console.error("Error uploading pending file:", error);
      }
    }
    
    setPendingFiles([]);
    return uploadedFiles;
  };

  // Expose the upload function for parent components
  (TransactionFileUpload as any).uploadPendingFiles = uploadPendingFiles;

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    
    // If it's a pending file, also remove from pendingFiles
    if (fileToRemove.isPending) {
      const pendingIndex = pendingFiles.findIndex(pf => pf.name === fileToRemove.name);
      if (pendingIndex !== -1) {
        const newPendingFiles = [...pendingFiles];
        newPendingFiles.splice(pendingIndex, 1);
        setPendingFiles(newPendingFiles);
      }
    }
    
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="max-w-md"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>
      </div>
      
      {!transactionId && (
        <p className="text-xs text-muted-foreground">
          Файлы будут загружены после создания операции
        </p>
      )}

      {files && files.length > 0 ? (
        <div className="border rounded-md">
          <ul className="divide-y">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 hover:bg-accent/50">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm">{file.name}</span>
                  {file.isPending && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-1 rounded">
                      Ожидает загрузки
                    </span>
                  )}
                  {!file.isPending && file.url !== "#" && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
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

export default TransactionFileUpload;
