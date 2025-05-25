
import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Partner } from "@/types/partner";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { Trash2, Phone, Mail, Globe, Building2, Wrench } from "lucide-react";

interface ModernPartnersTableProps {
  partners: Partner[];
  loading: boolean;
  onPartnerClick: (partner: Partner) => void;
  onDeleteClick: (partner: Partner) => void;
}

const ModernPartnersTable: React.FC<ModernPartnersTableProps> = ({
  partners,
  loading,
  onPartnerClick,
  onDeleteClick,
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

  if (partners.length === 0) {
    return (
      <ModernEmptyState
        icon={Building2}
        title="Партнеры не найдены"
        description="Добавьте первого партнера-изготовителя, чтобы начать работу"
      />
    );
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">Партнер</th>
          <th className="text-left p-4 font-medium text-gray-700">Контактная информация</th>
          <th className="text-left p-4 font-medium text-gray-700">Специализация</th>
          <th className="text-left p-4 font-medium text-gray-700">Дата создания</th>
          <th className="w-[50px] p-4"></th>
        </tr>
      </thead>

      <tbody>
        {partners.map((partner) => (
          <ResponsiveRow
            key={partner.partner_manufacturer_id}
            onClick={() => onPartnerClick(partner)}
            className="group"
          >
            {/* Partner Info */}
            <ResponsiveRowItem
              label="Партнер"
              value={
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {partner.company_name}
                  </div>
                  {partner.contact_person && (
                    <div className="text-sm text-gray-500">
                      Контактное лицо: {partner.contact_person}
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
                  {partner.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {partner.phone}
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {partner.email}
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-1 text-sm">
                      <Globe className="h-3 w-3 text-gray-400" />
                      {partner.website}
                    </div>
                  )}
                  {!partner.phone && !partner.email && !partner.website && (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              }
              fullWidth
            />

            {/* Specialization */}
            <ResponsiveRowItem
              label="Специализация"
              value={
                <div className="flex items-center gap-1">
                  <Wrench className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {partner.specialization || "—"}
                  </span>
                </div>
              }
            />

            {/* Creation Date */}
            <ResponsiveRowItem
              label="Дата создания"
              value={
                <span className="text-sm text-gray-600">
                  {formatDate(partner.creation_date)}
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
                    onDeleteClick(partner);
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить партнера"
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

export default ModernPartnersTable;
