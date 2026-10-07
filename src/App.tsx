import { useEffect, useMemo, useState } from "react";
import {
  getPrompts,
  addPrompt,
  updatePrompt,
  deletePrompt,
  incrementCopies,
  getDraft,
  clearDraft,
  type Draft,
} from "./lib/storage";
import type { PopupView, Prompt, PromptInput } from "./types";
import PromptForm from "./components/PromptForm";
import PromptList from "./components/PromptList";
import PermissionBanner from "./components/PermissionBanner";

export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  // null = showing current view, 'new' = creating, or a prompt = editing
  const [editing, setEditing] = useState<Prompt | "new" | null>(null);
  // Which "page" of the popup we're on: home or the full list
  const [view, setView] = useState<PopupView>("home");
  // Unsaved new-prompt draft recovered from a previous popup session
  const [restoredDraft, setRestoredDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");

  // Pick up an unsaved draft left over from a previous popup session and
  // drop the user straight back into the form so they can save or discard it.
  useEffect(() => {
    void (async () => {
      const draft = await getDraft();
      if (draft) {
        setRestoredDraft(draft);
        setEditing("new");
      }
    })();
  }, []);

  const refresh = async () => setPrompts(await getPrompts());

  useEffect(() => {
    refresh();
  }, []);

  const newestPrompts = useMemo(
    () => [...prompts].sort((a, b) => b.createdAt - a.createdAt),
    [prompts],
  );

  // Top prompts = most copies first; ties (incl. all zeros) broken by newest.
  const topPrompts = useMemo(
    () =>
      [...prompts].sort(
        (a, b) => b.copies - a.copies || b.createdAt - a.createdAt,
      ),
    [prompts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prompts;
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q),
    );
  }, [prompts, query]);

  const handleSave = async (data: PromptInput) => {
    if (editing === "new") {
      await addPrompt(data);
      await clearDraft();
      setRestoredDraft(null);
    } else if (editing) {
      await updatePrompt(editing.id, data);
    }
    setEditing(null);
    refresh();
  };

  // Discard the recovered draft (or clear it after a plain Cancel on new).
  const handleCloseDraft = async () => {
    await clearDraft();
    setRestoredDraft(null);
  };

  const handleDelete = async (id: string) => {
    await deletePrompt(id);
    refresh();
  };

  const handleCopy = async (prompt: Prompt) => {
    await incrementCopies(prompt.id);
    refresh();
  };

  return (
    <div className="flex min-h-screen flex-col p-4">
      <header className="flex justify-between items-center gap-2 mb-3">
        {view === "all" && !editing && (
          <button
            onClick={() => setView("home")}
            className="text-sm text-indigo-600 cursor-pointer"
          >
            &larr; Back
          </button>
        )}
        <h1 className="text-xl font-bold text-indigo-600">
          {view === "all" && !editing ? "All Prompts" : "MyPrompts"}
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing("new")}
            className="px-3 py-1 text-sm rounded bg-indigo-600 text-white cursor-pointer"
          >
            New
          </button>
        )}
      </header>
      <PermissionBanner />
      {editing ? (
        <PromptForm
          initial={editing === "new" ? null : editing}
          restoredDraft={editing === "new" ? restoredDraft : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDiscardDraft={handleCloseDraft}
        />
      ) : (
        <>
          {view === "home" ? (
            <>
              <section className="mb-4">
                <h2 className="text-sm font-bold text-gray-700 mb-1">
                  New Prompts
                </h2>
                <PromptList
                  prompts={newestPrompts.slice(0, 2)}
                  emptyMessage='No prompts yet. Click "New" to add your first one.'
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </section>
              <section>
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-sm font-bold text-gray-700">
                    Top 3 Prompts
                  </h2>
                  {prompts.length > 3 && (
                    <button
                      onClick={() => setView("all")}
                      className="text-xs text-indigo-600 underline cursor-pointer"
                    >
                      See all prompts
                    </button>
                  )}
                </div>
                <PromptList
                  prompts={topPrompts.slice(0, 3)}
                  emptyMessage="Nothing here yet. Copy prompts to climb this ranking."
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </section>
            </>
          ) : (
            <>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full border rounded px-2 py-1 text-sm mb-3 outline-none"
                autoFocus
              />
              <PromptList
                prompts={filtered}
                query={query.trim()}
                onEdit={setEditing}
                onDelete={handleDelete}
                onCopy={handleCopy}
              />
            </>
          )}
        </>
      )}
      <p className="mt-auto pt-4 text-center text-[10px] text-gray-400">
        Icon by{" "}
        <a
          href="https://www.flaticon.com/authors/kiranshastry"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Kiranshastry - Flaticon
        </a>
      </p>
    </div>
  );
}
