
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import CompaniesContent from "@/components/companies/CompaniesContent";
import { useCompaniesState } from "@/hooks/useCompaniesState";

/**
 * CompaniesPage component displays the companies management interface.
 * This component is responsible for UI layout and connecting data to presentation components.
 */
const CompaniesPage: React.FC = () => {
  // Use the hook to get all the state and handlers
  const companiesState = useCompaniesState();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Компании"
        description="Управление информацией о компаниях"
      />

      <Card>
        <CardContent className="pt-6">
          <CompaniesContent {...companiesState} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompaniesPage;
