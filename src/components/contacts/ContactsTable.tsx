
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

interface ContactsTableProps {
  contacts: ContactWithRelations[];
  loading: boolean;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, loading }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>ФИО</TableHead>
            <TableHead>Основной телефон</TableHead>
            <TableHead>Основной email</TableHead>
            <TableHead>Компания</TableHead>
            <TableHead>Ответственный менеджер</TableHead>
            <TableHead>Дата создания</TableHead>
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
