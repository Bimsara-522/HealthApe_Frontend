"use client";

import React, { useState } from "react";
import {
  UserCircleIcon,
  LockClosedIcon,
  BellIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";

// ─── Dummy Data 
const DUMMY_USER = {
  firstName: "Sdru",
  lastName: "Wije",
  email: "sdru.wije@example.com",
  phone: "+1 (555) 012-3456",
  dob: "1990-04-15",
  initials: "SW",
};

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
    <div className="mb-6 flex items-center gap-3">
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
  rightElement,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rightElement?: React.ReactNode;
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-emerald-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Main Page 
export default function SettingsPage() {
  // Profile state
  const [firstName, setFirstName] = useState(DUMMY_USER.firstName);
  const [lastName, setLastName] = useState(DUMMY_USER.lastName);
  const [email, setEmail] = useState(DUMMY_USER.email);
  const [phone, setPhone] = useState(DUMMY_USER.phone);
  const [dob, setDob] = useState(DUMMY_USER.dob);
  const [profileSaved, setProfileSaved] = useState(false);

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

  // Toast
  const [toast, setToast] = useState<null | {
    type: "success" | "error";
    title: string;
    message?: string;
  }>(null);

  const showToast = (type: "success" | "error", title: string, message?: string) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showToast("error", "Missing fields", "First name, last name and email are required.");
      return;
    }
    setProfileSaved(true);
    showToast("success", "Profile updated!", "Your profile changes have been saved.");
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveNotifications = () => {
    showToast("success", "Preferences saved!", "Your notification settings have been updated.");
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  