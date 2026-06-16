"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  FileSpreadsheet,
  Clipboard,
  Sparkles,
  CheckCircle2,
  Share2,
  ArrowRight,
  Download,
  Calendar,
  Trophy,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useWallet } from '@/contexts/WalletContext';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type ColumnMappingField = 'name' | 'position' | 'goals' | 'assists' | 'matchesPlayed' | 'date' | 'opponent' | 'goalsFor' | 'goalsAgainst' | 'competition' | 'venue' | 'skip';

interface ColumnMapping {
  field: ColumnMappingField;
  label: string;
}

interface ImportedPlayer {
  name: string;
  position?: string;
  goals: number;
  assists: number;
  matchesPlayed: number;
}

interface ImportResult {
  squadId: string;
  squadName: string;
  players: ImportedPlayer[];
  captainInviteUrl: string;
  playerInviteUrls: Array<{ name: string; url: string }>;
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'confirm' | 'complete';

const FIELD_LABELS: Record<string, string> = {
  name: 'Player Name',
  position: 'Position',
  goals: 'Goals',
  assists: 'Assists',
  matchesPlayed: 'Matches Played',
  date: 'Match Date',
  opponent: 'Opponent',
  goalsFor: 'Goals For',
  goalsAgainst: 'Goals Against',
  competition: 'Competition',
  venue: 'Venue (H/A)',
  skip: 'Skip column',
};

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

interface SquadImportWizardProps {
  onComplete?: (result: ImportResult) => void;
  onClose?: () => void;
}

export default function SquadImportWizard({ onComplete, onClose }: SquadImportWizardProps) {
  const { address, isGuest } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const matchFileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<WizardStep>('upload');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [squadName, setSquadName] = useState('');
  const [squadError, setSquadError] = useState<string | null>(null);

  // Parsed state
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Match history import state
  const [showMatchImport, setShowMatchImport] = useState(false);
  const [matchRawText, setMatchRawText] = useState('');
  const [matchFileName, setMatchFileName] = useState<string | null>(null);
  const [matchHeaders, setMatchHeaders] = useState<string[]>([]);
  const [matchPreviewRows, setMatchPreviewRows] = useState<string[][]>([]);
  const [matchTotalRows, setMatchTotalRows] = useState(0);
  const [matchMapping, setMatchMapping] = useState<ColumnMapping[]>([]);
  const [matchStep, setMatchStep] = useState<'upload' | 'mapping' | 'confirm' | 'done'>('upload');
  const [matchResult, setMatchResult] = useState<{ matches: Array<{ date: string; opponent: string; goalsFor: number; goalsAgainst: number }>; momentsCreated: number } | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchImporting, setMatchImporting] = useState(false);

  // Parse raw text client-side for preview
  const parsePreview = useCallback((text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return;

    const delimiter = detectDelimiter(lines[0]);
    const parsed = lines.map(line => parseLine(line, delimiter));
    const hdrs = parsed[0];
    const rows = parsed.slice(1);

    // Auto-detect mapping (player context)
    const autoMap = detectPlayerColumns(hdrs);

    // Verify a name column exists
    if (!autoMap.some(m => m.field === 'name')) {
      setSquadError('Could not detect a player name column. First row should have "Name" or "Player".');
      return;
    }

    setSquadError(null);
    setHeaders(hdrs);
    setPreviewRows(rows.slice(0, 5));
    setTotalRows(rows.length);
    setMapping(autoMap);
    setStep('mapping');
  }, []);

  // Parse match-history data client-side
  const parseMatchPreview = useCallback((text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      setMatchError('No data found. Add at least a header row and one match.');
      return;
    }

    const delimiter = detectDelimiter(lines[0]);
    const parsed = lines.map(line => parseLine(line, delimiter));
    const hdrs = parsed[0];
    const rows = parsed.slice(1);

    const autoMap = detectMatchColumns(hdrs);

    const hasDate = autoMap.some(m => m.field === 'date');
    const hasOpponent = autoMap.some(m => m.field === 'opponent');

    if (!hasDate) {
      setMatchError('Could not detect a date column. Expected header like "Date" or "Match Date".');
      return;
    }
    if (!hasOpponent) {
      setMatchError('Could not detect an opponent column. Expected header like "Opponent" or "Vs".');
      return;
    }

    setMatchError(null);
    setMatchHeaders(hdrs);
    setMatchPreviewRows(rows.slice(0, 5));
    setMatchTotalRows(rows.length);
    setMatchMapping(autoMap);
    setMatchStep('mapping');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawText(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  }, [parsePreview]);

  const handleMatchFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMatchFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setMatchRawText(text);
      parseMatchPreview(text);
    };
    reader.readAsText(file);
  }, [parseMatchPreview]);

  const handlePasteSubmit = useCallback(() => {
    if (!rawText.trim()) return;
    setFileName(null);
    parsePreview(rawText);
  }, [rawText, parsePreview]);

  const handleMatchPasteSubmit = useCallback(() => {
    if (!matchRawText.trim()) return;
    setMatchFileName(null);
    parseMatchPreview(matchRawText);
  }, [matchRawText, parseMatchPreview]);

  const handleMappingChange = useCallback((index: number, field: ColumnMappingField) => {
    setMapping(prev => {
      const next = [...prev];
      next[index] = { ...next[index], field };
      return next;
    });
  }, []);

  const handleMatchMappingChange = useCallback((index: number, field: ColumnMappingField) => {
    setMatchMapping(prev => {
      const next = [...prev];
      next[index] = { ...next[index], field };
      return next;
    });
  }, []);

  const handleCommit = useCallback(async () => {
    if (!address || !squadName.trim()) {
      setCommitError('Please sign in to import your squad.');
      return;
    }

    setIsCommitting(true);
    setCommitError(null);

    try {
      const response = await fetch('/api/import/squad', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          raw: rawText,
          mapping,
          squadName: squadName.trim(),
          captainWalletAddress: address,
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(err.error || `Server error (${response.status})`);
      }

      const data: ImportResult = await response.json();
      setResult(data);
      setStep('complete');

      setTimeout(() => {
        onComplete?.(data);
      }, 0);
    } catch (err) {
      setCommitError(err instanceof Error ? err.message : 'Import failed. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  }, [rawText, mapping, squadName, address, onComplete]);

  const handleMatchCommit = useCallback(async () => {
    if (!result?.squadId) return;

    setMatchImporting(true);
    setMatchError(null);

    try {
      const response = await fetch(`/api/import/matches/${result.squadId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          raw: matchRawText,
          mapping: matchMapping,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Match import failed' }));
        throw new Error(err.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      setMatchResult(data);
      setMatchStep('done');
      setMatchHistoryImported(true);
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : 'Match import failed. Please try again.');
    } finally {
      setMatchImporting(false);
    }
  }, [matchRawText, matchMapping, result]);

  const handleCopyInvite = useCallback(async (url: string, index: number) => {
    await navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (!result) return;
    const text = result.playerInviteUrls
      .map(p => `${p.name}: ${p.url}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [result]);

  const handleDownloadCsv = useCallback(() => {
    if (!result) return;
    const lines = result.playerInviteUrls.map(p => `"${p.name}","${p.url}"`);
    const csv = `"Player Name","Invite Link"\n${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `squad-invites-${result.squadId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const resetMatchImport = useCallback(() => {
    setShowMatchImport(false);
    setMatchRawText('');
    setMatchFileName(null);
    setMatchHeaders([]);
    setMatchPreviewRows([]);
    setMatchTotalRows(0);
    setMatchMapping([]);
    setMatchStep('upload');
    setMatchResult(null);
    setMatchError(null);
  }, []);

  // Track whether match history was imported to prevent duplicate imports
  const [matchHistoryImported, setMatchHistoryImported] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white overflow-hidden relative shadow-2xl max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {step !== 'complete' && (
              <>
                {step === 'upload' && 'Step 1 of 4 — Upload'}
                {step === 'mapping' && 'Step 2 of 4 — Map Columns'}
                {step === 'preview' && 'Step 3 of 4 — Review'}
                {step === 'confirm' && 'Step 4 of 4 — Confirm'}
              </>
            )}
            {step === 'complete' && !showMatchImport && 'Import Complete'}
            {step === 'complete' && showMatchImport && (
              <>
                {matchStep === 'upload' && 'Match History — Step 1 of 3'}
                {matchStep === 'mapping' && 'Match History — Step 2 of 3'}
                {matchStep === 'confirm' && 'Match History — Step 3 of 3'}
                {matchStep === 'done' && 'Match History Imported'}
              </>
            )}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {step === 'complete' && !showMatchImport && '100%'}
            {step === 'complete' && showMatchImport && matchStep === 'done' && 'Done'}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
            style={{
              width: step === 'complete' ? '100%' : `${step === 'upload' ? 25 : step === 'mapping' ? 50 : step === 'preview' ? 75 : 90}%`,
            }}
          />
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-3 h-3" />
                Import Your Squad
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                Upload Your Roster
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Upload a CSV file or paste in data from your spreadsheet. We&apos;ll
                detect player names, positions, and stats.
              </p>

              {/* File upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] px-6 py-8 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Upload className="h-8 w-8 text-gray-500" />
                <div className="text-center">
                  <p className="text-sm font-bold text-white">
                    {fileName || 'Click to upload CSV'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    .csv, .tsv, or paste data below
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Divider */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  or paste
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Paste area */}
              <div className="mb-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Name\tPosition\tGoals\tAssists\nJohn Smith\tST\t12\t5\nAlex Brown\tMF\t3\t8\n...`}
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-mono text-gray-300 placeholder-gray-700 outline-none transition focus:border-emerald-500/60 resize-none"
                />
              </div>

              {squadError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                  {squadError}
                </div>
              )}

              <button
                onClick={handlePasteSubmit}
                disabled={!rawText.trim()}
                className="w-full py-3.5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clipboard className="w-4 h-4" />
                Parse Data
                <ChevronRight className="w-4 h-4" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-2"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Column Mapping ── */}
          {step === 'mapping' && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Column Mapping
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                Map Your Columns
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                We auto-detected how your columns map to player fields. Adjust
                if needed.
              </p>

              <div className="mb-6 space-y-3">
                {headers.map((header, i) => {
                  const currentField = mapping[i]?.field ?? 'skip';
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-300">
                          Column: <span className="text-white">{header}</span>
                        </span>
                        {currentField === 'name' && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                            Required
                          </span>
                        )}
                      </div>
                      <select
                        value={currentField}
                        onChange={(e) => handleMappingChange(i, e.target.value as ColumnMappingField)}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white outline-none transition focus:border-emerald-500/60"
                      >
                        <option value="skip" className="bg-gray-900 text-gray-400">Skip column</option>
                        <option value="name" className="bg-gray-900 text-white">Player Name</option>
                        <option value="position" className="bg-gray-900 text-white">Position</option>
                        <option value="goals" className="bg-gray-900 text-white">Goals</option>
                        <option value="assists" className="bg-gray-900 text-white">Assists</option>
                        <option value="matchesPlayed" className="bg-gray-900 text-white">Matches Played</option>
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Preview of mapped data */}
              <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
                <div className="bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Preview ({Math.min(previewRows.length, 5)} of {totalRows} rows)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        {headers.map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {h}
                            {mapping[i]?.field !== 'skip' && (
                              <span className="ml-1 text-emerald-400">→{FIELD_LABELS[mapping[i].field]?.slice(0, 6) || ''}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, ri) => (
                        <tr key={ri} className="border-b border-white/5">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!mapping.some(m => m.field === 'name')}
                  className="flex-1 py-3.5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Preview & Name Squad ── */}
          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Review Your Squad
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                Name Your Squad
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Give your squad a name and review the players before importing.
              </p>

              <div className="mb-4">
                <label htmlFor="squad-name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                  Squad Name
                </label>
                <input
                  id="squad-name"
                  type="text"
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  placeholder="e.g. Sunday FC, North London"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {/* Player list */}
              <div className="mb-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {totalRows} Players detected
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {mapping.filter(m => m.field !== 'skip').length} columns mapped
                  </span>
                </div>
                <div className="max-h-48 space-y-1 overflow-y-auto p-2">
                  {previewRows.map((row, i) => {
                    const nameIdx = mapping.findIndex(m => m.field === 'name');
                    const posIdx = mapping.findIndex(m => m.field === 'position');
                    const name = nameIdx >= 0 ? row[nameIdx] : `Player ${i + 1}`;
                    const pos = posIdx >= 0 ? row[posIdx] : null;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[9px] font-black text-gray-400">
                          {(name.slice(0, 2) || 'SW').toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white truncate flex-1">{name}</span>
                        {pos && (
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-gray-300">{pos}</span>
                        )}
                        {i >= 4 && i === previewRows.length - 1 && totalRows > 5 && (
                          <span className="text-[10px] text-gray-600">
                            +{totalRows - 5} more
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {commitError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                  {commitError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('mapping')}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!squadName.trim()}
                  className="flex-1 py-3.5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Almost There
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                Confirm Import
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                This will create your squad, register all players, and generate
                invite links for each player to claim their spot.
              </p>

              <div className="mb-6 space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Squad</span>
                  <span className="font-bold text-white">{squadName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Players</span>
                  <span className="font-bold text-white">{totalRows}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">You (Captain)</span>
                  <span className="font-bold text-emerald-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Invite links</span>
                  <span className="font-bold text-white">{totalRows} generated</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Stats imported</span>
                  <span className="font-bold text-white">
                    {mapping.filter(m => m.field === 'goals' || m.field === 'assists' || m.field === 'matchesPlayed').length} columns
                  </span>
                </div>
              </div>

              {commitError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                  {commitError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('preview')}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                {!address || isGuest ? (
                  <div className="flex-1 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-200 text-center">
                    Sign in to import your squad
                  </div>
                ) : (
                  <button
                    onClick={handleCommit}
                    disabled={isCommitting}
                    className="flex-1 py-3.5 bg-green-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                  >
                    {isCommitting ? 'Importing...' : 'Import Squad'}
                    {!isCommitting && <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Complete (Squad Created + optional Match History) ── */}
          {step === 'complete' && result && !showMatchImport && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                  Squad Created!
                </h2>
                <p className="text-sm text-gray-400">
                  {result.squadName} is ready with {result.players.length} players.
                </p>
              </div>

              {/* Match History CTA */}
              {/* Match History CTA */}
              <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                    <Trophy className="h-4 w-4 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1">
                      Import match history
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      {matchHistoryImported
                        ? 'Match history has already been imported for this squad.'
                        : 'Add historical match results as moments — they\'ll appear in your squad\'s gallery as retroactive entries.'
                      }
                    </p>
                    {!matchHistoryImported && (
                      <button
                        onClick={() => setShowMatchImport(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Add match history
                      </button>
                    )}
                    {matchHistoryImported && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Invite links */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Player Invite Links
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAll}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-gray-300 hover:bg-white/15 transition-colors"
                    >
                      {copiedIndex === -1 ? (
                        <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                      ) : (
                        <><Clipboard className="w-3 h-3" /> Copy all</>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadCsv}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-gray-300 hover:bg-white/15 transition-colors"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                  </div>
                </div>
                <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-white/10 p-2">
                  {result.playerInviteUrls.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[8px] font-black text-gray-400">
                        {(p.name.slice(0, 2) || 'SW').toUpperCase()}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-white">
                        {p.name}
                      </span>
                      <button
                        onClick={() => handleCopyInvite(p.url, i)}
                        className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-emerald-400 hover:bg-white/15 transition-colors"
                      >
                        {copiedIndex === i ? (
                          <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clipboard className="w-2.5 h-2.5" /> Copy</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/squads/${result.squadId}`;
                  }}
                  className="w-full py-3.5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                >
                  Go to Squad Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                    <Share2 className="w-3 h-3" />
                    Share to Group Chat
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `I just created ${result.squadName} on SportWarren! Join the squad and claim your spot.\n`;
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(text)}`,
                          '_blank',
                        );
                      }}
                      className="flex-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        const text = `I just created ${result.squadName} on SportWarren! Join the squad and claim your spot.`;
                        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(result.captainInviteUrl)}&text=${encodeURIComponent(text)}`;
                        window.open(telegramUrl, '_blank');
                      }}
                      className="flex-1 rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition-colors"
                    >
                      Telegram
                    </button>
                  </div>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-2"
                >
                  Close
                </button>
              )}
            </motion.div>
          )}

          {/* ── Match History: Squad Complete + Show Match Import ── */}
          {step === 'complete' && showMatchImport && (
            <motion.div
              key="match-import"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              {/* Match Upload Step */}
              {matchStep === 'upload' && (
                <div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Trophy className="w-3 h-3" />
                    Import Match History
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                    Upload Match Results
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Upload a CSV with your squad&apos;s historical match results. Each row
                    becomes a moment in your squad gallery.
                  </p>

                  <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                    <p className="text-xs text-indigo-200">
                      <span className="font-bold">Expected columns:</span> Date, Opponent, Goals For
                      (your score), Goals Against. Optional: Competition, Venue (Home/Away).
                    </p>
                  </div>

                  {/* File upload */}
                  <div
                    onClick={() => matchFileInputRef.current?.click()}
                    className="mb-4 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] px-6 py-8 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        matchFileInputRef.current?.click();
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 text-gray-500" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">
                        {matchFileName || 'Click to upload CSV'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        .csv, .tsv, or paste data below
                      </p>
                    </div>
                  </div>
                  <input
                    ref={matchFileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={handleMatchFileUpload}
                  />

                  {/* Divider */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                      or paste
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {/* Paste area */}
                  <div className="mb-4">
                    <textarea
                      value={matchRawText}
                      onChange={(e) => setMatchRawText(e.target.value)}
                      placeholder={`Date\tOpponent\tGoals For\tGoals Against\tCompetition\tVenue\n2024-03-15\tNorth London FC\t4\t2\tPre-season\tHome\n2024-03-22\tCity Rangers\t1\t3\tLeague\tAway\n...`}
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-mono text-gray-300 placeholder-gray-700 outline-none transition focus:border-indigo-500/60 resize-none"
                    />
                  </div>

                  {matchError && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                      {matchError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMatchImport(false)}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Squad
                    </button>
                    <button
                      onClick={handleMatchPasteSubmit}
                      disabled={!matchRawText.trim()}
                      className="flex-1 py-3.5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Clipboard className="w-4 h-4" />
                      Parse Data
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Match Mapping */}
              {matchStep === 'mapping' && (
                <div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Trophy className="w-3 h-3" />
                    Map Match Columns
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                    Map Your Columns
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    We auto-detected how your columns map to match fields. Adjust if needed.
                  </p>

                  <div className="mb-6 space-y-3">
                    {matchHeaders.map((header, i) => {
                      const currentField = matchMapping[i]?.field ?? 'skip';
                      const isRequired = currentField === 'date' || currentField === 'opponent';
                      return (
                        <div
                          key={i}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-300">
                              Column: <span className="text-white">{header}</span>
                            </span>
                            {isRequired && (
                              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold text-indigo-300">
                                Required
                              </span>
                            )}
                          </div>
                          <select
                            value={currentField}
                            onChange={(e) => handleMatchMappingChange(i, e.target.value as ColumnMappingField)}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white outline-none transition focus:border-indigo-500/60"
                          >
                            <option value="skip" className="bg-gray-900 text-gray-400">Skip column</option>
                            <option value="date" className="bg-gray-900 text-white">Match Date</option>
                            <option value="opponent" className="bg-gray-900 text-white">Opponent</option>
                            <option value="goalsFor" className="bg-gray-900 text-white">Goals For</option>
                            <option value="goalsAgainst" className="bg-gray-900 text-white">Goals Against</option>
                            <option value="competition" className="bg-gray-900 text-white">Competition</option>
                            <option value="venue" className="bg-gray-900 text-white">Venue (H/A)</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  {/* Preview */}
                  <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
                    <div className="bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Preview ({Math.min(matchPreviewRows.length, 5)} of {matchTotalRows} matches)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            {matchHeaders.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {h}
                                {matchMapping[i]?.field !== 'skip' && (
                                  <span className="ml-1 text-indigo-400">→{FIELD_LABELS[matchMapping[i].field]?.slice(0, 6) || ''}</span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matchPreviewRows.map((row, ri) => (
                            <tr key={ri} className="border-b border-white/5">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setMatchStep('upload'); setMatchError(null); }}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => setMatchStep('confirm')}
                      disabled={!matchMapping.some(m => m.field === 'date') || !matchMapping.some(m => m.field === 'opponent')}
                      className="flex-1 py-3.5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Match Confirm */}
              {matchStep === 'confirm' && (
                <div>
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Confirm Match Import
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                    Import {matchTotalRows} Matches?
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Each match will create a moment in your squad gallery. This cannot be
                    undone in bulk.
                  </p>

                  <div className="mb-6 space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Squad</span>
                      <span className="font-bold text-white">{result?.squadName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Matches</span>
                      <span className="font-bold text-white">{matchTotalRows}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Moments to create</span>
                      <span className="font-bold text-indigo-300">{matchTotalRows}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Columns mapped</span>
                      <span className="font-bold text-white">
                        {matchMapping.filter(m => m.field !== 'skip').length}
                      </span>
                    </div>
                  </div>

                  {matchError && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                      {matchError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setMatchStep('mapping'); setMatchError(null); }}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleMatchCommit}
                      disabled={matchImporting}
                      className="flex-1 py-3.5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                      {matchImporting ? 'Importing...' : 'Import Matches'}
                      {!matchImporting && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Match Done */}
              {matchStep === 'done' && matchResult && (
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20"
                  >
                    <Trophy className="h-8 w-8 text-indigo-400" />
                  </motion.div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                    Match History Added!
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    {matchResult.momentsCreated} match{matchResult.momentsCreated !== 1 ? 'es' : ''} imported as moments for {result?.squadName}.
                  </p>

                  {/* Quick recap */}
                  <div className="mb-6 w-full max-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-white/10 p-2">
                    {matchResult.matches.slice(0, 10).map((m, i) => {
                      const goalDiff = m.goalsFor - m.goalsAgainst;
                      const resultLabel = goalDiff > 0 ? 'W' : goalDiff < 0 ? 'L' : 'D';
                      return (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            resultLabel === 'W' ? 'bg-emerald-500/20 text-emerald-300' :
                            resultLabel === 'L' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {resultLabel}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {m.goalsFor}-{m.goalsAgainst}
                          </span>
                          <span className="text-xs text-gray-400">vs</span>
                          <span className="text-xs text-gray-300 truncate">{m.opponent}</span>
                        </div>
                      );
                    })}
                    {matchResult.matches.length > 10 && (
                      <p className="text-[10px] text-gray-600 text-center py-1">
                        +{matchResult.matches.length - 10} more
                      </p>
                    )}
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={resetMatchImport}
                      className="w-full py-3.5 bg-indigo-500/20 text-indigo-300 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-500/30 transition-colors"
                    >
                      Back to Squad
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Utilities (client-side parsing — mirrors server logic for instant preview)
// ────────────────────────────────────────────────────────────────────────────

function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount && semiCount > tabCount) return ';';
  return ',';
}

function parseLine(line: string, delimiter: string): string[] {
  const row: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === delimiter && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  return row;
}

// Player column detection
const PLAYER_PATTERNS: Array<{ patterns: RegExp[]; field: ColumnMappingField }> = [
  { patterns: [/^name$/i, /^player$/i, /^full\s*name$/i, /^player\s*name$/i], field: 'name' },
  { patterns: [/^pos/i, /^position$/i, /^role$/i], field: 'position' },
  { patterns: [/^goals?$/i, /^g$/i], field: 'goals' },
  { patterns: [/^assists?$/i, /^a$/i], field: 'assists' },
  { patterns: [/^matches$/i, /^apps$/i, /^games$/i, /^appearances$/i, /^played$/i, /^match(es)?\s*played$/i], field: 'matchesPlayed' },
];

// Match column detection
const MATCH_PATTERNS: Array<{ patterns: RegExp[]; field: ColumnMappingField }> = [
  { patterns: [/^date$/i, /^match\s*date$/i, /^datum$/i], field: 'date' },
  { patterns: [/^opponent$/i, /^vs\.?$/i, /^versus$/i, /^against$/i, /^adversaire$/i], field: 'opponent' },
  { patterns: [/^goals?\s*for$/i, /^goals?\s*scored$/i, /^gf$/i, /^scored$/i, /^for$/i, /^our\s*goals?$/i], field: 'goalsFor' },
  { patterns: [/^goals?\s*against$/i, /^goals?\s*conceded$/i, /^ga$/i, /^conceded$/i, /^against$/i, /^their\s*goals?$/i], field: 'goalsAgainst' },
  { patterns: [/^competition$/i, /^comp$/i, /^tournament$/i, /^cup$/i, /^league$/i], field: 'competition' },
  { patterns: [/^venue$/i, /^home\s*\/?\s*away$/i, /^h\/?a$/i, /^location$/i], field: 'venue' },
];

function detectPlayerColumns(headers: string[]): ColumnMapping[] {
  return headers.map(header => {
    const trimmed = header.trim();
    for (const p of PLAYER_PATTERNS) {
      if (p.patterns.some(re => re.test(trimmed))) {
        return { field: p.field, label: FIELD_LABELS[p.field] || trimmed };
      }
    }
    return { field: 'skip', label: trimmed };
  });
}

function detectMatchColumns(headers: string[]): ColumnMapping[] {
  return headers.map(header => {
    const trimmed = header.trim();
    for (const p of MATCH_PATTERNS) {
      if (p.patterns.some(re => re.test(trimmed))) {
        return { field: p.field, label: FIELD_LABELS[p.field] || trimmed };
      }
    }
    return { field: 'skip', label: trimmed };
  });
}
