
import { useState } from "react";
import { Company } from "@/hooks/useCompanies";

export function useCompanyFormModal() {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  return {
    isFormOpen,
    selectedCompany,
    handleAddCompany,
    handleEditCompany,
    handleCloseForm
  };
}
