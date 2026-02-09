"use client";

import { V2Header } from "@/components/header";

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <V2Header />
      {children}
    </div>
  );
}
