
import { ArrowRight } from "lucide-react";

const DbHeader = () => {
  return (
    <div className="bg-slate-800 text-white py-6 px-4 rounded-lg shadow-lg mb-6">
      <h1 className="text-3xl font-bold mb-2">lomuebles.es CRM</h1>
      <p className="text-slate-300 mb-4">Структура базы данных для мебельного бизнеса</p>
      
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center text-slate-300">
          <span>leads</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поля assigned_user_id и creator_user_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>profiles</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>auth.users</span>
          <p className="ml-4 text-slate-400">(связь через поле id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>companies</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поле owner_user_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>contacts</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поле owner_user_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>contacts</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>companies</span>
          <p className="ml-4 text-slate-400">(связь через поле associated_company_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>partners_manufacturers</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поле creator_user_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>orders</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>contacts</span>
          <p className="ml-4 text-slate-400">(связь через поле client_contact_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>orders</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>companies</span>
          <p className="ml-4 text-slate-400">(связь через поле client_company_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>orders</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>leads</span>
          <p className="ml-4 text-slate-400">(связь через поле source_lead_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>orders</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поля assigned_user_id и creator_user_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>orders</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>partners_manufacturers</span>
          <p className="ml-4 text-slate-400">(связь через поле partner_manufacturer_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>order_items</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>orders</span>
          <p className="ml-4 text-slate-400">(связь через поле parent_order_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>custom_requests</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>contacts</span>
          <p className="ml-4 text-slate-400">(связь через поле associated_contact_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>custom_requests</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>companies</span>
          <p className="ml-4 text-slate-400">(связь через поле associated_company_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>custom_requests</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>orders</span>
          <p className="ml-4 text-slate-400">(связь через поле linked_order_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>custom_requests</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поля assigned_user_id и creator_user_id)</p>
        </div>
        
        <div className="flex items-center text-slate-300">
          <span>products</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поле creator_user_id)</p>
        </div>

        {/* Добавляем новые связи для suppliers */}
        <div className="flex items-center text-slate-300">
          <span>suppliers</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поле creator_user_id)</p>
        </div>

        {/* Добавляем новые связи для tasks */}
        <div className="flex items-center text-slate-300">
          <span>tasks</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>profiles</span>
          <p className="ml-4 text-slate-400">(связь через поля assigned_task_user_id и creator_user_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>tasks</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>leads</span>
          <p className="ml-4 text-slate-400">(связь через поле related_lead_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>tasks</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>contacts</span>
          <p className="ml-4 text-slate-400">(связь через поле related_contact_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>tasks</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>orders</span>
          <p className="ml-4 text-slate-400">(связь через поле related_order_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>tasks</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>partners_manufacturers</span>
          <p className="ml-4 text-slate-400">(связь через поле related_partner_manufacturer_id)</p>
        </div>

        <div className="flex items-center text-slate-300">
          <span>tasks</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span>custom_requests</span>
          <p className="ml-4 text-slate-400">(связь через поле related_custom_request_id)</p>
        </div>
      </div>
    </div>
  );
};

export default DbHeader;
