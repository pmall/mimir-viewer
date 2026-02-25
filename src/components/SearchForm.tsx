"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/viewer/${query.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter Target ID (e.g. A0A024R1R8)"
        className="flex-1 rounded-lg bg-slate-800 border-slate-700 border p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        autoComplete="off"
        spellCheck="false"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="rounded-lg bg-indigo-600 px-6 font-semibold transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search
      </button>
    </form>
  );
}
