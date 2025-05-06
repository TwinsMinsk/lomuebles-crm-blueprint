
import React, { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import PageHeader from "@/components/common/PageHeader";
import ContactsTable from "@/components/contacts/ContactsTable";
import ContactsPagination from "@/components/contacts/ContactsPagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Contacts = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const { contacts, loading, totalPages, error } = useContacts({ 
    page: currentPage, 
    pageSize 
  });

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show error toast if data fetching fails
  if (error) {
    toast.error("Ошибка при загрузке контактов", {
      description: error.message
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Контакты"
        description="Управление контактами клиентов"
      />

      <Card>
        <CardHeader>
          <CardTitle>Список контактов</CardTitle>
          <CardDescription>
            Управление информацией о клиентах и их контактных данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <ContactsTable contacts={contacts} loading={loading} />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;
