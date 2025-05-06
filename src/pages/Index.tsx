
import { Container } from "@/components/ui/container";
import DbHeader from "@/components/DbHeader";
import SchemaViewer from "@/components/SchemaViewer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Container>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <DbHeader />
          <SchemaViewer />
        </div>
      </Container>
    </div>
  );
};

export default Index;
