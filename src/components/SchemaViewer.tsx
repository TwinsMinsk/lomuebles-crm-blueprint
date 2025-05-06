
import { databaseSchema } from "@/data/database-schema";
import TableCard from "@/components/TableCard";

const SchemaViewer = () => {
  return (
    <div className="space-y-8 py-8">
      {databaseSchema.map((table) => (
        <TableCard key={table.name} table={table} />
      ))}
    </div>
  );
};

export default SchemaViewer;
