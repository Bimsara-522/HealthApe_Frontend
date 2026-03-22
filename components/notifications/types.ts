// This file defines the shared TypeScript types used by the notifications feature

export type NotificationType = 'appointment';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  href?: string;
  sourceId?: string;
};