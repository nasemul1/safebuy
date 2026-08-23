"use client";

import { useState } from "react";

interface Evidence {
  id: string;
  url: string;
  type: string;
}

export function EvidenceGallery({ evidence }: { evidence: Evidence[] }) {
  const [selected, setSelected] = useState<Evidence | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidence.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition-colors"
          >
            <img
              src={item.url}
              alt={item.type}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
              {item.type.replace("_", " ")}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selected.url}
              alt={selected.type}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
