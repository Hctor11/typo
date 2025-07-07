"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className="flex items-center justify-between py-10 px-12 mb-8"
      style={{
        background: "none",
      }}
    >
      <div className="flex items-center gap-2 select-none">
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--navbar-text)" }}
        >
          typo
        </span>
        <span
          className="text-xs px-2 py-1 rounded ml-2"
          style={{
            background: "var(--navbar-badge-bg)",
            color: "var(--navbar-badge-text)"
          }}
        >
          typing test
        </span>
      </div>
      <div>
        <select
          className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-md focus:outline-none"
          style={{ minWidth: 70 }}
          defaultValue={15}
          onChange={e => {
            const count = parseInt(e.target.value, 10);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('wordCountChange', { detail: count }));
            }
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </nav>
  );
}
