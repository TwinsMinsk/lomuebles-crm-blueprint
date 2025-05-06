
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

// Define the Lead type with profile information
interface ProfileData {
  full_name: string | null;
}

type LeadWithProfile = Tables<"leads"> & {
  profiles: ProfileData | null;
};

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
            let profileData: ProfileData | null = null;
            
            // Add proper null check before accessing item.profiles
            if (item.profiles && typeof item.profiles === 'object') {
              // Check if full_name property exists in the profiles object
              if ('full_name' in item.profiles) {
                profileData = {
                  full_name: item.profiles.full_name
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

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy HH:mm");
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            isActive={page === i} 
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

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
                        <TableRow key={lead.lead_id}>
                          <TableCell>{lead.lead_id}</TableCell>
                          <TableCell>{lead.name || "-"}</TableCell>
                          <TableCell>{lead.phone || "-"}</TableCell>
                          <TableCell>{lead.email || "-"}</TableCell>
                          <TableCell>{lead.lead_source || "-"}</TableCell>
                          <TableCell>{lead.client_language || "-"}</TableCell>
                          <TableCell>{lead.lead_status || "-"}</TableCell>
                          <TableCell>
                            {lead.profiles?.full_name || "Не назначен"}
                          </TableCell>
                          <TableCell>{formatDate(lead.creation_date)}</TableCell>
                        </TableRow>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }} 
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
