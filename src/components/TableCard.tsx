
import { TableDefinition } from "@/data/database-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TableCardProps {
  table: TableDefinition;
}

const TableCard = ({ table }: TableCardProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-xl font-bold">{table.name}</CardTitle>
        <p className="text-muted-foreground text-sm">{table.description}</p>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 pl-4">Поле</th>
              <th className="text-left p-2">Тип</th>
              <th className="text-left p-2">Атрибуты</th>
            </tr>
          </thead>
          <tbody>
            {table.fields.map((field, index) => (
              <tr 
                key={field.name} 
                className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
              >
                <td className="p-2 pl-4 font-medium">
                  {field.name}
                  {field.reference && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      FK
                    </Badge>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <span>{field.type}</span>
                    {field.options && field.options.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="cursor-help">
                              options
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs">
                              <p className="font-medium mb-1">Варианты:</p>
                              <ul className="list-disc pl-4">
                                {field.options.map((option) => (
                                  <li key={option}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">required</Badge>
                    )}
                    {field.defaultValue && (
                      <Badge variant="outline" className="text-xs">
                        default: {field.defaultValue}
                      </Badge>
                    )}
                    {field.reference && (
                      <Badge variant="secondary" className="text-xs">
                        → {field.reference.table}.{field.reference.field}
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default TableCard;
