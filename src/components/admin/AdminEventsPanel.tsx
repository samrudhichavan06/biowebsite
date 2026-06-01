import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventCatalog } from "@/lib/events";

interface EventsPanelProps {
  adminEvents: any[];
  onSaveEvents: (events: any[]) => void;
}

export const AdminEventsPanel = ({ adminEvents, onSaveEvents }: EventsPanelProps) => {
  const [editorContent, setEditorContent] = useState(JSON.stringify(adminEvents, null, 2));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-800">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700 mb-3 shadow-sm">
          <CalendarDays className="h-3.5 w-3.5" /> Event Catalog
        </div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Event Management</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">Edit and manage event catalog via JSON</p>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Event Catalog Editor</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => { setEditorContent(JSON.stringify(eventCatalog, null, 2)); }}
              className="h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-sm"
            >
              Import From Code
            </Button>
            <Button
              size="sm"
              onClick={() => setEditorContent(JSON.stringify(adminEvents, null, 2))}
              className="h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-sm"
            >
              Reset
            </Button>
          </div>
        </div>

        <textarea
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          rows={16}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-700 font-mono outline-none shadow-inner placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white resize-y"
        />

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              try {
                const parsed = JSON.parse(editorContent);
                onSaveEvents(parsed);
                alert("Events saved successfully.");
              } catch {
                alert("Invalid JSON. Please check and try again.");
              }
            }}
            className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-sm shadow transition"
          >
            Save Changes
          </Button>
        </div>
      </article>
    </div>
  );
};
