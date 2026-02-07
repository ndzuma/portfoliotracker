"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <AdminHeader />
      <AdminDashboard />
    </div>
  );
}
