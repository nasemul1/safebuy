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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {evidence.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-accent transition-colors bg-zinc-50"
          >
            <img
              src={item.url}
              alt={item.type}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-zinc-900/70 text-white text-[10px] font-medium rounded-md backdrop-blur-sm">
              {item.type.replace("_", " ")}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-zinc-900/70 text-white rounded-full hover:bg-zinc-900 transition-colors backdrop-blur-sm text-sm"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
