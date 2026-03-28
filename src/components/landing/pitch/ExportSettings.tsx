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
  <div className="flex items-center gap-2">
    <select
      className="rounded-md bg-white/5 border border-white/10 text-white text-[11px] px-2 py-1"
      value={exportFormat}
      onChange={(e) => onFormatChange((e.target.value as ExportFormat) || 'png')}
      title="Export format (PNG: lossless, WebP: smaller)"
    >
      <option value="png">PNG</option>
      <option value="webp">WebP</option>
    </select>
    <select
      className="rounded-md bg-white/5 border border-white/10 text-white text-[11px] px-2 py-1"
      value={exportScope}
      onChange={(e) => onScopeChange((e.target.value as ExportScope) || 'card')}
      title="Export area"
    >
      <option value="card">Card only</option>
      <option value="panel">Card + header</option>
    </select>
    <label className="flex items-center gap-1 text-[11px] text-white/80" title="Higher pixel ratio for crisper export (larger file)">
      <input type="checkbox" checked={hdExport} onChange={(e) => onHdChange(e.target.checked)} /> HD
    </label>
    <Button
      variant="outline"
      className="border-white/10 text-white hover:bg-white/5"
      onClick={onExport}
      disabled={isExporting}
      title="Save card"
    >
      <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
    </Button>
    <Button
      variant="outline"
      className="border-white/10 text-white hover:bg-white/5 text-[11px]"
      onClick={onCopyLink}
      title="Copy link with current setup"
    >
      Copy Link
    </Button>
  </div>
);
