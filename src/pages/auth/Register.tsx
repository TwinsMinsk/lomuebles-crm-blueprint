
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Key, User } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email({ message: "Введите корректный email" }),
    fullName: z.string().optional(),
    password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await signUp(data.email, data.password, data.fullName);
      
      // If registration was successful (no error returned)
      if (!result) {
        console.log("Registration successful, redirecting to dashboard");
        navigate("/dashboard");
      }
      // If there was an error, the useAuthActions hook will show the error toast
      // and we don't need to do anything else here
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      // The useAuthActions hook should handle most errors, but this is a fallback
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Регистрация</CardTitle>
          <CardDescription className="text-center">
            Создайте учетную запись для доступа к CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white">
                        <Mail className="ml-2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="mail@example.com"
                          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя (опционально)</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white">
                        <User className="ml-2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Иван Иванов"
                          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white">
                        <Key className="ml-2 h-4 w-4 text-gray-500" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подтверждение пароля</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white">
                        <Key className="ml-2 h-4 w-4 text-gray-500" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Зарегистрироваться
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Уже есть учетная запись?{" "}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800">
                    Войти
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
