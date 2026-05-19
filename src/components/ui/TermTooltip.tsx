"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES, getPlainLabel, type GlossaryTermId } from "@/lib/glossary";

interface TermTooltipProps {
  termId: GlossaryTermId;
  children?: React.ReactNode;
  showPlainFirst?: boolean;
}

export function TermTooltip({ termId, children, showPlainFirst = true }: TermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entry = GLOSSARY_TERMS[termId];

  if (!entry) return <>{children ?? termId}</>;

  const displayText = showPlainFirst ? entry.label : entry.term;

  return (
    <>
      <span
        className="inline-flex items-center gap-0.5 cursor-help border-b border-dashed border-primary/50"
        onClick={() => setIsOpen(true)}
        title={`Tap to learn more about ${entry.label}`}
      >
        {children ?? displayText}
      </span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{entry.label}</h3>
                <span className="text-xs text-gray-500">{entry.term}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600">{entry.description}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface GlossaryButtonProps {
  className?: string;
}

export function GlossaryButton({ className = "" }: GlossaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary ${className}`}
        title="Open glossary"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold text-gray-900">Glossary</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-6">
                {Object.entries(GLOSSARY_CATEGORIES).map(([key, category]) => (
                  <div key={key}>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>{category.icon}</span>
                      {category.label}
                    </h3>
                    <div className="space-y-3">
                      {category.terms.map((termId) => {
                        const entry = GLOSSARY_TERMS[termId as GlossaryTermId];
                        return (
                          <div key={termId} className="rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{entry.label}</span>
                              <span className="text-xs text-gray-400">{entry.term}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{entry.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Replace jargon in text with glossary tooltips
 * Usage: replaceJargon("Earn XP and build reputation")
 */
export function replaceJargon(text: string): React.ReactNode[] {
  const terms = Object.keys(GLOSSARY_TERMS) as GlossaryTermId[];
  const parts: React.ReactNode[] = [];
  let remaining = text;

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = terms.sort((a, b) => b.length - a.length);

  while (remaining) {
    let earliestIndex = -1;
    let earliestTerm: GlossaryTermId | null = null;

    for (const term of sortedTerms) {
      const index = remaining.indexOf(term);
      if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
        earliestIndex = index;
        earliestTerm = term;
      }
    }

    if (earliestTerm === null || earliestIndex === -1) {
      parts.push(remaining);
      break;
    }

    if (earliestIndex > 0) {
      parts.push(remaining.slice(0, earliestIndex));
    }

    parts.push(
      <TermTooltip key={`${earliestTerm}-${earliestIndex}`} termId={earliestTerm} />
    );

    remaining = remaining.slice(earliestIndex + earliestTerm.length);
  }

  return parts;
}