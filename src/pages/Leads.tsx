
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadsPagination from "@/components/leads/LeadsPagination";
import { LeadWithProfile } from "@/components/leads/LeadTableRow";

const Leads = () => {
  const [leads, setLeads] = useState<LeadWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // First, get the total count to calculate pagination
        const { count } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true });

        // Calculate total pages
        const total = count || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));

        // Fetch the leads with pagination and explicitly specify the column for the join
        const { data, error } = await supabase
          .from("leads")
          .select(`
            *,
            profiles:assigned_user_id(full_name)
          `)
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
          .order("creation_date", { ascending: false });

        if (error) {
          console.error("Error fetching leads:", error);
          return;
        }

        if (data) {
          // Transform the data to match our LeadWithProfile type with safer type handling
          const transformedData: LeadWithProfile[] = data.map(item => {
            // Ensure profiles is of the correct shape or null
            let profileData: { full_name: string | null } | null = null;
            
            // Add proper null check before accessing item.profiles
            if (item.profiles && typeof item.profiles === 'object') {
              // Check if full_name property exists in the profiles object
              const profilesObj = item.profiles as Record<string, unknown>;
              if ('full_name' in profilesObj) {
                profileData = {
                  full_name: profilesObj.full_name as string | null
                };
              }
            }
            
            return {
              ...item,
              profiles: profileData
            };
          });
          
          setLeads(transformedData);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page]);

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
