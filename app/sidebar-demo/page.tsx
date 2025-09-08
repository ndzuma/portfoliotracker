import { PortfolioSidebar } from "@/components/portfolio-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export default function SidebarDemo() {
  return (
    <SidebarProvider>
      <PortfolioSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h2 className="text-lg font-semibold">Portfolio Tracker - Sidebar Demo</h2>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Shadcn Sidebar-08 Integration</h3>
              <p className="text-muted-foreground mb-4">
                The portfolio tracker now uses the shadcn sidebar-08 component structure with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Modern collapsible sidebar with icon tooltips</li>
                <li>Preserved portfolio-specific navigation items</li>
                <li>Maintained custom color theme (#8d745d)</li>
                <li>Feature flag support for conditional navigation</li>
                <li>Brand logo and user profile integration</li>
                <li>Responsive design with mobile support</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Navigation Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Core Navigation:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Dashboard</li>
                    <li>• News</li>
                    <li>• Settings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Feature Flag Controlled:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Watchlist</li>
                    <li>• Research</li>
                    <li>• Earnings Calendar</li>
                  </ul>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Implementation Details</h3>
              <p className="text-sm text-muted-foreground">
                Click the sidebar toggle button (☰) in the header to test the collapse/expand functionality.
                The sidebar will show icons with tooltips when collapsed, and full navigation when expanded.
              </p>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}