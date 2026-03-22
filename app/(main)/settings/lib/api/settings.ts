import api from 'lib/api/client';

export type ProfileResponse = {
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
};

export type EditableProfile = {
  firstName: string;
  lastName: string;
};

export type UpdateProfileDto = {
  firstName: string;
  lastName: string;
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type NotificationSettingsDto = {
  medicationReminders: boolean;
  appointmentAlerts: boolean;
};

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get('/settings/profile');
  return data;
}

export async function updateProfile(dto: UpdateProfileDto) {
  const { data } = await api.patch('/settings/profile', dto);
  return data;
}

export async function changePassword(dto: ChangePasswordDto) {
  const { data } = await api.patch('/settings/password', dto);
  return data;
}

export async function getNotificationSettings(): Promise<NotificationSettingsDto> {
  const { data } = await api.get('/settings/notifications');
  return data;
}

export async function updateNotificationSettings(dto: NotificationSettingsDto) {
  const { data } = await api.patch('/settings/notifications', dto);
  return data;
}