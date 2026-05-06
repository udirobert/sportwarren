import React from 'react';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';
import type { MatchSimulationSnapshot } from '@/lib/match/matchSimulation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { trackDigitalTwin3DInteraction } from '@/lib/digital-twin/analytics';
import { Scene } from './Scene';
import { BroadcastHud } from './BroadcastHud';
import { useMatchBroadcastViewModel, type MatchBroadcastTwinData } from './useMatchBroadcastViewModel';
import { MatchBroadcast3DPlaceholder, MatchBroadcastPlaceholderDetails } from './MatchBroadcast3DPlaceholder';

export interface MatchBroadcast3DViewProps {
  squadId?: string;
  access: DigitalTwin3DAccessResult;
  snapshot?: MatchSimulationSnapshot | null;
  twin?: MatchBroadcastTwinData | null;
}

export const MatchBroadcast3DView: React.FC<MatchBroadcast3DViewProps> = ({ squadId, access, snapshot, twin }) => {
  const viewModel = useMatchBroadcastViewModel({ squadId, access, snapshot, twin });
  const openTimestampRef = React.useRef<number>(Date.now());
  const [selectedFeedback, setSelectedFeedback] = React.useState<'useful' | 'unclear' | 'exciting' | 'bug' | null>(null);
  const [feedbackNote, setFeedbackNote] = React.useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  React.useEffect(() => {
    openTimestampRef.current = Date.now();
  }, [squadId]);

  React.useEffect(() => {
    trackDigitalTwin3DInteraction({
      action: 'broadcast_state_viewed',
      squadId,
      access,
      source: 'broadcast_page',
      highlightTone: viewModel.highlightTone,
      phaseLabel: viewModel.phaseLabel,
    });
  }, [access, squadId, viewModel.highlightTone, viewModel.phaseLabel]);

  const handleFeedbackStart = React.useCallback((category: 'useful' | 'unclear' | 'exciting' | 'bug') => {
    setSelectedFeedback(category);
    setFeedbackSubmitted(false);
    trackDigitalTwin3DInteraction({
      action: 'feedback_started',
      squadId,
      access,
      source: 'broadcast_page',
      highlightTone: viewModel.highlightTone,
      phaseLabel: viewModel.phaseLabel,
      feedbackCategory: category,
      dwellMs: Date.now() - openTimestampRef.current,
    });
  }, [access, squadId, viewModel.highlightTone, viewModel.phaseLabel]);

  const handleFeedbackSubmit = React.useCallback(() => {
    if (!selectedFeedback) {
      return;
    }

    trackDigitalTwin3DInteraction({
      action: 'feedback_submitted',
      squadId,
      access,
      source: 'broadcast_page',
      highlightTone: viewModel.highlightTone,
      phaseLabel: viewModel.phaseLabel,
      feedbackCategory: selectedFeedback,
      feedbackValue: feedbackNote.trim() || undefined,
      dwellMs: Date.now() - openTimestampRef.current,
    });

    setFeedbackSubmitted(true);
    setFeedbackNote('');
  }, [access, feedbackNote, selectedFeedback, squadId, viewModel.highlightTone, viewModel.phaseLabel]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <MatchBroadcast3DPlaceholder squadId={squadId} access={access} viewModel={viewModel} />

      <div className="max-w-6xl mx-auto px-4 pb-8 md:px-6 md:pb-10">
        <Card className="overflow-hidden border-cyan-500/20 bg-slate-900/70 backdrop-blur-sm">
          <div className="relative">
            <Scene viewModel={viewModel} />
            <BroadcastHud viewModel={viewModel} />
          </div>

          <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-5 md:p-5 bg-black/20">
            {viewModel.keyMetrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>
                <div className="mt-1 text-sm font-semibold text-white truncate">{metric.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <MatchBroadcastPlaceholderDetails />
          </div>

          <Card className="border-white/10 bg-white/[0.03] h-fit">
            <div className="p-5 md:p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Beta feedback</div>
              <h3 className="mt-2 text-xl font-black tracking-tight text-white">Tell us what this beta surface is doing well</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                This response is captured with rollout and match context so the first beta sessions can shape what the real renderer needs to earn.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {([
                  ['useful', 'Useful'],
                  ['exciting', 'Exciting'],
                  ['unclear', 'Unclear'],
                  ['bug', 'Buggy'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleFeedbackStart(key)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${selectedFeedback === key ? 'border-cyan-400 bg-cyan-400/10 text-white' : 'border-white/10 bg-black/20 text-slate-300 hover:border-cyan-400/40 hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Beta note</span>
                <textarea
                  value={feedbackNote}
                  onChange={(event) => setFeedbackNote(event.target.value)}
                  placeholder="What felt clear, confusing, or promising in this broadcast beta?"
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/50"
                />
              </label>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Context included: {access.state}, {viewModel.phaseLabel}, {viewModel.highlightLabel}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFeedbackSubmit}
                  disabled={!selectedFeedback}
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus:ring-cyan-400"
                >
                  Submit feedback
                </Button>
              </div>

              {feedbackSubmitted && (
                <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                  Feedback captured for this beta session.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
