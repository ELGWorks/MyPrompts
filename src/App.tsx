import { useEffect, useMemo, useState } from "react";
import {
  getPrompts,
  addPrompt,
  updatePrompt,
  deletePrompt,
} from "./lib/storage";
import type { Prompt, PromptInput } from "./types";
import PromptForm from "./components/PromptForm";
import PromptList from "./components/PromptList";
import PermissionBanner from "./components/PermissionBanner";

export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  // null = showing list, 'new' = creating, or a prompt = editing
  const [editing, setEditing] = useState<Prompt | "new" | null>(null);
  const [query, setQuery] = useState("");

  const refresh = async () => setPrompts(await getPrompts());

  useEffect(() => {
    refresh();
  }, []);

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
    } else if (editing) {
      await updatePrompt(editing.id, data);
    }
    setEditing(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deletePrompt(id);
    refresh();
  };

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-indigo-600">MyPrompts</h1>
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
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full border rounded px-2 py-1 text-sm mb-3 outline-none"
          />
          <PromptList
            prompts={filtered}
            query={query.trim()}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        </>
      )}
      <p className="mt-4 text-center text-[10px] text-gray-400">
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
