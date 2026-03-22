"use client";

import React, { useEffect, useState } from "react";
import {
  UserCircleIcon,
  LockClosedIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import {
  getProfile,
  updateProfile,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  type UpdateProfileDto,
  type EditableProfile,
  type ChangePasswordDto,
  type NotificationSettingsDto,
} from '@/app/(main)/settings/lib/api/settings';
import { useRouter } from "next/navigation";
import api from "@/lib/api/client";
import type { AxiosError } from "axios";

// ─── Section Header 
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

// ─── Input Field 
function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  rightElement,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toggle 
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? "bg-emerald-500" : "bg-slate-200"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
}

// ─── Main Page 
export default function SettingsPage() {
  const router = useRouter();

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for entire settings page
  // Separate loading state for notification saving
  // This prevents the whole page from freezing when only notifications are saving
  const [savingNotifications, setSavingNotifications] = useState(false);
  // const [initialProfile, setInitialProfile] = useState<UpdateProfileDto | null>(null);
  const [initialProfile, setInitialProfile] = useState<EditableProfile | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification state
  const [medReminders, setMedReminders] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(false);

  // Snapshot of notification values from backend when page loads
  // Used to detect if the user has changed anything before enabling "Save Preferences"
  const [initialNotifications, setInitialNotifications] = useState<NotificationSettingsDto | null>(null);

  // Toast
  const [toast, setToast] = useState<null | {
    type: "success" | "error";
    title: string;
    message?: string;
  }>(null);
  // Centralized toast helper to show success/error messages
  // Auto-clears after 4 seconds
  const showToast = (type: "success" | "error", title: string, message?: string) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  // useEffect() loads profile + notification settings in parallel to reduce page load time
  // fetches profile from getProfile() and fetches notification settings from getNotificationSettings() and then populates React state
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const [profile, notifications] = await Promise.all([
          getProfile(),
          getNotificationSettings(),
        ]);

        const loadedProfile = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        };

        setFirstName(loadedProfile.firstName);
        setLastName(loadedProfile.lastName);
        setEmail(loadedProfile.email);
        setInitialProfile({
          firstName: loadedProfile.firstName,
          lastName: loadedProfile.lastName,
        });

        const loadedNotifications: NotificationSettingsDto = {
          medicationReminders: notifications.medicationReminders,
          appointmentAlerts: notifications.appointmentAlerts,
        };

        setMedReminders(loadedNotifications.medicationReminders);
        setAppointmentAlerts(loadedNotifications.appointmentAlerts);
        // Save the backend values as the "initial state"
        // This lets us detect if the user changed any toggles later
        setInitialNotifications(loadedNotifications);
      } catch (error: unknown) {
        showToast(
          "error",
          "Failed to load settings",
          (error as AxiosError<{ message?: string }>)?.response?.data?.message || "Could not fetch your settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast("error", "Missing fields", "First name, last name are required.");
      return;
    }

    try {
      const payload: UpdateProfileDto = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        // email: email.trim(),
      };

      const response = await updateProfile(payload);

      // update local state from backend response if returned
      if (response?.profile) {
        setFirstName(response.profile.firstName);
        setLastName(response.profile.lastName);
        setEmail(response.profile.email);
        setInitialProfile({
          firstName: response.profile.firstName,
          lastName: response.profile.lastName,
        });
      } else {
        setInitialProfile(payload);
      }

      setProfileSaved(true);
      showToast("success", "Profile updated!", "Your profile changes have been saved.");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error: unknown) {
      showToast(
        "error",
        "Profile update failed",
        (error as AxiosError<{ message?: string }>)?.response?.data?.message || "Could not update your profile."
      );
    }
  };

  // Save notification preferences to backend
  // Also update the initial snapshot so the "Save" button disables again
  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);

      const payload: NotificationSettingsDto = {
        medicationReminders: medReminders,
        appointmentAlerts,
      };

      await updateNotificationSettings(payload);

      setInitialNotifications(payload);

      showToast("success", "Preferences saved!", "Your notification settings have been updated.");
    } catch (error: unknown) {
      showToast(
        "error",
        "Failed to save preferences",
        (error as AxiosError<{ message?: string }>)?.response?.data?.message || "Could not update notification settings."       
      );
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("error", "Missing fields", "All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Password mismatch", "New password and confirm password do not match.");
      return;
    }

    try {
      const payload: ChangePasswordDto = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      await changePassword(payload);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showToast(
        "success",
        "Password updated!",
        "Your password has been changed successfully. Redirecting to login..."
      );
      // After password change we force logout for security reasons
      // A user with old tokens should not stay authenticated
      setTimeout(async () => {
        try {
          await api.post("/auth/logout"); // clears httpOnly cookies on backend
        } catch {
          // even if logout fails, still redirect
        }
        router.replace("/login");  // After password change, prevents the user from pressing Back and returning to the settings page, instead forces a logout
      }, 3000);  // wait 3 seconds so the user sees the toast
    } catch (error: unknown) {
      showToast(
        "error",
        "Password update failed",
        (error as AxiosError<{ message?: string }>)?.response?.data?.message || "Could not update password."
      );
    }
  };
  // Detect if the user actually changed any notification settings
  // Used to disable the Save button when nothing changed
  const hasNotificationChanges =
    initialNotifications !== null &&
    (
      medReminders !== initialNotifications.medicationReminders ||
      appointmentAlerts !== initialNotifications.appointmentAlerts
    );

  // Profile button only enables when at least one field differs from the loaded values
  const hasProfileChanges =
    initialProfile !== null &&
    (
      firstName.trim() !== initialProfile.firstName ||
      lastName.trim() !== initialProfile.lastName
    );

  // Password button only enables when all three password fields have values
  const hasPasswordInput =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "";

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] w-full max-w-sm">
          <div
            className={`pointer-events-auto overflow-hidden rounded-3xl border shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-md ${toast.type === "success"
                ? "border-emerald-200 bg-white/95"
                : "border-red-200 bg-white/95"
              }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toast.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                  }`}
              >
                {toast.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${toast.type === "success" ? "text-emerald-800" : "text-red-800"}`}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className={`mt-1 text-xs leading-relaxed ${toast.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
                    {toast.message}
                  </p>
                )}
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden bg-slate-100">
              <div className={`h-full animate-[toastShrink_4s_linear_forwards] ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account preferences and security.</p>
      </div>

      {/* ── Profile Section ── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <SectionHeader
          icon={UserCircleIcon}
          title="Profile"
          description="Update your personal information"
        />

        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-xl font-bold text-blue-700 shadow-sm">
            {(firstName?.charAt(0) || "")}
            {(lastName?.charAt(0) || "")}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{firstName} {lastName}</p>
            <p className="text-xs text-slate-400">Your initials are shown as your avatar.</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Sdru"
          />
          <InputField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Wije"
          />
          <div className="sm:col-span-2">
            <InputField
              label="Email"
              type="email"
              value={email}
              disabled={true}
              // onChange={(e) => setEmail(e.target.value)}
            />
          </div>

        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={!hasProfileChanges}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {profileSaved ? (
              <>
                <CheckSolid className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </section>

      {/* ── Security Section ── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <SectionHeader
          icon={LockClosedIcon}
          title="Security & Authentication"
          description="Keep your account safe"
        />

        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                {showCurrent ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            }
          />
          <InputField
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                {showNew ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            }
          />
          <InputField
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                {showConfirm ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={!hasPasswordInput}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            Update Password
          </button>
        </div>
      </section>

      {/* ── Notifications Section ── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <SectionHeader
          icon={BellIcon}
          title="Notification Settings"
          description="Control how we reach you"
        />

        <div className="space-y-5">
          {/* Medication Reminders */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">Medication Reminders</p>
              <p className="text-xs text-slate-400">Push notifications for daily meds.</p>
            </div>
            <Toggle
              enabled={medReminders}
              onChange={() => setMedReminders(!medReminders)}
            />
          </div>

          {/* Appointment Alerts */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">Appointment Alerts</p>
              <p className="text-xs text-slate-400">Email reminders for upcoming appointments.</p>
            </div>
            <Toggle
              enabled={appointmentAlerts}
              onChange={() => setAppointmentAlerts(!appointmentAlerts)}
            />
          </div>

          {/* New Record Confirmation */}
          {/* <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">Record Save Confirmation</p>
              <p className="text-xs text-slate-400">Notify me when a medical record is successfully saved.</p>
            </div>
            <Toggle
              enabled={recordConfirm}
              onChange={() => setRecordConfirm(!recordConfirm)}
            />
          </div> */}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveNotifications}
            // Disable button if:
            // 1. Request is currently saving
            // 2. User didn't change anything
            disabled={savingNotifications || !hasNotificationChanges}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {savingNotifications ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </section>

      <style jsx>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}