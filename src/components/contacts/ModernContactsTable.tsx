
import React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ContactWithRelations } from "./ContactTableRow"
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Trash2, Phone, Mail, MapPin, Building2, User } from "lucide-react"

interface ModernContactsTableProps {
  contacts: ContactWithRelations[]
  loading: boolean
  onEditContact: (contact: ContactWithRelations) => void
  onDeleteContact: (contact: ContactWithRelations) => void
}

const ModernContactsTable: React.FC<ModernContactsTableProps> = ({
  contacts,
  loading,
  onEditContact,
  onDeleteContact
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru })
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

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Контакты не найдены</h3>
        <p className="text-gray-500">Добавьте первый контакт, чтобы начать работу</p>
      </div>
    )
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">Контакт</th>
          <th className="text-left p-4 font-medium text-gray-700">Контактная информация</th>
          <th className="text-left p-4 font-medium text-gray-700">Компания</th>
          <th className="text-left p-4 font-medium text-gray-700">Адрес</th>
          <th className="text-left p-4 font-medium text-gray-700">Ответственный</th>
          <th className="text-left p-4 font-medium text-gray-700">Дата создания</th>
          <th className="w-[50px] p-4"></th>
        </tr>
      </thead>

      <tbody>
        {contacts.map((contact) => (
          <ResponsiveRow
            key={contact.contact_id}
            onClick={() => onEditContact(contact)}
            className="group"
          >
            {/* Contact Name */}
            <ResponsiveRowItem
              label="Контакт"
              value={
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {contact.full_name}
                  </div>
                  {contact.nie && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                      NIE: {contact.nie}
                    </div>
                  )}
                </div>
              }
            />

            {/* Contact Info */}
            <ResponsiveRowItem
              label="Контактная информация"
              value={
                <div className="space-y-1">
                  {contact.primary_phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {contact.primary_phone}
                    </div>
                  )}
                  {contact.primary_email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {contact.primary_email}
                    </div>
                  )}
                  {!contact.primary_phone && !contact.primary_email && (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              }
              fullWidth
            />

            {/* Company */}
            <ResponsiveRowItem
              label="Компания"
              value={
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {contact.company?.company_name || "—"}
                  </span>
                </div>
              }
            />

            {/* Address */}
            <ResponsiveRowItem
              label="Адрес"
              value={
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {contact.address_full || "—"}
                  </span>
                </div>
              }
            />

            {/* Owner */}
            <ResponsiveRowItem
              label="Ответственный"
              value={
                <span className="text-sm">
                  {contact.owner?.full_name || "Не назначен"}
                </span>
              }
            />

            {/* Date */}
            <ResponsiveRowItem
              label="Дата создания"
              value={
                <span className="text-sm text-gray-600">
                  {formatDate(contact.created_at)}
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
                    onDeleteContact(contact)
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить контакт"
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

export default ModernContactsTable
