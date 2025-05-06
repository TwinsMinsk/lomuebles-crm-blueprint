
import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define the user role type from our database schema
type UserRole = Database["public"]["Enums"]["user_role"];

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  registration_date: string;
  is_active: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("profiles").select("*").order("registration_date", { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Ошибка загрузки пользователей",
        description: error.message || "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );

      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно изменена",
      });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Ошибка обновления роли",
        description: error.message || "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    }
  };

  const toggleUserActiveState = async (userId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentState })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_active: !currentState } : user
        )
      );

      toast({
        title: "Статус обновлен",
        description: `Пользователь ${!currentState ? "активирован" : "деактивирован"}`,
      });
    } catch (error: any) {
      console.error("Error toggling user active state:", error);
      toast({
        title: "Ошибка обновления статуса",
        description: error.message || "Не удалось обновить статус пользователя",
        variant: "destructive",
      });
    }
  };

  return (
    <Container>
      <Card className="shadow-sm">
        <CardHeader className="bg-slate-50">
          <CardTitle>Управление пользователями</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <p>Загрузка пользователей...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || "—"}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Главный Администратор">
                              Главный Администратор
                            </SelectItem>
                            <SelectItem value="Администратор">Администратор</SelectItem>
                            <SelectItem value="Менеджер">Менеджер</SelectItem>
                            <SelectItem value="Замерщик">Замерщик</SelectItem>
                            <SelectItem value="Дизайнер">Дизайнер</SelectItem>
                            <SelectItem value="Монтажник">Монтажник</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(user.registration_date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_active ? "outline" : "destructive"}
                          className={user.is_active ? "bg-green-50 text-green-600 hover:bg-green-50" : ""}
                        >
                          {user.is_active ? "Активен" : "Неактивен"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant={user.is_active ? "destructive" : "outline"}
                              size="sm"
                            >
                              {user.is_active ? "Деактивировать" : "Активировать"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.is_active
                                  ? "Деактивировать пользователя"
                                  : "Активировать пользователя"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.is_active
                                  ? "Вы уверены, что хотите деактивировать этого пользователя? Пользователь потеряет доступ к системе."
                                  : "Вы уверены, что хотите активировать этого пользователя? Пользователь получит доступ к системе."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => toggleUserActiveState(user.id, user.is_active)}
                                className={user.is_active ? "bg-red-500 hover:bg-red-600" : ""}
                              >
                                {user.is_active ? "Деактивировать" : "Активировать"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Пользователи не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserManagement;
