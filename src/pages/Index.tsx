
import { Container } from "@/components/ui/container";
import DbHeader from "@/components/DbHeader";
import SchemaViewer from "@/components/SchemaViewer";

const Index = () => {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100">
      <Container>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Добро пожаловать в lomuebles.es CRM</h1>
          <p className="mb-8 text-gray-600">
            Система управления взаимоотношениями с клиентами для мебельного бизнеса
          </p>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <DbHeader />
            <SchemaViewer />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Index;
