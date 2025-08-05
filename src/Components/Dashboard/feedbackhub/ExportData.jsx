import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiDownloadCloud } from 'react-icons/fi';
import { ChevronDown } from 'lucide-react';

// Export utility functions
export const exportDashboardAsImage = async (format = 'png', containerId = 'dashboard-export-container') => {
  const dashboardElement = document.getElementById(containerId);
  
  if (!dashboardElement) {
    alert('Dashboard not found for export');
    return;
  }

  try {
    // Show loading state
    const exportButtons = document.querySelectorAll('.export-button');
    exportButtons.forEach(button => {
      button.disabled = true;
      button.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Exporting...
        </div>
      `;
    });

    // Scroll to top and wait for any animations to complete
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the actual dashboard content (excluding table)
    const dashboardContent = dashboardElement.querySelector('.dashboard-main-content');
    const elementToCapture = dashboardContent || dashboardElement;
    
    // Temporarily hide any scrollbars and ensure full visibility
    const originalOverflow = document.body.style.overflow;
    const originalElementOverflow = elementToCapture.style.overflow;
    document.body.style.overflow = 'visible';
    elementToCapture.style.overflow = 'visible';

    const canvas = await html2canvas(elementToCapture, {
      useCORS: true,
      scale: 1.5, // Slightly reduced for better performance
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      width: elementToCapture.offsetWidth,
      height: elementToCapture.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: elementToCapture.offsetWidth,
      windowHeight: elementToCapture.offsetHeight,
      x: 0,
      y: 0,
      onclone: (clonedDoc) => {
        // Ensure proper styling in cloned document
        const clonedElement = clonedDoc.querySelector('.dashboard-main-content') || clonedDoc.getElementById(containerId);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.position = 'static';
          clonedElement.style.width = 'auto';
          clonedElement.style.height = 'auto';
          
          // Hide any table elements in the clone
          const tables = clonedElement.querySelectorAll('.case-review-table, table');
          tables.forEach(table => {
            table.style.display = 'none';
          });
          
          // Ensure charts are visible
          const charts = clonedElement.querySelectorAll('canvas');
          charts.forEach(chart => {
            chart.style.display = 'block';
            chart.style.visibility = 'visible';
          });
        }
      }
    });

    // Restore original overflow styles
    document.body.style.overflow = originalOverflow;
    elementToCapture.style.overflow = originalElementOverflow;

    if (format === 'pdf') {
      // Export as PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      // Export as image (PNG/JPEG)
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpeg' ? 0.95 : undefined;
      
      const link = document.createElement('a');
      link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.${format}`;
      link.href = canvas.toDataURL(mimeType, quality);
      link.click();
    }

    // Show success message
    showNotification('Export completed successfully!', 'success');

  } catch (error) {
    console.error('Export failed:', error);
    showNotification('Export failed. Please try again.', 'error');
  } finally {
    // Reset button state
    resetExportButtons();
  }
};

// Utility function to show notifications
const showNotification = (message, type = 'info') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-100 border border-green-200 text-green-800' 
      : 'bg-red-100 border border-red-200 text-red-800'
  }`;
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
};

// Reset export button states
const resetExportButtons = () => {
  const exportButtons = document.querySelectorAll('.export-button');
  exportButtons.forEach(button => {
    button.disabled = false;
    button.innerHTML = `
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
      </svg>
      Export
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    `;
  });
};

// Button component for export functionality
const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, ...props }) => {
  const baseClasses = "font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:hover:bg-white"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Main Export Component
const ExportData = ({ containerId = 'dashboard-export-container' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format) => {
    setIsOpen(false);
    await exportDashboardAsImage(format, containerId);
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="export-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiDownloadCloud className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-md flex items-center gap-2"
              onClick={() => handleExport('png')}
            >
              <span className="text-lg">📸</span>
              Export as PNG
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={() => handleExport('jpeg')}
            >
              <span className="text-lg">🖼️</span>
              Export as JPEG
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 last:rounded-b-md flex items-center gap-2"
              onClick={() => handleExport('pdf')}
            >
              <span className="text-lg">📄</span>
              Export as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportData;