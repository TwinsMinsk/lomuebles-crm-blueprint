
import React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { LeadWithProfile } from "./LeadTableRow"
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table"
import { ModernStatusBadge } from "@/components/ui/modern-status-badge"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Trash2, Phone, Mail, Globe } from "lucide-react"

interface ModernLeadsTableProps {
  leads: LeadWithProfile[]
  loading: boolean
  onLeadClick: (lead: LeadWithProfile) => void
  onLeadDelete: (lead: LeadWithProfile) => void
}

const ModernLeadsTable: React.FC<ModernLeadsTableProps> = ({
  leads,
  loading,
  onLeadClick,
  onLeadDelete
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru })
  }

  const getLanguageIcon = (language: string | null) => {
    if (!language) return null
    return <Globe className="h-3 w-3" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Desktop skeleton */}
        <div className="hidden lg:block space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="table" />
          ))}
        </div>
        
        {/* Mobile skeleton */}
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Globe className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Лиды не найдены</h3>
        <p className="text-gray-500">Добавьте первый лид, чтобы начать работу</p>
      </div>
    )
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">ID</th>
          <th className="text-left p-4 font-medium text-gray-700">Контакт</th>
          <th className="text-left p-4 font-medium text-gray-700">Источник</th>
          <th className="text-left p-4 font-medium text-gray-700">Статус</th>
          <th className="text-left p-4 font-medium text-gray-700">Ответственный</th>
          <th className="text-left p-4 font-medium text-gray-700">Дата</th>
          <th className="w-[50px] p-4"></th>
        </tr>
      </thead>

      <tbody>
        {leads.map((lead) => (
          <ResponsiveRow
            key={lead.lead_id}
            onClick={() => onLeadClick(lead)}
            className="group"
          >
            {/* ID */}
            <ResponsiveRowItem
              label="ID"
              value={
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  #{lead.lead_id}
                </span>
              }
            />

            {/* Contact Info */}
            <ResponsiveRowItem
              label="Контакт"
              value={
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {lead.name || "Без имени"}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                    {lead.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                    )}
                  </div>
                </div>
              }
              fullWidth
            />

            {/* Source */}
            <ResponsiveRowItem
              label="Источник"
              value={
                <div className="flex items-center gap-1">
                  {getLanguageIcon(lead.client_language)}
                  <span className="text-sm">
                    {lead.lead_source || "—"}
                  </span>
                  {lead.client_language && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {lead.client_language}
                    </span>
                  )}
                </div>
              }
            />

            {/* Status */}
            <ResponsiveRowItem
              label="Статус"
              value={
                <ModernStatusBadge status={lead.lead_status || "Новый"} />
              }
            />

            {/* Assigned User */}
            <ResponsiveRowItem
              label="Ответственный"
              value={
                <span className="text-sm">
                  {lead.profiles?.full_name || "Не назначен"}
                </span>
              }
            />

            {/* Date */}
            <ResponsiveRowItem
              label="Дата создания"
              value={
                <span className="text-sm text-gray-600">
                  {formatDate(lead.creation_date)}
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
                    e.stopPropagation()
                    onLeadDelete(lead)
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить лид"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  )
}

export default ModernLeadsTable
