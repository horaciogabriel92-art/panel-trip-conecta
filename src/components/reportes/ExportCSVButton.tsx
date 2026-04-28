'use client';

import { Download } from 'lucide-react';

function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '\\"');
          if (str.includes(',') || str.includes('\n') || str.includes('"')) return `"${str}"`;
          return str;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ExportCSVButtonProps {
  data: any[];
  filename: string;
  label?: string;
}

export default function ExportCSVButton({ data, filename, label = 'Exportar CSV' }: ExportCSVButtonProps) {
  return (
    <button
      onClick={() => downloadCSV(data, filename)}
      disabled={!data || data.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}

export { downloadCSV };
