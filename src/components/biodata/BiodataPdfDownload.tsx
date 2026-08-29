"use client";

import { useState } from "react";

type BiodataPdfDownloadProps = {
  registrationNumber: string;
  name: string;
};

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export function BiodataPdfDownload({
  registrationNumber,
  name,
}: BiodataPdfDownloadProps) {
  const [loading, setLoading] = useState(false);

  async function downloadPdf() {
    const element = document.getElementById("biodata-sheet-print");
    if (!element) {
      alert("Biodata sheet not found.");
      return;
    }

    setLoading(true);
    try {
      await document.fonts.ready;

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffef8",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`${safeFileName(registrationNumber)}-${safeFileName(name)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Unable to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={downloadPdf}
      className="inline-flex items-center gap-2 rounded-lg border border-[#0056b3]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#0056b3] shadow-sm transition hover:bg-[#0056b3]/5 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
    >
      <svg
        aria-hidden
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {loading ? "Generating…" : "பதிவிறக்க PDF"}
    </button>
  );
}
