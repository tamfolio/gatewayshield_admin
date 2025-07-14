import React, { useState } from "react";
import { X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ExportTicketModal = ({ handleExportModal, reportRef }) => {
  const [selectedFormat, setSelectedFormat] = useState("PDF");

  const handleExport = async () => {
    if (!reportRef?.current) return;

    const content = reportRef.current;

    if (selectedFormat === "PDF") {
      try {
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgProps = {
          width: canvas.width,
          height: canvas.height,
        };

        const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
        const pdfWidth = imgProps.width * ratio;
        const pdfHeight = imgProps.height * ratio;

        pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
        pdf.save("ticket-report.pdf");
      } catch (error) {
        console.error("PDF export failed:", error);
      }
    } else if (selectedFormat === "CSV") {
      const text = content.innerText;
      const lines = text.split("\n");
      const csvContent = lines.map(line => `"${line}"`).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ticket-report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    handleExportModal(); // close modal
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-[#101828B2] bg-opacity-50" onClick={handleExportModal} />
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl w-full max-w-sm z-10">
          <button
            onClick={handleExportModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-6 pt-8 pb-6 sm:px-8">
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
              Export Ticket
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Export As</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="PDF"
                    checked={selectedFormat === "PDF"}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">PDF</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="CSV"
                    checked={selectedFormat === "CSV"}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">CSV</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Export
              </button>
              <button
                onClick={handleExportModal}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportTicketModal;
