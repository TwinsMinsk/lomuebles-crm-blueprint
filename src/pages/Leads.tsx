
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadsPagination from "@/components/leads/LeadsPagination";
import { useLeads } from "@/hooks/useLeads";

const Leads = () => {
  const { leads, loading, page, totalPages, setPage } = useLeads();

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Лиды</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <LeadsTable leads={leads} loading={loading} />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <LeadsPagination 
                  page={page} 
                  totalPages={totalPages} 
                  setPage={setPage} 
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
