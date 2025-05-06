
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LeadTableRow, { LeadWithProfile } from "./LeadTableRow";

interface LeadsTableProps {
  leads: LeadWithProfile[];
  loading: boolean;
  onLeadClick: (lead: LeadWithProfile) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, loading, onLeadClick }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Источник лида</TableHead>
            <TableHead>Язык клиента</TableHead>
            <TableHead>Статус лида</TableHead>
            <TableHead>Ответственный менеджер</TableHead>
            <TableHead>Дата создания</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <LeadTableRow 
                key={lead.lead_id} 
                lead={lead} 
                onClick={onLeadClick} 
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Лиды не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
