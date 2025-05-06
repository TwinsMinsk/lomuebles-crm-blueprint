
import { Container } from "@/components/ui/container";

const Dashboard = () => {
  return (
    <Container>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Панель управления CRM</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">Добро пожаловать в CRM-систему lomuebles.es.</p>
          <p className="text-gray-600 mt-4">Здесь будет отображаться основная информация и статистика.</p>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
