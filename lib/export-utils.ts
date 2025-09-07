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

// PDF Export
export const exportToPDF = async (portfolio: Portfolio, chartElements?: { [key: string]: HTMLElement }): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(44, 62, 80); // Dark blue
  pdf.text('Portfolio Report', 20, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(52, 73, 94);
  pdf.text(portfolio.name, 20, yPosition);
  
  if (portfolio.description) {
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);
    const descriptionLines = pdf.splitTextToSize(portfolio.description, pageWidth - 40);
    pdf.text(descriptionLines, 20, yPosition);
    yPosition += descriptionLines.length * 4;
  }

  // Date
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(149, 165, 166);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);

  // Portfolio Summary Box
  yPosition += 15;
  const summaryBoxHeight = 40;
  
  // Background box
  pdf.setFillColor(236, 240, 241);
  pdf.rect(20, yPosition - 5, pageWidth - 40, summaryBoxHeight, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(44, 62, 80);
  pdf.text('Portfolio Summary', 25, yPosition + 5);
  
  // Summary metrics
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const changeColor = portfolio.change >= 0 ? [39, 174, 96] : [231, 76, 60];
  const changeSymbol = portfolio.change >= 0 ? '+' : '';
  
  pdf.setTextColor(44, 62, 80);
  pdf.text('Total Value:', 25, yPosition + 15);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`$${portfolio.currentValue.toLocaleString()}`, 70, yPosition + 15);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Change:', 25, yPosition + 25);
  pdf.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${changeSymbol}$${Math.abs(portfolio.change).toLocaleString()} (${changeSymbol}${portfolio.changePercent.toFixed(2)}%)`, 70, yPosition + 25);

  yPosition += summaryBoxHeight + 15;

  // AI Summary Section
  if (portfolio.aiSummary) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text('AI Analysis', 20, yPosition);
    
    yPosition += 8;
    if (portfolio.aiHeadline) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(52, 73, 94);
      const headlineLines = pdf.splitTextToSize(portfolio.aiHeadline, pageWidth - 40);
      pdf.text(headlineLines, 20, yPosition);
      yPosition += headlineLines.length * 4 + 3;
    }
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(127, 140, 141);
    const summaryLines = pdf.splitTextToSize(portfolio.aiSummary, pageWidth - 40);
    pdf.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 3.5 + 10;
  }

  // Asset Allocation Section
  if (chartElements?.allocationChart) {
    try {
      const canvas = await html2canvas(chartElements.allocationChart);
      const imgData = canvas.toDataURL('image/png');
      
      if (yPosition + 60 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80);
      pdf.text('Asset Allocation', 20, yPosition);
      yPosition += 10;
      
      const imgWidth = 80;
      const imgHeight = 60;
      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    } catch (error) {
      console.error('Error adding allocation chart to PDF:', error);
    }
  }

  // Holdings Table
  if (yPosition + 30 > pageHeight - 20) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(44, 62, 80);
  pdf.text('Holdings Detail', 20, yPosition);
  yPosition += 10;

  // Prepare table data
  const tableHeaders = ['Symbol', 'Name', 'Type', 'Current Value', 'Current Price', 'Change', 'Change %'];
  const tableData = portfolio.assets.map(asset => [
    asset.symbol || '',
    asset.name || '',
    asset.type || '',
    `$${(asset.currentValue || 0).toLocaleString()}`,
    `$${(asset.currentPrice || 0).toFixed(2)}`,
    `${asset.change >= 0 ? '+' : ''}$${(asset.change || 0).toFixed(2)}`,
    `${asset.changePercent >= 0 ? '+' : ''}${(asset.changePercent || 0).toFixed(2)}%`
  ]);

  // Add table
  (pdf as any).autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [44, 62, 80]
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    } as any,
    margin: { left: 20, right: 20 }
  });

  // Asset Type Summary on new page
  pdf.addPage();
  yPosition = 20;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(44, 62, 80);
  pdf.text('Asset Type Breakdown', 20, yPosition);
  yPosition += 10;

  const assetTypes = [...new Set(portfolio.assets.map(asset => asset.type))];
  const typeSummaryData = assetTypes.map(type => {
    const typeAssets = portfolio.assets.filter(asset => asset.type === type);
    const typeValue = typeAssets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
    const typePercentage = portfolio.currentValue > 0 ? (typeValue / portfolio.currentValue * 100).toFixed(2) : '0.00';
    
    return [
      type,
      typeAssets.length.toString(),
      `$${typeValue.toLocaleString()}`,
      `${typePercentage}%`
    ];
  });

  (pdf as any).autoTable({
    head: [['Asset Type', 'Count', 'Total Value', 'Portfolio %']],
    body: typeSummaryData,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [44, 62, 80]
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    margin: { left: 20, right: 20 }
  });

  // Footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(149, 165, 166);
    pdf.text(
      `Page ${i} of ${totalPages} | Portfolio Tracker Report`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  pdf.save(`${portfolio.name}_portfolio_report.pdf`);
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