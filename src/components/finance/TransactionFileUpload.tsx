
import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEntityFileUpload } from "@/hooks/useEntityFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Paperclip, FileText, Loader2, ExternalLink, X, AlertTriangle } from "lucide-react";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { mutateAsync: uploadFile } = useEntityFileUpload();

  // Current files list - ensure it's always an array
  const files = Array.isArray(existingFiles) ? existingFiles : [];

  const validateFileSelection = (fileList: FileList): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    
    Array.from(fileList).forEach(file => {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name}: файл слишком большой (максимум 50MB)`);
        return;
      }
      
      // Check if file already exists
      const fileExists = files.some(existingFile => 
        existingFile.name === file.name || 
        existingFile.name.includes(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'))
      );
      
      if (fileExists) {
        errors.push(`${file.name}: файл с таким именем уже загружен`);
        return;
      }
      
      valid.push(file);
    });
    
    return { valid, errors };
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user?.id) return;
    
    setUploadError(null);
    const { valid: validFiles, errors } = validateFileSelection(e.target.files);
    
    if (errors.length > 0) {
      setUploadError(errors.join('; '));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    if (validFiles.length === 0) return;
    
    // If we have a transaction ID, upload immediately
    if (transactionId) {
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        const uploadedFiles = [];
        
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          setUploadProgress(((i + 1) / validFiles.length) * 100);
          
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
        
      } catch (error: any) {
        console.error("Error uploading files:", error);
        setUploadError(error.message || "Произошла ошибка при загрузке файлов");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // If no transaction ID, store files as pending for later upload
      const newPendingFiles = [...pendingFiles, ...validFiles];
      setPendingFiles(newPendingFiles);
      
      // Create temporary file objects for display
      const tempFiles = validFiles.map(file => ({
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
    
    setIsUploading(true);
    const uploadedFiles = [];
    
    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        setUploadProgress(((i + 1) / pendingFiles.length) * 100);
        
        const uploadedFile = await uploadFile({
          file,
          entityType: "transactions",
          entityId: newTransactionId,
          userId: user.id,
        });
        uploadedFiles.push(uploadedFile);
      }
      
      setPendingFiles([]);
      return uploadedFiles;
    } catch (error) {
      console.error("Error uploading pending files:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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
    setUploadError(null); // Clear any previous errors when removing files
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.jpg,.jpeg,.png,.gif,.webp"
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
      
      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Загрузка файлов... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
      
      {/* Upload Error */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {/* File Upload Guidelines */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Поддерживаемые форматы: PDF, DOC, XLS, PPT, TXT, CSV, ZIP, изображения</p>
        <p>Максимальный размер файла: 50MB</p>
        {!transactionId && (
          <p className="text-amber-600">Файлы будут загружены после создания операции</p>
        )}
      </div>

      {files && files.length > 0 ? (
        <div className="border rounded-md">
          <ul className="divide-y">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 hover:bg-accent/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {file.size && <span>{formatFileSize(file.size)}</span>}
                      {file.isPending && (
                        <span className="text-amber-600 bg-amber-100 px-1 rounded">
                          Ожидает загрузки
                        </span>
                      )}
                    </div>
                  </div>
                  {!file.isPending && file.url !== "#" && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
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
