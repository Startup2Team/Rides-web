"use client";

import { useState } from "react";
import { AuditConsole } from "../audit/audit-console";
import { SettingsConsole } from "../settings/settings-console";

type ProfileTab = "settings" | "audit";

const tabs: { id: ProfileTab; label: string }[] = [
  { id: "settings", label: "System Settings" },
  { id: "audit", label: "Audit Log" },
];

export function ProfileConsole() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("settings");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1.5">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "settings" ? (
        <SettingsConsole />
      ) : (
        <AuditConsole />
      )}
    </div>
  );
}
