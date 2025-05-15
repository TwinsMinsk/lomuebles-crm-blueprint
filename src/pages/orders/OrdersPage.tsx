
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrdersTable from "@/components/orders/OrdersTable";
import OrdersKanbanBoard from "@/components/orders/kanban/OrdersKanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Kanban } from "lucide-react";

const OrdersPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="h-4 w-4 mr-1" /> 
            Добавить заказ
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="kanban">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="table">
              <List className="h-4 w-4 mr-1" />
              Таблица
            </TabsTrigger>
            <TabsTrigger value="kanban">
              <Kanban className="h-4 w-4 mr-1" />
              Kanban
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Список заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <Card>
            <CardHeader>
              <CardTitle>Kanban-доска заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersKanbanBoard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
