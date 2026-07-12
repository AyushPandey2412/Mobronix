"use client";

import { FlowHeader } from "@/components/shared/FlowHeader";
import { Toggle } from "@/components/ui/Toggle";
import { Pill } from "@/components/ui/Selectable";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const toggleSetting = useStore((s) => s.toggleSetting);
  const setLanguage = useStore((s) => s.setLanguage);

  return (
    <>
      <FlowHeader title="Settings" back="/account" />

      <section className="mt-2">
        <h2 className="px-1 text-label uppercase tracking-wide text-text-tertiary">Notifications</h2>
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          <Row
            label="Push notifications"
            sub="Status updates on your enquiry"
            control={<Toggle checked={settings.pushNotif} onChange={() => toggleSetting("pushNotif")} label="Push notifications" />}
          />
          <Row
            label="SMS updates"
            sub="Get a text when status changes"
            control={<Toggle checked={settings.smsUpdates} onChange={() => toggleSetting("smsUpdates")} label="SMS updates" />}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="px-1 text-label uppercase tracking-wide text-text-tertiary">Language</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
          <Row
            label="App language"
            sub="Display language for the app"
            control={
              <div className="flex gap-2">
                {(["EN", "HI"] as const).map((l) => (
                  <Pill key={l} active={settings.language === l} onClick={() => setLanguage(l)} className="px-4 py-1.5">
                    {l}
                  </Pill>
                ))}
              </div>
            }
          />
        </div>
      </section>
    </>
  );
}

function Row({ label, sub, control }: { label: string; sub: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <div className="text-body-md font-semibold text-text-primary">{label}</div>
        <div className="text-caption text-text-tertiary">{sub}</div>
      </div>
      {control}
    </div>
  );
}
