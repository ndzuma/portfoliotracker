"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { FeatureFlagsManager } from "@/components/admin/feature-flags-manager";

export default function AdminFlagsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <AdminHeader />
      <FeatureFlagsManager />
    </div>
  );
}
