/**
 * Broadcast client — handles "mark sent" toggles + clipboard copy
 * for players without phone numbers. Tap-to-send opens WhatsApp.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { PALETTE } from '../../../../preview/_components/MiniAvatar';

interface PlayerMessage {
  profileId: string;
  name: string;
  goals: number;
  phone: string | null;
  message: string;
}

interface BroadcastClientProps {
  sessionId: string;
  squadName: string;
  totalGoals: number;
  dateLabel: string;
  groupMessage: string;
  playerMessages: PlayerMessage[];
}

export function BroadcastClient({
  sessionId,
  squadName,
  totalGoals,
  dateLabel,
  groupMessage,
  playerMessages,
}: BroadcastClientProps) {
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [groupSent, setGroupSent] = useState(false);
  const storageKey = `bcast-${sessionId}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { players: string[]; group?: boolean };
        setSent(new Set(parsed.players));
        setGroupSent(Boolean(parsed.group));
      }
    } catch {
      /* noop */
    }
  }, [storageKey]);

  const persist = (next: Set<string>, nextGroup: boolean) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ players: Array.from(next), group: nextGroup }),
      );
    } catch {
      /* noop */
    }
  };

  const toggleSent = (profileId: string) => {
    setSent((curr) => {
      const next = new Set(curr);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      persist(next, groupSent);
      return next;
    });
  };

  const toggleGroupSent = () => {
    setGroupSent((v) => {
      const next = !v;
      persist(sent, next);
      return next;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  };

  const waLinkFor = (phone: string, message: string) =>
    `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(message)}`;

  const allSent = playerMessages.every((p) => sent.has(p.profileId)) && groupSent;
  const sentCount = sent.size + (groupSent ? 1 : 0);
  const totalCount = playerMessages.length + 1;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '32px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
        </div>

        {/* Header */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 12,
          }}
        >
          Post-session broadcast · {squadName}
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          {totalGoals} goals.<br />
          {playerMessages.length} messages to send.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
            marginTop: 16,
            marginBottom: 32,
          }}
        >
          Tap each "Send" button — it'll open WhatsApp with the message
          pre-filled. Mark each as done as you go. Refresh-safe.
        </p>

        {/* Progress */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
            borderLeft: `4px solid ${allSent ? PALETTE.sage : PALETTE.mustard}`,
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {sentCount} / {totalCount}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.85,
            }}
          >
            {allSent ? 'All sent · nice' : 'Sent'}
          </span>
        </div>

        {/* Group message card */}
        <MessageCard
          title="Group chat"
          subtitle={`Paste into ${squadName}'s WA group`}
          message={groupMessage}
          isSent={groupSent}
          onToggle={toggleGroupSent}
          onCopy={() => copyToClipboard(groupMessage)}
          accent={PALETTE.sage}
        />

        {/* Per-player cards */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginTop: 36,
            marginBottom: 14,
          }}
        >
          1:1 messages
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {playerMessages.map((p) => (
            <MessageCard
              key={p.profileId}
              title={p.name}
              subtitle={
                p.goals === 0
                  ? '0 goals tonight'
                  : `${p.goals} goal${p.goals === 1 ? '' : 's'} tonight`
              }
              message={p.message}
              isSent={sent.has(p.profileId)}
              onToggle={() => toggleSent(p.profileId)}
              onCopy={() => copyToClipboard(p.message)}
              waLink={p.phone ? waLinkFor(p.phone, p.message) : null}
              phone={p.phone}
              accent={PALETTE.red}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageCard({
  title,
  subtitle,
  message,
  isSent,
  onToggle,
  onCopy,
  waLink,
  phone,
  accent,
}: {
  title: string;
  subtitle: string;
  message: string;
  isSent: boolean;
  onToggle: () => void;
  onCopy: () => void;
  waLink?: string | null;
  phone?: string | null;
  accent: string;
}) {
  return (
    <div
      style={{
        background: isSent ? 'rgba(74,117,73,0.08)' : PALETTE.cream,
        border: `2px solid ${isSent ? PALETTE.sage : PALETTE.ink}`,
        padding: 16,
        opacity: isSent ? 0.7 : 1,
        transition: 'opacity 0.2s, background 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              color: PALETTE.inkLight,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            {subtitle}
            {phone && ` · ${phone}`}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          style={{
            background: isSent ? PALETTE.sage : 'transparent',
            color: isSent ? PALETTE.cream : PALETTE.inkLight,
            border: `2px solid ${isSent ? PALETTE.sage : PALETTE.inkLight}`,
            padding: '6px 10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {isSent ? '✓ Sent' : 'Mark sent'}
        </button>
      </div>

      <pre
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: PALETTE.ink,
          lineHeight: 1.5,
          background: 'rgba(0,0,0,0.04)',
          padding: 12,
          margin: 0,
          marginBottom: 12,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          border: '1px solid rgba(0,0,0,0.08)',
          maxHeight: 200,
          overflow: 'auto',
        }}
      >
        {message}
      </pre>

      <div style={{ display: 'flex', gap: 8 }}>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              background: accent,
              color: PALETTE.cream,
              padding: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              textDecoration: 'none',
              border: `2px solid ${accent}`,
            }}
          >
            ↗ Send via WhatsApp
          </a>
        ) : (
          <div
            style={{
              flex: 1,
              padding: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: PALETTE.inkLight,
              textAlign: 'center',
              border: `1px dashed ${PALETTE.inkLight}`,
            }}
          >
            No phone — copy + send manually
          </div>
        )}

        <button
          type="button"
          onClick={onCopy}
          style={{
            background: 'transparent',
            color: PALETTE.ink,
            border: `2px solid ${PALETTE.ink}`,
            padding: '12px 16px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
