
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttachedFile {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

interface AttachedFilesDisplayProps {
  files: AttachedFile[] | null | undefined;
  maxDisplayCount?: number;
  showDownloadIcon?: boolean;
  compact?: boolean;
}

const AttachedFilesDisplay: React.FC<AttachedFilesDisplayProps> = ({
  files,
  maxDisplayCount = 3,
  showDownloadIcon = true,
  compact = false
}) => {
  if (!files || files.length === 0) {
    return (
      <span className="text-gray-400 text-sm">
        Нет файлов
      </span>
    );
  }

  const displayFiles = files.slice(0, maxDisplayCount);
  const remainingCount = files.length - maxDisplayCount;

  const openFile = (url: string, name: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-3 w-3 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-3 w-3 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="h-3 w-3 text-green-500" />;
      default:
        return <FileText className="h-3 w-3 text-gray-500" />;
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        {displayFiles.map((file, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openFile(file.url, file.name);
            }}
            className="h-auto p-1 justify-start text-xs hover:bg-blue-50"
          >
            <div className="flex items-center gap-1 truncate">
              {getFileIcon(file.name)}
              <span className="truncate max-w-[120px]" title={file.name}>
                {file.name}
              </span>
              {showDownloadIcon && <ExternalLink className="h-2 w-2 ml-1 flex-shrink-0" />}
            </div>
          </Button>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs w-fit">
            +{remainingCount} файл{remainingCount === 1 ? '' : (remainingCount < 5 ? 'а' : 'ов')}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayFiles.map((file, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openFile(file.url, file.name);
          }}
          className="h-auto p-2 justify-start text-sm hover:bg-blue-50 w-full"
        >
          <div className="flex items-center gap-2 truncate">
            {getFileIcon(file.name)}
            <span className="truncate flex-1 text-left" title={file.name}>
              {file.name}
            </span>
            {showDownloadIcon && <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />}
          </div>
        </Button>
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-sm">
          +{remainingCount} файл{remainingCount === 1 ? '' : (remainingCount < 5 ? 'а' : 'ов')}
        </Badge>
      )}
    </div>
  );
};

export default AttachedFilesDisplay;
