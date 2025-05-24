
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
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ContactsTableProps {
  contacts: ContactWithRelations[];
  loading: boolean;
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onEditContact: (contact: ContactWithRelations) => void;
  onDeleteContact: (contact: ContactWithRelations) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  loading,
  onSort,
  sortColumn,
  sortDirection,
  onEditContact,
  onDeleteContact,
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

  if (loading) {
    return <TableSkeleton columns={8} rows={6} />;
  }

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
            <TableHead className="w-[80px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <ContactTableRow 
                key={contact.contact_id} 
                contact={contact} 
                onEditClick={onEditContact}
                onDeleteClick={onDeleteContact}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
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
