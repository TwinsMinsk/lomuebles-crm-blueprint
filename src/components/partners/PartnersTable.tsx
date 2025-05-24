
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PartnerTableRow from "./PartnerTableRow";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import { Partner } from "@/types/partner";

interface PartnersTableProps {
  partners: Partner[];
  loading: boolean;
  onPartnerClick: (partner: Partner) => void;
  onDeleteClick: (partner: Partner) => void;
}

const PartnersTable: React.FC<PartnersTableProps> = ({
  partners,
  loading,
  onPartnerClick,
  onDeleteClick,
}) => {
  if (loading) {
    return <TableSkeleton columns={9} rows={6} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Название компании</TableHead>
            <TableHead>Контактное лицо</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Веб-сайт</TableHead>
            <TableHead>Специализация</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.length > 0 ? (
            partners.map((partner) => (
              <PartnerTableRow
                key={partner.partner_manufacturer_id}
                partner={partner}
                onClick={onPartnerClick}
                onDelete={onDeleteClick}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Партнеры-изготовители не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PartnersTable;
