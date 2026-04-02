import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import type { ExportFormat, ExportScope } from '@/hooks/pitch/usePitchExport';

interface ExportSettingsProps {
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  exportScope: ExportScope;
  onScopeChange: (scope: ExportScope) => void;
  hdExport: boolean;
  onHdChange: (hd: boolean) => void;
  isExporting: boolean;
  onExport: () => void;
  onCopyLink: () => void;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({
  exportFormat,
  onFormatChange,
  exportScope,
  onScopeChange,
  hdExport,
  onHdChange,
  isExporting,
  onExport,
  onCopyLink,
}) => (
  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
    <select
      className="flex-1 min-w-[96px] sm:flex-none rounded-md bg-gray-800 border border-white/20 text-white text-xs px-2 py-1.5"
      value={exportFormat}
      onChange={(e) => onFormatChange((e.target.value as ExportFormat) || 'png')}
      title="Export format (PNG: lossless, WebP: smaller)"
    >
      <option value="png" className="bg-gray-800 text-white">PNG</option>
      <option value="webp" className="bg-gray-800 text-white">WebP</option>
    </select>
    <select
      className="flex-1 min-w-[120px] sm:flex-none rounded-md bg-gray-800 border border-white/20 text-white text-xs px-2 py-1.5"
      value={exportScope}
      onChange={(e) => onScopeChange((e.target.value as ExportScope) || 'card')}
      title="Export area"
    >
      <option value="card" className="bg-gray-800 text-white">Card only</option>
      <option value="panel" className="bg-gray-800 text-white">Card + header</option>
    </select>
    <label className="order-3 sm:order-none flex items-center gap-1 text-xs text-white font-medium" title="Higher pixel ratio for crisper export (larger file)">
      <input type="checkbox" checked={hdExport} onChange={(e) => onHdChange(e.target.checked)} /> HD
    </label>
    <Button
      variant="outline"
      className="order-4 sm:order-none border-white/20 text-white hover:bg-white/10 px-3"
      onClick={onExport}
      disabled={isExporting}
      title="Save card"
    >
      <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
    </Button>
    <Button
      variant="outline"
      className="order-5 sm:order-none border-white/20 text-white hover:bg-white/10 text-xs px-3"
      onClick={onCopyLink}
      title="Copy link with current setup"
    >
      Copy Link
    </Button>
  </div>
);
