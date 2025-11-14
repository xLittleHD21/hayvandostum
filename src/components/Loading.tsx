// src/components/Loading.tsx
export default function Loading({ text = "Yükleniyor..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-slate-600 dark:text-slate-300">
      <span className="animate-pulse">{text}</span>
    </div>
  );
}