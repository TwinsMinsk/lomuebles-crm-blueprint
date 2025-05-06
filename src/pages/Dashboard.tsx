
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SchemaViewer from "@/components/SchemaViewer";

const Dashboard = () => {
  return (
    <Container>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Панель управления CRM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>Обзор системы</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600">Добро пожаловать в CRM-систему lomuebles.es.</p>
              <p className="text-gray-600 mt-4">В системе настроены таблицы профилей пользователей, лидов, компаний, контактов, заказов, позиций в заказах, товаров и партнеров-изготовителей с разграничением прав доступа.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>Статус разработки</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Настроена аутентификация пользователей</li>
                <li>Настроены роли и права доступа</li>
                <li>Создана таблица профилей пользователей</li>
                <li>Настроено автоматическое создание профиля при регистрации</li>
                <li>Создана таблица лидов с разграничением доступа</li>
                <li>Создана таблица компаний с разграничением доступа</li>
                <li>Создана таблица контактов с разграничением доступа</li>
                <li>Создана таблица партнеров-изготовителей с разграничением доступа</li>
                <li>Создана таблица заказов с разграничением доступа</li>
                <li>Настроена автоматическая генерация номеров заказов</li>
                <li>Создана таблица позиций заказа с разграничением доступа</li>
                <li>Создана таблица запросов на изготовление с разграничением доступа</li>
                <li>Создана таблица товаров и шаблонов с разграничением доступа</li>
                <li>Создана таблица поставщиков с разграничением доступа</li>
                <li>Создана таблица задач с разграничением доступа</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Структура базы данных</h2>
          <SchemaViewer />
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
