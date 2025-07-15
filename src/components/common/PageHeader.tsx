
import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, subtitle, action }) => {
  const displayDescription = description || subtitle;
  
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {displayDescription && (
          <p className="text-muted-foreground mt-2">{displayDescription}</p>
        )}
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
