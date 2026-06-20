/**
 * CustomizeForm — client-side avatar customizer with live preview.
 *
 * The whole point of this component is the dopamine of tapping a
 * swatch and SEEING the avatar change instantly. Server-form posts
 * (which we had before) are correct but emotionally dead. This is
 * the same data with tactile feedback.
 */

'use client';

import React, { useState, useTransition } from 'react';
import { MiniAvatar, PALETTE } from '../../_components/MiniAvatar';

interface CustomizeFormProps {
  token: string;
  initial: {
    skinTone: 'light' | 'mid' | 'dark';
    hairColor: 'dark' | 'brown' | 'blond' | 'red';
    hairStyle: 'short' | 'tall' | 'shaved' | 'cap';
    number: string;
  };
  saveAction: (formData: FormData) => Promise<void>;
}

type Skin = CustomizeFormProps['initial']['skinTone'];
type Hair = CustomizeFormProps['initial']['hairColor'];
type Style = CustomizeFormProps['initial']['hairStyle'];

export function CustomizeForm({ token, initial, saveAction }: CustomizeFormProps) {
  const [skinTone, setSkinTone] = useState<Skin>(initial.skinTone);
  const [hairColor, setHairColor] = useState<Hair>(initial.hairColor);
  const [hairStyle, setHairStyle] = useState<Style>(initial.hairStyle);
  const [number, setNumber] = useState(initial.number);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      saveAction(formData);
    });
  };

  return (
    <form action={handleSubmit}>
      {/* Live preview — the whole point */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 32,
          position: 'relative',
        }}
      >
        <div
          style={{
            transition: 'transform 0.2s ease-out',
            transform: isPending ? 'scale(0.96)' : 'scale(1)',
          }}
        >
          <MiniAvatar
            skin={PALETTE.skin[skinTone]}
            hair={PALETTE.hair[hairColor]}
            hairStyle={hairStyle}
            number={number}
            size={180}
          />
        </div>
      </div>

      <Section title="Skin tone">
        <SwatchRow>
          {(['light', 'mid', 'dark'] as const).map((key) => (
            <SwatchRadio
              key={key}
              name="skinTone"
              value={key}
              color={PALETTE.skin[key]}
              checked={skinTone === key}
              onTap={() => setSkinTone(key)}
            />
          ))}
        </SwatchRow>
      </Section>

      <Section title="Hair color">
        <SwatchRow>
          {(['dark', 'brown', 'blond', 'red'] as const).map((key) => (
            <SwatchRadio
              key={key}
              name="hairColor"
              value={key}
              color={PALETTE.hair[key]}
              checked={hairColor === key}
              onTap={() => setHairColor(key)}
            />
          ))}
        </SwatchRow>
      </Section>

      <Section title="Hair style">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['short', 'tall', 'shaved', 'cap'] as const).map((style) => (
            <StyleChip
              key={style}
              name="hairStyle"
              value={style}
              label={style}
              checked={hairStyle === style}
              onTap={() => setHairStyle(style)}
            />
          ))}
        </div>
      </Section>

      <Section title="Jersey number">
        <input
          type="text"
          name="number"
          value={number}
          onChange={(e) => setNumber(e.target.value.slice(0, 3))}
          maxLength={3}
          placeholder="9"
          inputMode="numeric"
          style={{
            width: 100,
            padding: '12px 14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 22,
            fontWeight: 700,
            background: PALETTE.cream,
            border: `2px solid ${PALETTE.ink}`,
            color: PALETTE.ink,
            outline: 'none',
            textAlign: 'center',
          }}
        />
      </Section>

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: isPending ? PALETTE.inkLight : PALETTE.mustard,
          color: PALETTE.ink,
          padding: '16px 20px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textAlign: 'center',
          border: `2px solid ${PALETTE.red}`,
          width: '100%',
          cursor: isPending ? 'wait' : 'pointer',
          marginTop: 16,
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {isPending ? 'Saving…' : 'Save & continue →'}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PALETTE.navy,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SwatchRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 12 }}>{children}</div>;
}

function SwatchRadio({
  name,
  value,
  color,
  checked,
  onTap,
}: {
  name: string;
  value: string;
  color: string;
  checked: boolean;
  onTap: () => void;
}) {
  return (
    <label style={{ cursor: 'pointer', position: 'relative' }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onTap}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          background: color,
          border: `3px solid ${checked ? PALETTE.ink : 'rgba(0,0,0,0.15)'}`,
          boxShadow: checked ? `0 0 0 2px ${PALETTE.cream}, 0 0 0 4px ${PALETTE.ink}` : 'none',
          transform: checked ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
        }}
      />
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          textAlign: 'center',
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </label>
  );
}

function StyleChip({
  name,
  value,
  label,
  checked,
  onTap,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onTap: () => void;
}) {
  return (
    <label style={{ cursor: 'pointer', position: 'relative' }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onTap}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <div
        style={{
          padding: '12px 18px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: checked ? PALETTE.ink : 'transparent',
          color: checked ? PALETTE.cream : PALETTE.ink,
          border: `2px solid ${PALETTE.ink}`,
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {label}
      </div>
    </label>
  );
}
