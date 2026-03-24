"use client";

import type { Category } from "@/lib/types";

const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: "road", label: "Road", color: "bg-road" },
  { key: "oval", label: "Oval", color: "bg-oval" },
  { key: "dirt_road", label: "Dirt Road", color: "bg-dirt-road" },
  { key: "dirt_oval", label: "Dirt Oval", color: "bg-dirt-oval" },
];

interface CategoryTabsProps {
  selected: Category;
  onSelect: (cat: Category) => void;
}

export default function CategoryTabs({
  selected,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-800">
      {CATEGORIES.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            selected === key
              ? "text-gray-100 bg-gray-900"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
          }`}
        >
          {label}
          {selected === key && (
            <span
              className={`absolute bottom-0 left-0 right-0 h-0.5 ${color}`}
            />
          )}
        </button>
      ))}
    </div>
  );
}
