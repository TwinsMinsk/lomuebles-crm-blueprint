
import { ArrowRight } from "lucide-react";

const DbHeader = () => {
  return (
    <div className="bg-slate-800 text-white py-6 px-4 rounded-lg shadow-lg mb-6">
      <h1 className="text-3xl font-bold mb-2">lomuebles.es CRM</h1>
      <p className="text-slate-300 mb-4">Структура базы данных для мебельного бизнеса</p>
      
      <div className="flex items-center text-sm text-slate-300">
        <span>Contacts</span>
        <ArrowRight className="h-4 w-4 mx-2" />
        <span>Companies</span>
        <p className="ml-4 text-slate-400">(связь через поле associatedCompanyID)</p>
      </div>
    </div>
  );
};

export default DbHeader;
