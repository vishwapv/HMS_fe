// src/components/NestedHamburger.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem } from "../../../../types/index";

export function NestedMenu({
  items,
  onNavigate,
}: {
  items: MenuItem[];
  onNavigate?: () => void;
}) {
  return (
    <ul className="menu" role="menu">
      {items.map((item) => (
        <li className="item" key={item.label}>
          {item.children?.length ? (
            <Expandable label={item.label}>
              <NestedMenu items={item.children} onNavigate={onNavigate} />
            </Expandable>
          ) : (
            <Link
              href={item.href ?? "#"}
              className="btn-row"
              role="menuitem"
              onClick={onNavigate}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="badge" aria-label="tag">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function Expandable({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="btn-row"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <svg
          className={`chev ${open ? "open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            d="M8 5l8 7-8 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="children">{children}</div>}
    </div>
  );
}
