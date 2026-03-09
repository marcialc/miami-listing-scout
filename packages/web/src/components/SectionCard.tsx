import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="bg-white rounded-xl border border-stone-200 shadow-sm">
      <div className="px-5 sm:px-6 py-4 border-b border-stone-100">
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        <p className="text-xs text-stone-400 mt-0.5">{description}</p>
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </section>
  );
}
