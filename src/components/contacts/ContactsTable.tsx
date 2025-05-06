
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ContactTableRow, { ContactWithRelations } from "./ContactTableRow";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ContactsTableProps {
  contacts: ContactWithRelations[];
  loading: boolean;
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  loading,
  onSort,
  sortColumn,
  sortDirection,
}) => {
  // Function to render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="inline h-4 w-4" />
      ) : (
        <ChevronDown className="inline h-4 w-4" />
      );
    }
    return null;
  };

  // Function to create sortable column headers
  const createSortableHeader = (column: string, label: string) => {
    return (
      <TableHead 
        className={onSort ? "cursor-pointer hover:bg-muted/50" : ""}
        onClick={() => onSort && onSort(column)}
      >
        <div className="flex items-center gap-1">
          {label}
          {renderSortIndicator(column)}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            {createSortableHeader("full_name", "ФИО")}
            <TableHead>Основной телефон</TableHead>
            <TableHead>Основной email</TableHead>
            {createSortableHeader("companyName", "Компания")}
            <TableHead>Ответственный менеджер</TableHead>
            {createSortableHeader("creation_date", "Дата создания")}
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <ContactTableRow key={contact.contact_id} contact={contact} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Контакты не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
