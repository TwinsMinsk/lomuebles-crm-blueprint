
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type EntityType = 'lead' | 'contact' | 'order' | 'task' | 'company' | 'supplier' | 'partner';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntityType?: EntityType;
  relatedEntityId?: number;
  actionUrl?: string;
}

// Helper function to create notifications programmatically
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  relatedEntityType,
  relatedEntityId,
  actionUrl
}: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: title,
      p_message: message,
      p_type: type,
      p_related_entity_type: relatedEntityType,
      p_related_entity_id: relatedEntityId,
      p_action_url: actionUrl
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

// Specific notification creators for common scenarios
export const notificationCreators = {
  // Lead notifications
  newLeadAssigned: (userId: string, leadName: string, leadId: number) =>
    createNotification({
      userId,
      title: 'Новый лид назначен',
      message: `Вам назначен новый лид: ${leadName}`,
      type: 'info',
      relatedEntityType: 'lead',
      relatedEntityId: leadId,
      actionUrl: `/leads/${leadId}`
    }),

  leadStatusChanged: (userId: string, leadName: string, newStatus: string, leadId: number) =>
    createNotification({
      userId,
      title: 'Статус лида изменен',
      message: `Лид "${leadName}" изменил статус на: ${newStatus}`,
      type: 'info',
      relatedEntityType: 'lead',
      relatedEntityId: leadId,
      actionUrl: `/leads/${leadId}`
    }),

  // Order notifications
  newOrderCreated: (userId: string, orderNumber: string, orderId: number) =>
    createNotification({
      userId,
      title: 'Создан новый заказ',
      message: `Создан заказ №${orderNumber}`,
      type: 'success',
      relatedEntityType: 'order',
      relatedEntityId: orderId,
      actionUrl: `/orders/${orderId}`
    }),

  orderStatusChanged: (userId: string, orderNumber: string, newStatus: string, orderId: number) =>
    createNotification({
      userId,
      title: 'Статус заказа изменен',
      message: `Заказ №${orderNumber} изменил статус на: ${newStatus}`,
      type: 'info',
      relatedEntityType: 'order',
      relatedEntityId: orderId,
      actionUrl: `/orders/${orderId}`
    }),

  orderOverdue: (userId: string, orderNumber: string, orderId: number) =>
    createNotification({
      userId,
      title: 'Заказ просрочен',
      message: `Заказ №${orderNumber} просрочен`,
      type: 'warning',
      relatedEntityType: 'order',
      relatedEntityId: orderId,
      actionUrl: `/orders/${orderId}`
    }),

  // Task notifications
  taskAssigned: (userId: string, taskName: string, taskId: number) =>
    createNotification({
      userId,
      title: 'Новая задача назначена',
      message: `Вам назначена новая задача: ${taskName}`,
      type: 'info',
      relatedEntityType: 'task',
      relatedEntityId: taskId,
      actionUrl: `/tasks/${taskId}`
    }),

  taskDueSoon: (userId: string, taskName: string, dueDate: string, taskId: number) =>
    createNotification({
      userId,
      title: 'Задача скоро истекает',
      message: `Задача "${taskName}" истекает ${dueDate}`,
      type: 'warning',
      relatedEntityType: 'task',
      relatedEntityId: taskId,
      actionUrl: `/tasks/${taskId}`
    }),

  taskOverdue: (userId: string, taskName: string, taskId: number) =>
    createNotification({
      userId,
      title: 'Задача просрочена',
      message: `Задача "${taskName}" просрочена`,
      type: 'error',
      relatedEntityType: 'task',
      relatedEntityId: taskId,
      actionUrl: `/tasks/${taskId}`
    }),

  // System notifications
  systemMaintenance: (userId: string, message: string) =>
    createNotification({
      userId,
      title: 'Системное уведомление',
      message,
      type: 'warning'
    }),

  welcomeMessage: (userId: string, userName: string) =>
    createNotification({
      userId,
      title: 'Добро пожаловать!',
      message: `Добро пожаловать в CRM lomuebles.es, ${userName}!`,
      type: 'success'
    })
};
