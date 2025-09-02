import type React from "react";
import { AuthenticatedWrapper } from "./auth-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedWrapper>{children}</AuthenticatedWrapper>;
}
