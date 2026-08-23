export function EvidenceGallery({ evidence }: { evidence: { id: string; url: string; type: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {evidence.map((item) => (
        <div key={item.id} className="rounded-lg overflow-hidden border border-slate-200">
          {item.type.startsWith("image") ? (
            <img
              src={item.url}
              alt="Evidence"
              className="w-full h-40 object-cover"
            />
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 text-sm text-blue-600 hover:underline"
            >
              View attachment
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
