
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

// Define the Lead type with profile information
interface ProfileData {
  full_name: string | null;
}

export type LeadWithProfile = Tables<"leads"> & {
  profiles: ProfileData | null;
};

interface LeadTableRowProps {
  lead: LeadWithProfile;
}

const LeadTableRow: React.FC<LeadTableRowProps> = ({ lead }) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy HH:mm");
  };

  return (
    <TableRow key={lead.lead_id}>
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
    </TableRow>
  );
};

export default LeadTableRow;
