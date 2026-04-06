"use client";

import { useMemo, useState } from "react";

type Schedule = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: {
    id?: string;
    name?: string;
    city?: string | null;
  } | null;
};

type Props = {
  programName: string;
  schedules?: Schedule[];
};

const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function to12h(time: string) {
  const [hRaw, mRaw] = time.split(":");
  const h = Number(hRaw ?? "0");
  const m = Number(mRaw ?? "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default function ProgramScheduleModal({ programName, schedules = [] }: Props) {
  const [open, setOpen] = useState(false);

  const groupedByLocation = useMemo(() => {
    const map = new Map<string, { label: string; items: Schedule[] }>();

    for (const s of schedules) {
      const locName = s.location?.name || "Main Academy";
      const locCity = s.location?.city ? `, ${s.location.city}` : "";
      const key = s.location?.id || `fallback-${locName}-${locCity}`;
      const label = `${locName}${locCity}`;

      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key)!.items.push(s);
    }

    return Array.from(map.values()).map((group) => ({
      ...group,
      items: group.items.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
      }),
    }));
  }, [schedules]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left text-white text-sm font-medium hover:text-lebanon-green transition-colors underline decoration-dotted underline-offset-2"
      >
        {schedules.length > 0 ? "View all schedules" : "TBA"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold">{programName} — Full Schedule</h3>
                <p className="text-sm text-slate-500">
                  Read-only schedule by location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100"
                aria-label="Close schedule modal"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {groupedByLocation.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No schedules published yet for this program.
                </div>
              ) : (
                groupedByLocation.map((group) => (
                  <div key={group.label} className="rounded-xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900 mb-2">📍 {group.label}</div>
                    <div className="space-y-1.5">
                      {group.items.map((item, idx) => (
                        <div
                          key={`${group.label}-${item.dayOfWeek}-${item.startTime}-${item.endTime}-${item.id ?? idx}`}
                          className="text-sm text-slate-700 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span className="font-medium">{dayMap[item.dayOfWeek] ?? "Day"}</span>
                          <span>
                            {to12h(item.startTime)} – {to12h(item.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
