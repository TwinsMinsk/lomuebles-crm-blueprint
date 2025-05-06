
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the Lead type with profile information
interface ProfileData {
  full_name: string | null;
}

export type LeadWithProfile = Tables<"leads"> & {
  profiles: ProfileData | null;
};

interface LeadTableRowProps {
  lead: LeadWithProfile;
  onClick: (lead: LeadWithProfile) => void;
  onDelete: (lead: LeadWithProfile) => void;
}

const LeadTableRow: React.FC<LeadTableRowProps> = ({ lead, onClick, onDelete }) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy HH:mm");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(lead);
  };

  return (
    <TableRow 
      key={lead.lead_id}
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(lead)}
    >
      <TableCell>{lead.lead_id}</TableCell>
      <TableCell>{lead.name || "-"}</TableCell>
      <TableCell>{lead.phone || "-"}</TableCell>
      <TableCell>{lead.email || "-"}</TableCell>
      <TableCell>{lead.lead_source || "-"}</TableCell>
      <TableCell>{lead.client_language || "-"}</TableCell>
      <TableCell>{lead.lead_status || "-"}</TableCell>
      <TableCell>
        {lead.profiles?.full_name || "Не назначен"}
      </TableCell>
      <TableCell>{formatDate(lead.creation_date)}</TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete} 
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          title="Удалить лид"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default LeadTableRow;
