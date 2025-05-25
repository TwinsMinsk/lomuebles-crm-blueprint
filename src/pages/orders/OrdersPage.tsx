
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernHeader } from "@/components/ui/modern-header";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import OrdersTable from "@/components/orders/OrdersTable";
import OrdersKanbanBoard from "@/components/orders/kanban/OrdersKanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Kanban, ShoppingCart } from "lucide-react";

const OrdersPage: React.FC = () => {
  const breadcrumbs = [
    { label: "CRM", href: "/dashboard" },
    { label: "Заказы" }
  ];

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <ModernHeader
        title="Заказы"
        description="Управление заказами клиентов"
        breadcrumbs={breadcrumbs}
        action={
          <Button asChild className="hidden lg:flex items-center gap-2">
            <Link to="/orders/new">
              <Plus className="h-4 w-4" /> 
              Добавить заказ
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="kanban" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Таблица
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Kanban
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table">
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Список заказов
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <OrdersTable />
            </ModernCardContent>
          </ModernCard>
        </TabsContent>

        <TabsContent value="kanban">
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Kanban className="h-5 w-5" />
                Kanban-доска заказов
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <OrdersKanbanBoard />
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={() => window.location.href = '/orders/new'}
        icon={<Plus className="h-6 w-6" />}
        label="Добавить заказ"
      />
    </div>
  );
};

export default OrdersPage;
