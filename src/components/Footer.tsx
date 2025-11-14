// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 dark:text-slate-400">
        © {new Date().getFullYear()} HayvanDostum · Kedi ve köpekleriniz için
        hatırlatıcılar ve AI tavsiyeler.
      </div>
    </footer>
  );
}