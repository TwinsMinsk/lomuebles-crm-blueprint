
import React from "react";
import { Loader2 } from "lucide-react";
import { ContactWithRelations } from "./ContactTableRow";
import ContactsTable from "./ContactsTable";
import ContactsPagination from "./ContactsPagination";

interface ContactsContentProps {
  contacts: ContactWithRelations[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  handleSort: (column: string) => void;
  onEditContact: (contact: ContactWithRelations) => void;
  onDeleteContact: (contact: ContactWithRelations) => void;
}

const ContactsContent: React.FC<ContactsContentProps> = ({
  contacts,
  loading,
  totalPages,
  currentPage,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
  onEditContact,
  onDeleteContact,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ContactsTable 
        contacts={contacts} 
        loading={loading} 
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onEditContact={onEditContact}
        onDeleteContact={onDeleteContact}
      />
      
      {totalPages > 1 && (
        <div className="mt-4">
          <ContactsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default ContactsContent;
