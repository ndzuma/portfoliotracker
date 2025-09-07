'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-utils";
import { toast } from "sonner";
import type { Asset } from '@/app/portfolio/[id]/components/types';

interface Portfolio {
  _id: string;
  name: string;
  description?: string;
  currentValue: number;
  change: number;
  changePercent: number;
  assets: Asset[];
  aiHeadline?: string;
  aiSummary?: string;
  createdAt?: string;
}

interface ExportPortfolioProps {
  portfolio: Portfolio;
}

export function ExportPortfolio({ portfolio }: ExportPortfolioProps) {
  const handleCSVExport = () => {
    try {
      exportToCSV(portfolio);
      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleExcelExport = () => {
    try {
      exportToExcel(portfolio);
      toast.success("Excel file exported successfully!");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel file");
    }
  };

  const handlePDFExport = async () => {
    try {
      // Get chart elements for PDF inclusion
      const allocationChart = document.querySelector('[data-chart="allocation"]') as HTMLElement;
      const performanceChart = document.querySelector('[data-chart="performance"]') as HTMLElement;
      
      const chartElements = {
        allocationChart,
        performanceChart
      };

      await exportToPDF(portfolio, chartElements);
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Portfolio
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCSVExport} className="flex items-center gap-2">
          <File className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExcelExport} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePDFExport} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}