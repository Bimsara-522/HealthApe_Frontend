"use client";

import {
  HomeIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

type Props = {
  active?: string;
};

const menuItems: { label: string; icon: any }[] = [
  { label: "Dashboard", icon: HomeIcon },
  { label: "Upload Medical Files", icon: ArrowUpTrayIcon },
  { label: "Medical Records", icon: ClipboardDocumentListIcon },
  { label: "Medications", icon: BeakerIcon },
  { label: "Appointments", icon: CalendarDaysIcon },
  { label: "AI Assistant", icon: ChatBubbleLeftRightIcon },
  { label: "Insights", icon: ChartBarIcon },
  { label: "Settings", icon: Cog6ToothIcon },
];

export default function LeftPanel({ active }: Props) {
  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            HealthApe
          </h2>
          <p className="text-xs text-slate-500">
            Patient portal
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          v1
        </span>
      </div>

      {/* Menu */}
      <nav className="space-y-1">
        <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400">
          MENU
        </p>

        {menuItems.map((item) => {
          const isActive = item.label === active;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition
                  ${
                    isActive
                      ? "bg-white border-blue-100"
                      : "bg-white border-slate-200"
                  }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-700" : "text-slate-600"
                  }`}
                />
              </span>

              <div className="min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isActive ? "text-blue-700" : "text-slate-800"
                  }`}
                >
                  {item.label}
                </p>

                <p className="text-xs text-slate-500 truncate">
                  {isActive ? "Currently open" : "Open section"}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-800">
          Tip
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Upload files first, then submit for processing.
        </p>
      </div>
    </div>
  );
}
