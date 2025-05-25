
import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { Trash2, Phone, Mail, MapPin, Building2, User } from "lucide-react";

interface Company {
  company_id: number;
  company_name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address_full?: string | null;
  company_type?: string | null;
  creation_date: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface ModernCompaniesTableProps {
  companies: Company[];
  loading: boolean;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
}

const ModernCompaniesTable: React.FC<ModernCompaniesTableProps> = ({
  companies,
  loading,
  onEditCompany,
  onDeleteCompany,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="hidden lg:block space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="table" />
          ))}
        </div>
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <ModernEmptyState
        icon={Building2}
        title="Компании не найдены"
        description="Добавьте первую компанию, чтобы начать работу"
      />
    );
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">Компания</th>
          <th className="text-left p-4 font-medium text-gray-700">Контактная информация</th>
          <th className="text-left p-4 font-medium text-gray-700">Адрес</th>
          <th className="text-left p-4 font-medium text-gray-700">Ответственный</th>
          <th className="text-left p-4 font-medium text-gray-700">Дата создания</th>
          <th className="w-[50px] p-4"></th>
        </tr>
      </thead>

      <tbody>
        {companies.map((company) => (
          <ResponsiveRow
            key={company.company_id}
            onClick={() => onEditCompany(company)}
            className="group"
          >
            {/* Company Info */}
            <ResponsiveRowItem
              label="Компания"
              value={
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {company.company_name}
                  </div>
                  {company.contact_person && (
                    <div className="text-sm text-gray-500">
                      {company.contact_person}
                    </div>
                  )}
                  {company.company_type && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                      {company.company_type}
                    </div>
                  )}
                </div>
              }
              fullWidth
            />

            {/* Contact Info */}
            <ResponsiveRowItem
              label="Контактная информация"
              value={
                <div className="space-y-1">
                  {company.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {company.phone}
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {company.email}
                    </div>
                  )}
                  {!company.phone && !company.email && (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              }
              fullWidth
            />

            {/* Address */}
            <ResponsiveRowItem
              label="Адрес"
              value={
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {company.address_full || "—"}
                  </span>
                </div>
              }
            />

            {/* Owner */}
            <ResponsiveRowItem
              label="Ответственный"
              value={
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {company.profiles?.full_name || "Не назначен"}
                  </span>
                </div>
              }
            />

            {/* Date */}
            <ResponsiveRowItem
              label="Дата создания"
              value={
                <span className="text-sm text-gray-600">
                  {formatDate(company.creation_date)}
                </span>
              }
            />

            {/* Actions */}
            <ResponsiveRowItem
              label="Действия"
              value={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCompany(company);
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить компанию"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  );
};

export default ModernCompaniesTable;
