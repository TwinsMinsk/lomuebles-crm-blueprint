
import React from "react";
import CompaniesPage from "@/components/companies/CompaniesPage";

/**
 * Companies page serving as a thin wrapper for the actual companies page component.
 * This separation allows for better code organization and potential route-level optimizations.
 */
const Companies = () => {
  return <CompaniesPage />;
};

export default Companies;
