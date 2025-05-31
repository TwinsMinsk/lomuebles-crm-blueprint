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
import { Loader2, RefreshCw, UserCog, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers, User } from "@/hooks/useUsers";

// Define the user role type from our database schema
type UserRole = Database["public"]["Enums"]["user_role"];

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Неверная дата";
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session, userRole, user: currentUser } = useAuth();

  // Helper function to check if the current user can modify a specific user
  const canModifyUser = (userToModify: User) => {
    // Chief Administrator can modify anyone except themselves
    if (userRole === 'Главный Администратор') {
      return userToModify.id !== currentUser?.id;
    }
    
    // Regular Administrator can only modify users who are NOT Chief Administrators and not themselves
    if (userRole === 'Администратор') {
      return userToModify.role !== 'Главный Администратор' && userToModify.id !== currentUser?.id;
    }
    
    // Other roles cannot modify users
    return false;
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching all users, current user role:", userRole);
      
      if (!session) {
        throw new Error("Необходима авторизация для просмотра пользователей");
      }
      
      // Explicitly get all profiles without filtering
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("registration_date", { ascending: false });

      if (error) {
        console.error("Supabase error fetching users:", error);
        throw error;
      }

      console.log("Retrieved users data:", data);
      
      if (!data || data.length === 0) {
        console.warn("No user profiles found in database");
      }
      
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Не удалось загрузить список пользователей");
      toast({
        title: "��шибка загрузки пользователей",
        description: error.message || "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    } else {
      setIsLoading(false);
      setError("Необходима авторизация");
    }
  }, [session]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      console.log(`Changing role for user ${userId} to ${newRole}`);
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        console.error("Supabase error updating user role:", error);
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
      console.log(`Toggling active state for user ${userId} from ${currentState} to ${!currentState}`);
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentState })
        .eq("id", userId);

      if (error) {
        console.error("Supabase error toggling user active state:", error);
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

  const handleRefresh = () => {
    fetchUsers();
    toast({
      title: "Обновление",
      description: "Список пользователей обновляется"
    });
  };

  if (!session) {
    return (
      <Container>
        <Card>
          <CardHeader className="bg-slate-50">
            <CardTitle>Управление пользователями</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Требуется авторизация</p>
            <p>Для управления пользователями необходимо авторизоваться в системе</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // For roles other than admin, show limited access
  if (userRole !== "Главный Администратор" && userRole !== "Администратор") {
    return (
      <Container>
        <Card>
          <CardHeader className="bg-slate-50">
            <CardTitle>Управление пользователями</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <UserCog className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Ограниченный доступ</p>
            <p>Только администраторы имеют доступ к управлению пользователями</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card className="shadow-sm">
        <CardHeader className="bg-slate-50 flex flex-row justify-between items-center">
          <CardTitle>Управление пользователями</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Обновить
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
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
                  {users && users.length > 0 ? (
                    users.map((user) => {
                      const canModify = canModifyUser(user);
                      const isChiefAdmin = user.role === 'Главный Администратор';
                      const isSelf = user.id === currentUser?.id;
                      
                      // Prepare a tooltip message explaining why the controls might be disabled
                      let tooltipMessage = '';
                      if (!canModify) {
                        if (isSelf) {
                          tooltipMessage = 'Вы не можете изменить свой собственный профиль';
                        } else if (isChiefAdmin && userRole === 'Администратор') {
                          tooltipMessage = 'Администратор не может изменять профили Главных Администраторов';
                        }
                      }
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.email}
                            {isSelf && <span className="ml-2 text-xs text-blue-500">(Вы)</span>}
                          </TableCell>
                          <TableCell>{user.full_name || "—"}</TableCell>
                          <TableCell>
                            <Select
                              defaultValue={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                              disabled={!canModify}
                            >
                              <SelectTrigger 
                                className="w-[180px]"
                                title={!canModify ? tooltipMessage : ''}
                              >
                                <SelectValue placeholder="Выберите роль" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Главный Администратор">
                                  Главный Администратор
                                </SelectItem>
                                <SelectItem value="Администратор">Администратор</SelectItem>
                                <SelectItem value="Менеджер">Менеджер</SelectItem>
                                <SelectItem value="Специалист">Специалист</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{user.registration_date ? formatDate(user.registration_date) : "—"}</TableCell>
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
                                  disabled={!canModify}
                                  title={!canModify ? tooltipMessage : ''}
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
                      );
                    })
                  ) : (
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
