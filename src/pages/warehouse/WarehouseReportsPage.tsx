import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { ModernCard } from "@/components/ui/modern-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockReportTab } from "@/components/warehouse/reports/StockReportTab";
import { MovementReportTab } from "@/components/warehouse/reports/MovementReportTab";
import { ReservationReportTab } from "@/components/warehouse/reports/ReservationReportTab";
import { DeliveryReportTab } from "@/components/warehouse/reports/DeliveryReportTab";

const WarehouseReportsPage = () => {
  const [activeTab, setActiveTab] = useState("stock");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отчеты по складу"
        subtitle="Аналитика и отчеты по остаткам, движениям и поставкам материалов"
      />

      <ModernCard>
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stock">Остатки</TabsTrigger>
              <TabsTrigger value="movements">Движения</TabsTrigger>
              <TabsTrigger value="reservations">Резервы</TabsTrigger>
              <TabsTrigger value="deliveries">Поставки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stock" className="mt-6">
              <StockReportTab />
            </TabsContent>
            
            <TabsContent value="movements" className="mt-6">
              <MovementReportTab />
            </TabsContent>
            
            <TabsContent value="reservations" className="mt-6">
              <ReservationReportTab />
            </TabsContent>

            <TabsContent value="deliveries" className="mt-6">
              <DeliveryReportTab />
            </TabsContent>
          </Tabs>
        </div>
      </ModernCard>
    </div>
  );
};

export default WarehouseReportsPage;