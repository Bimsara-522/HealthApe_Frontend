// app/upload-record/components/LeftPanel.tsx
"use client";

type Props = {
  active?: string;
};

const menuItems = [
  "Dashboard",
  "Upload Medical Files",
  "Medical Records",
  "Medications",
  "Appointments",
  "AI Assistant",
  "Insights",
  "Settings",
];

export default function LeftPanel({ active }: Props) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">HealthApe</h2>

      <nav className="flex flex-col space-y-2 mt-8">
        {menuItems.map((item) => {
          const isActive = item === active;
          return (
            <button
              key={item}
              className={`text-left px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              type="button"
            >
              {item}
            </button>
          );
        })}
      </nav>
    </div>
  );
}