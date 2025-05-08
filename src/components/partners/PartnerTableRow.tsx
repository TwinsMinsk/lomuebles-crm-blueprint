
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Partner } from "@/types/partner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PartnerTableRowProps {
  partner: Partner;
  onClick: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

const PartnerTableRow: React.FC<PartnerTableRowProps> = ({
  partner,
  onClick,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(partner);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy");
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(partner)}
    >
      <TableCell>{partner.partner_manufacturer_id}</TableCell>
      <TableCell>{partner.company_name}</TableCell>
      <TableCell>{partner.contact_person || "-"}</TableCell>
      <TableCell>{partner.phone || "-"}</TableCell>
      <TableCell>{partner.email || "-"}</TableCell>
      <TableCell>{partner.specialization || "-"}</TableCell>
      <TableCell>{formatDate(partner.creation_date)}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          title="Удалить партнера"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PartnerTableRow;
