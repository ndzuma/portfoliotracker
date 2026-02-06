"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function RedesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const variants = [
    { id: "1", label: "Command Center" },
    { id: "2", label: "Bento Grid" },
    { id: "3", label: "Finance Terminal" },
    { id: "4", label: "Card Deck" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-card/80 backdrop-blur-md border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground mr-3 uppercase tracking-wider">
          Redesign Preview
        </span>
        {variants.map((v) => {
          const isActive = pathname === `/redesign/${v.id}`;
          return (
            <Link
              key={v.id}
              href={`/redesign/${v.id}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {v.id}. {v.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="ml-4 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md border border-border hover:bg-muted transition-colors"
        >
          Back to Original
        </Link>
      </div>
      <div className="pt-10">{children}</div>
    </div>
  );
}
