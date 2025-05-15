
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ContactWithRelations {
  contact_id: number;
  full_name: string;
  nie: string | null;
  primary_phone: string | null;
  primary_email: string | null;
  secondary_phone: string | null;
  secondary_email: string | null;
  delivery_address_street: string | null;
  delivery_address_number: string | null;
  delivery_address_apartment: string | null;
  delivery_address_city: string | null;
  delivery_address_postal_code: string | null;
  delivery_address_country: string | null;
  notes: string | null;
  attached_files_general: any | null;
  creation_date: string;
  owner_user_id: string | null;
  associated_company_id: number | null;
  creator_user_id?: string | null;
  companies?: {
    company_id: number;
    company_name: string;
  } | null;
  profiles?: {
    id: string;
    full_name: string;
  } | null;
}

interface ContactTableRowProps {
  contact: ContactWithRelations;
  onEditClick: (contact: ContactWithRelations) => void;
  onDeleteClick: (contact: ContactWithRelations) => void;
}

const ContactTableRow: React.FC<ContactTableRowProps> = ({ 
  contact, 
  onEditClick,
  onDeleteClick 
}) => {
  // Stop event propagation to prevent row click when clicking the delete button
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(contact);
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onEditClick(contact)}
    >
      <TableCell>{contact.contact_id}</TableCell>
      <TableCell className="font-medium">{contact.full_name}</TableCell>
      <TableCell>{contact.primary_phone || "-"}</TableCell>
      <TableCell>{contact.primary_email || "-"}</TableCell>
      <TableCell>
        {contact.companies
          ? contact.companies.company_name
          : contact.associated_company_id
          ? "-"
          : "Частное лицо"}
      </TableCell>
      <TableCell>
        {contact.profiles
          ? contact.profiles.full_name
          : "Не назначен"}
      </TableCell>
      <TableCell>{formatDate(contact.creation_date)}</TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDeleteClick}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Удалить контакт</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ContactTableRow;
