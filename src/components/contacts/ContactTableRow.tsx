
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

// Define company and profile data types
interface CompanyData {
  company_name: string | null;
}

interface ProfileData {
  full_name: string | null;
}

// Define the Contact type with related data
export type ContactWithRelations = Tables<"contacts"> & {
  companies?: CompanyData | null;
  profiles?: ProfileData | null;
};

interface ContactTableRowProps {
  contact: ContactWithRelations;
}

const ContactTableRow: React.FC<ContactTableRowProps> = ({ contact }) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy");
  };

  return (
    <TableRow>
      <TableCell>{contact.contact_id}</TableCell>
      <TableCell>{contact.full_name || "-"}</TableCell>
      <TableCell>{contact.primary_phone || "-"}</TableCell>
      <TableCell>{contact.primary_email || "-"}</TableCell>
      <TableCell>
        {contact.companies?.company_name || (contact.associated_company_id ? "-" : "Частное лицо")}
      </TableCell>
      <TableCell>
        {contact.profiles?.full_name || "Не назначен"}
      </TableCell>
      <TableCell>{formatDate(contact.creation_date)}</TableCell>
    </TableRow>
  );
};

export default ContactTableRow;
