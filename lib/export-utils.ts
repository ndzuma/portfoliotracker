import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Import the actual types from the components
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

// CSV Export
export const exportToCSV = (portfolio: Portfolio): void => {
  const csvContent = generateCSVContent(portfolio);
  downloadFile(csvContent, `${portfolio.name}_portfolio.csv`, 'text/csv');
};

const generateCSVContent = (portfolio: Portfolio): string => {
  const headers = [
    'Symbol',
    'Name', 
    'Type',
    'Current Value',
    'Average Buy Price',
    'Current Price',
    'Currency',
    'Change',
    'Change %',
    'Allocation %'
  ];

  const rows = portfolio.assets.map(asset => [
    asset.symbol || '',
    asset.name || '',
    asset.type || '',
    asset.currentValue || 0,
    asset.avgBuyPrice || 0,
    asset.currentPrice || 0,
    asset.currency || 'USD',
    asset.change || 0,
    asset.changePercent || 0,
    asset.allocation || 0
  ]);

  const csvRows = [headers, ...rows];
  return csvRows.map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
};

// Excel Export
export const exportToExcel = (portfolio: Portfolio): void => {
  const workbook = XLSX.utils.book_new();
  
  // Portfolio Summary Sheet
  const summaryData = [
    ['Portfolio Summary'],
    [''],
    ['Portfolio Name', portfolio.name],
    ['Description', portfolio.description || ''],
    ['Total Value', portfolio.currentValue],
    ['Total Change', portfolio.change],
    ['Change Percentage', `${portfolio.changePercent.toFixed(2)}%`],
    ['Number of Assets', portfolio.assets.length],
    ['Export Date', new Date().toLocaleDateString()],
    [''],
    ['AI Analysis'],
    ['Headline', portfolio.aiHeadline || ''],
    ['Summary', portfolio.aiSummary || '']
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Portfolio Summary');

  // Assets Detail Sheet
  const assetHeaders = [
    'Symbol', 'Name', 'Type', 'Current Value', 'Average Buy Price', 
    'Current Price', 'Currency', 'Change', 'Change %', 'Allocation %'
  ];
  
  const assetData = [
    assetHeaders,
    ...portfolio.assets.map(asset => [
      asset.symbol || '',
      asset.name || '',
      asset.type || '',
      asset.currentValue || 0,
      asset.avgBuyPrice || 0,
      asset.currentPrice || 0,
      asset.currency || 'USD',
      asset.change || 0,
      asset.changePercent || 0,
      asset.allocation || 0
    ])
  ];
  
  const assetSheet = XLSX.utils.aoa_to_sheet(assetData);
  XLSX.utils.book_append_sheet(workbook, assetSheet, 'Assets Detail');

  // Asset Type Summary Sheet
  const assetTypes = [...new Set(portfolio.assets.map(asset => asset.type))];
  const typesSummaryData = [
    ['Asset Type Summary'],
    [''],
    ['Type', 'Count', 'Total Value', 'Percentage of Portfolio'],
    ...assetTypes.map(type => {
      const typeAssets = portfolio.assets.filter(asset => asset.type === type);
      const typeValue = typeAssets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
      const typePercentage = portfolio.currentValue > 0 ? (typeValue / portfolio.currentValue * 100).toFixed(2) : '0.00';
      
      return [type, typeAssets.length, typeValue, `${typePercentage}%`];
    })
  ];
  
  const typesSummarySheet = XLSX.utils.aoa_to_sheet(typesSummaryData);
  XLSX.utils.book_append_sheet(workbook, typesSummarySheet, 'Asset Types');

  // Download
  XLSX.writeFile(workbook, `${portfolio.name}_portfolio.xlsx`);
};

// Enhanced PDF Export with Professional Finance Layout
export const exportToPDF = async (portfolio: Portfolio, chartElements?: { [key: string]: HTMLElement }): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Professional header with branding
  pdf.setFillColor(31, 81, 135); // Professional blue
  pdf.rect(0, 0, pageWidth, 15, 'F');
  
  // Logo placeholder and branding
  pdf.setFillColor(255, 255, 255);
  pdf.circle(12, 7.5, 3.5, 'F');
  pdf.setFontSize(7);
  pdf.setTextColor(31, 81, 135);
  pdf.text('PT', 10.2, 8.8);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Portfolio Tracker', 20, 9.5);
  
  // Report type and date in header
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Investment Report | ${today}`, pageWidth - 80, 9.5);

  // Main title section with enhanced typography
  yPosition = 30;
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 81, 135);
  pdf.text('Investment Portfolio', 20, yPosition);
  
  yPosition += 12;
  pdf.setFontSize(28);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Performance Report', 20, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(85, 85, 85);
  pdf.text(portfolio.name, 20, yPosition);
  
  if (portfolio.description) {
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setTextColor(119, 119, 119);
    const descriptionLines = pdf.splitTextToSize(portfolio.description, pageWidth - 40);
    pdf.text(descriptionLines, 20, yPosition);
    yPosition += descriptionLines.length * 4;
  }

  // Executive Summary Card
  yPosition += 15;
  const cardHeight = 55;
  
  // Card shadow effect
  pdf.setFillColor(210, 210, 210);
  pdf.rect(22, yPosition + 2, pageWidth - 42, cardHeight - 2, 'F');
  
  // Main card
  pdf.setFillColor(255, 255, 255);
  pdf.rect(20, yPosition, pageWidth - 40, cardHeight, 'F');
  
  // Card border
  pdf.setDrawColor(31, 81, 135);
  pdf.setLineWidth(1);
  pdf.rect(20, yPosition, pageWidth - 40, cardHeight);
  
  // Card header with gradient effect
  pdf.setFillColor(245, 248, 253);
  pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 81, 135);
  pdf.text('Executive Summary', 25, yPosition + 10);
  
  // Two-column layout for metrics
  const col1X = 25;
  const col2X = pageWidth / 2 + 15;
  const metricsY = yPosition + 25;
  
  // Column 1: Portfolio Value
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  pdf.text('TOTAL PORTFOLIO VALUE', col1X, metricsY);
  
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(51, 51, 51);
  pdf.text(`$${portfolio.currentValue.toLocaleString()}`, col1X, metricsY + 12);
  
  // Column 2: Performance
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  pdf.text('TOTAL RETURN', col2X, metricsY);
  
  const performanceColor = portfolio.change >= 0 ? [46, 125, 50] : [211, 47, 47];
  const performanceSymbol = portfolio.change >= 0 ? '+' : '';
  
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(performanceColor[0], performanceColor[1], performanceColor[2]);
  pdf.text(`${performanceSymbol}$${Math.abs(portfolio.change).toLocaleString()}`, col2X, metricsY + 12);
  
  pdf.setFontSize(16);
  pdf.text(`(${performanceSymbol}${portfolio.changePercent.toFixed(2)}%)`, col2X, metricsY + 20);

  // Performance indicator
  const indicatorX = col2X - 12;
  if (portfolio.change >= 0) {
    // Green up triangle
    pdf.setFillColor(46, 125, 50);
    pdf.triangle(indicatorX, metricsY + 12, indicatorX + 3, metricsY + 8, indicatorX + 6, metricsY + 12, 'F');
  } else {
    // Red down triangle
    pdf.setFillColor(211, 47, 47);
    pdf.triangle(indicatorX, metricsY + 8, indicatorX + 3, metricsY + 12, indicatorX + 6, metricsY + 8, 'F');
  }

  yPosition += cardHeight + 20;

  // AI Analysis with enhanced design
  if (portfolio.aiSummary || portfolio.aiHeadline) {
    // Section divider
    pdf.setDrawColor(31, 81, 135);
    pdf.setLineWidth(2);
    pdf.line(20, yPosition, 60, yPosition);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 81, 135);
    pdf.text('Market Intelligence', 65, yPosition + 2);
    
    yPosition += 15;
    
    // AI content container
    const aiHeight = (portfolio.aiHeadline ? 20 : 0) + (portfolio.aiSummary ? 25 : 0);
    pdf.setFillColor(250, 253, 255);
    pdf.rect(20, yPosition, pageWidth - 40, aiHeight, 'F');
    
    // Left border accent
    pdf.setFillColor(31, 81, 135);
    pdf.rect(20, yPosition, 3, aiHeight, 'F');
    
    yPosition += 8;
    
    if (portfolio.aiHeadline) {
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      const headlineLines = pdf.splitTextToSize(portfolio.aiHeadline, pageWidth - 55);
      pdf.text(headlineLines, 28, yPosition);
      yPosition += headlineLines.length * 5 + 3;
    }
    
    if (portfolio.aiSummary) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(85, 85, 85);
      const summaryLines = pdf.splitTextToSize(portfolio.aiSummary, pageWidth - 55);
      pdf.text(summaryLines, 28, yPosition);
      yPosition += summaryLines.length * 4;
    }
    
    yPosition += 15;
  }

  // Asset Allocation with professional chart display
  if (chartElements?.allocationChart) {
    try {
      const canvas = await html2canvas(chartElements.allocationChart, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      
      if (yPosition + 90 > pageHeight - 25) {
        pdf.addPage();
        addPageHeader(pdf, pageWidth, portfolio.name);
        yPosition = 35;
      }
      
      // Section header
      pdf.setDrawColor(255, 152, 0);
      pdf.setLineWidth(2);
      pdf.line(20, yPosition, 60, yPosition);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 81, 135);
      pdf.text('Asset Allocation', 65, yPosition + 2);
      
      yPosition += 15;
      
      // Chart container
      pdf.setFillColor(255, 255, 255);
      pdf.rect(20, yPosition, pageWidth - 40, 75, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.rect(20, yPosition, pageWidth - 40, 75);
      
      const chartWidth = 100;
      const chartHeight = 65;
      const chartX = (pageWidth - chartWidth) / 2;
      pdf.addImage(imgData, 'PNG', chartX, yPosition + 5, chartWidth, chartHeight);
      
      yPosition += 85;
    } catch (error) {
      console.error('Error adding allocation chart to PDF:', error);
    }
  }

  // Holdings table with professional styling
  if (yPosition + 50 > pageHeight - 25) {
    pdf.addPage();
    addPageHeader(pdf, pageWidth, portfolio.name);
    yPosition = 35;
  }

  // Section header
  pdf.setDrawColor(76, 175, 80);
  pdf.setLineWidth(2);
  pdf.line(20, yPosition, 60, yPosition);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 81, 135);
  pdf.text('Portfolio Holdings', 65, yPosition + 2);
  
  yPosition += 20;

  // Enhanced table
  const tableHeaders = ['Symbol', 'Asset Name', 'Type', 'Market Value', 'Price', 'Daily Change', 'Return %'];
  const tableData = portfolio.assets.map(asset => [
    asset.symbol || 'N/A',
    asset.name || 'Unknown Asset',
    asset.type?.toUpperCase() || 'OTHER',
    `$${(asset.currentValue || 0).toLocaleString()}`,
    `$${(asset.currentPrice || 0).toFixed(2)}`,
    `${asset.change >= 0 ? '+' : ''}$${(asset.change || 0).toFixed(2)}`,
    `${asset.changePercent >= 0 ? '+' : ''}${(asset.changePercent || 0).toFixed(2)}%`
  ]);

  (pdf as any).autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    theme: 'plain',
    headStyles: {
      fillColor: [31, 81, 135],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 }
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [51, 51, 51],
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 50, halign: 'left' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 20, halign: 'right' }
    } as any,
    margin: { left: 20, right: 20 },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.5
  });

  // Asset allocation breakdown on new page
  pdf.addPage();
  addPageHeader(pdf, pageWidth, portfolio.name);
  yPosition = 45;
  
  // Section header
  pdf.setDrawColor(156, 39, 176);
  pdf.setLineWidth(2);
  pdf.line(20, yPosition, 60, yPosition);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 81, 135);
  pdf.text('Asset Class Analysis', 65, yPosition + 2);
  
  yPosition += 20;

  const assetTypes = [...new Set(portfolio.assets.map(asset => asset.type))];
  const typeSummaryData = assetTypes.map(type => {
    const typeAssets = portfolio.assets.filter(asset => asset.type === type);
    const typeValue = typeAssets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
    const typePercentage = portfolio.currentValue > 0 ? (typeValue / portfolio.currentValue * 100).toFixed(1) : '0.0';
    const avgChange = typeAssets.length > 0 
      ? (typeAssets.reduce((sum, asset) => sum + (asset.changePercent || 0), 0) / typeAssets.length).toFixed(2)
      : '0.00';
    
    return [
      type?.toUpperCase() || 'OTHER',
      typeAssets.length.toString(),
      `$${typeValue.toLocaleString()}`,
      `${typePercentage}%`,
      `${parseFloat(avgChange) >= 0 ? '+' : ''}${avgChange}%`
    ];
  });

  (pdf as any).autoTable({
    head: [['Asset Class', 'Holdings', 'Market Value', 'Weight', 'Avg Return']],
    body: typeSummaryData,
    startY: yPosition,
    theme: 'plain',
    headStyles: {
      fillColor: [31, 81, 135],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 }
    },
    bodyStyles: {
      fontSize: 11,
      textColor: [51, 51, 51],
      halign: 'center',
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 20, right: 20 },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.5
  });

  // Professional footer for all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addPageFooter(pdf, pageWidth, pageHeight, i, totalPages, portfolio.name, today);
  }

  // Generate descriptive filename
  const dateStr = new Date().toISOString().split('T')[0];
  const cleanName = portfolio.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const filename = `${cleanName}_Investment_Report_${dateStr}.pdf`;
  
  pdf.save(filename);
};

// Helper function to add consistent page headers
const addPageHeader = (pdf: any, pageWidth: number, portfolioName: string) => {
  pdf.setFillColor(31, 81, 135);
  pdf.rect(0, 0, pageWidth, 12, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Portfolio Tracker', 20, 8);
  pdf.text(portfolioName, pageWidth - 80, 8);
};

// Helper function to add consistent page footers
const addPageFooter = (pdf: any, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number, portfolioName: string, date: string) => {
  // Footer line
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  // Footer content
  pdf.setFontSize(9);
  pdf.setTextColor(119, 119, 119);
  
  // Left side
  pdf.setFont('helvetica', 'bold');
  pdf.text('Portfolio Tracker', 20, pageHeight - 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${portfolioName} Investment Report`, 20, pageHeight - 6);
  
  // Right side
  pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 40, pageHeight - 12);
  pdf.text(date, pageWidth - 40, pageHeight - 6);
  
  // Confidentiality notice on first page
  if (pageNum === 1) {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('CONFIDENTIAL - This report contains sensitive financial information', 20, pageHeight - 2);
  }
};

// Utility function to download files
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};