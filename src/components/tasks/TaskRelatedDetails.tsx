
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Users, Target, Building, FileText, Phone, Mail, MapPin, Calendar, Euro } from "lucide-react";
import { useTaskRelatedDetails } from "@/hooks/tasks/useTaskRelatedDetails";
import { useAuth } from "@/context/AuthContext";
import {
  TaskRelatedOrder,
  TaskRelatedContact,
  TaskRelatedLead,
  TaskRelatedPartner,
  TaskRelatedCustomRequest
} from "@/types/taskRelatedDetails";

interface TaskRelatedDetailsProps {
  taskId: number | null | undefined;
}

const OrderDetails: React.FC<{ order: TaskRelatedOrder }> = ({ order }) => {
  const { userRole } = useAuth();
  const isSpecialist = userRole === 'Специалист';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Заказ: {order.order_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isSpecialist && order.order_name && (
          <div>
            <span className="font-medium">Название:</span> {order.order_name}
          </div>
        )}
        
        {!isSpecialist && order.order_type && (
          <div>
            <span className="font-medium">Тип:</span> {order.order_type}
          </div>
        )}
        
        {!isSpecialist && order.status && (
          <div>
            <span className="font-medium">Статус:</span> 
            <Badge variant="outline" className="ml-2">{order.status}</Badge>
          </div>
        )}
        
        {order.delivery_address_full && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
            <div>
              <span className="font-medium">Адрес доставки:</span>
              <p className="text-sm text-gray-600">{order.delivery_address_full}</p>
            </div>
          </div>
        )}
        
        {order.client_language && (
          <div>
            <span className="font-medium">Язык клиента:</span> {order.client_language}
          </div>
        )}
        
        {(order.client_name || order.client_phone) && (
          <div className="space-y-1">
            <span className="font-medium">Контакт клиента:</span>
            {order.client_name && <p className="text-sm">{order.client_name}</p>}
            {order.client_phone && (
              <p className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {order.client_phone}
              </p>
            )}
          </div>
        )}
        
        {!isSpecialist && order.final_amount && (
          <div className="flex items-center gap-1">
            <Euro className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Сумма:</span> €{order.final_amount}
          </div>
        )}
        
        {!isSpecialist && order.payment_status && (
          <div>
            <span className="font-medium">Статус оплаты:</span>
            <Badge variant="outline" className="ml-2">{order.payment_status}</Badge>
          </div>
        )}
        
        {!isSpecialist && order.client_contact && (
          <div className="border-t pt-3 space-y-1">
            <span className="font-medium text-sm">Контакт клиента:</span>
            <p className="text-sm">{order.client_contact.full_name}</p>
            {order.client_contact.primary_phone && (
              <p className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {order.client_contact.primary_phone}
              </p>
            )}
            {order.client_contact.primary_email && (
              <p className="text-sm flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {order.client_contact.primary_email}
              </p>
            )}
          </div>
        )}
        
        {!isSpecialist && order.client_company && (
          <div className="border-t pt-3 space-y-1">
            <span className="font-medium text-sm">Компания клиента:</span>
            <p className="text-sm">{order.client_company.company_name}</p>
            {order.client_company.phone && (
              <p className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {order.client_company.phone}
              </p>
            )}
            {order.client_company.email && (
              <p className="text-sm flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {order.client_company.email}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ContactDetails: React.FC<{ contact: TaskRelatedContact }> = ({ contact }) => {
  const { userRole } = useAuth();
  const isSpecialist = userRole === 'Специалист';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Контакт: {contact.full_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contact.primary_email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{contact.primary_email}</span>
          </div>
        )}
        
        {!isSpecialist && contact.primary_phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{contact.primary_phone}</span>
          </div>
        )}
        
        {!isSpecialist && contact.secondary_phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{contact.secondary_phone} (доп.)</span>
          </div>
        )}
        
        {!isSpecialist && contact.secondary_email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{contact.secondary_email} (доп.)</span>
          </div>
        )}
        
        {!isSpecialist && contact.nie && (
          <div>
            <span className="font-medium">NIE:</span> {contact.nie}
          </div>
        )}
        
        {(contact.formatted_address || contact.delivery_address) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
            <div>
              <span className="font-medium">Адрес:</span>
              {contact.formatted_address ? (
                <p className="text-sm text-gray-600">{contact.formatted_address}</p>
              ) : contact.delivery_address ? (
                <p className="text-sm text-gray-600">
                  {[
                    contact.delivery_address.street,
                    contact.delivery_address.number,
                    contact.delivery_address.apartment,
                    contact.delivery_address.city,
                    contact.delivery_address.postal_code,
                    contact.delivery_address.country
                  ].filter(Boolean).join(', ')}
                </p>
              ) : null}
            </div>
          </div>
        )}
        
        {!isSpecialist && contact.associated_company && (
          <div className="border-t pt-3">
            <span className="font-medium text-sm">Связанная компания:</span>
            <p className="text-sm">{contact.associated_company.company_name}</p>
          </div>
        )}
        
        {!isSpecialist && contact.notes && (
          <div className="border-t pt-3">
            <span className="font-medium text-sm">Заметки:</span>
            <p className="text-sm text-gray-600">{contact.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LeadDetails: React.FC<{ lead: TaskRelatedLead }> = ({ lead }) => {
  const { userRole } = useAuth();
  const isSpecialist = userRole === 'Специалист';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          Лид: {lead.name || `#${lead.lead_id}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{lead.email}</span>
          </div>
        )}
        
        {!isSpecialist && lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{lead.phone}</span>
          </div>
        )}
        
        {!isSpecialist && lead.lead_source && (
          <div>
            <span className="font-medium">Источник:</span> {lead.lead_source}
          </div>
        )}
        
        {!isSpecialist && lead.lead_status && (
          <div>
            <span className="font-medium">Статус:</span>
            <Badge variant="outline" className="ml-2">{lead.lead_status}</Badge>
          </div>
        )}
        
        {!isSpecialist && lead.client_language && (
          <div>
            <span className="font-medium">Язык клиента:</span> {lead.client_language}
          </div>
        )}
        
        {lead.initial_comment && (
          <div>
            <span className="font-medium">Комментарий:</span>
            <p className="text-sm text-gray-600 mt-1">{lead.initial_comment}</p>
          </div>
        )}
        
        {!isSpecialist && lead.creation_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Создан: {new Date(lead.creation_date).toLocaleDateString('ru-RU')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PartnerDetails: React.FC<{ partner: TaskRelatedPartner }> = ({ partner }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="h-5 w-5" />
          Партнер: {partner.company_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {partner.contact_person && (
          <div>
            <span className="font-medium">Контактное лицо:</span> {partner.contact_person}
          </div>
        )}
        
        {partner.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{partner.phone}</span>
          </div>
        )}
        
        {partner.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{partner.email}</span>
          </div>
        )}
        
        {partner.specialization && (
          <div>
            <span className="font-medium">Специализация:</span> {partner.specialization}
          </div>
        )}
        
        {partner.website && (
          <div>
            <span className="font-medium">Веб-сайт:</span>{' '}
            <a 
              href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {partner.website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CustomRequestDetails: React.FC<{ customRequest: TaskRelatedCustomRequest }> = ({ customRequest }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Запрос: {customRequest.request_name || `#${customRequest.custom_request_id}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {customRequest.request_status && (
          <div>
            <span className="font-medium">Статус:</span>
            <Badge variant="outline" className="ml-2">{customRequest.request_status}</Badge>
          </div>
        )}
        
        {customRequest.client_description && (
          <div>
            <span className="font-medium">Описание клиента:</span>
            <p className="text-sm text-gray-600 mt-1">{customRequest.client_description}</p>
          </div>
        )}
        
        {customRequest.desired_completion_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Желаемая дата завершения: {new Date(customRequest.desired_completion_date).toLocaleDateString('ru-RU')}</span>
          </div>
        )}
        
        {customRequest.preliminary_cost && (
          <div className="flex items-center gap-1">
            <Euro className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Предварительная стоимость:</span> €{customRequest.preliminary_cost}
          </div>
        )}
        
        {customRequest.desired_materials && (
          <div>
            <span className="font-medium">Желаемые материалы:</span> {customRequest.desired_materials}
          </div>
        )}
        
        {customRequest.estimated_dimensions && (
          <div>
            <span className="font-medium">Ориентировочные размеры:</span> {customRequest.estimated_dimensions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TaskRelatedDetails: React.FC<TaskRelatedDetailsProps> = ({ taskId }) => {
  const { data: relatedDetails, isLoading, error } = useTaskRelatedDetails(taskId);

  if (!taskId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Загрузка связанной информации...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error loading task related details:", error);
    if (error.message?.includes('Access denied')) {
      return (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <p className="text-amber-800 text-sm">
              У вас нет доступа к подробной информации об этой задаче.
            </p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-4">
          <p className="text-red-800 text-sm">
            Ошибка при загрузке связанной информации: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!relatedDetails) {
    return null;
  }

  const { related_entities } = relatedDetails;
  const hasRelatedEntities = Object.values(related_entities).some(entity => entity !== null);

  if (!hasRelatedEntities) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="py-4">
          <p className="text-gray-600 text-sm">
            Нет связанных объектов для этой задачи.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Связанная информация</h3>
      <div className="space-y-4">
        {related_entities.order && <OrderDetails order={related_entities.order} />}
        {related_entities.contact && <ContactDetails contact={related_entities.contact} />}
        {related_entities.lead && <LeadDetails lead={related_entities.lead} />}
        {related_entities.partner && <PartnerDetails partner={related_entities.partner} />}
        {related_entities.custom_request && <CustomRequestDetails customRequest={related_entities.custom_request} />}
      </div>
    </div>
  );
};

export default TaskRelatedDetails;
