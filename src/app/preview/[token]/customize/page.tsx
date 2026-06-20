/**
 * Preview customize — kit/skin/hair/number editor for the pre-seeded
 * preview user. Server-rendered form with a server action handling
 * the save. No wallet auth required — the token IS the auth.
 */

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../_components/MiniAvatar';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ token: string }>;
}

async function saveAvatar(token: string, formData: FormData) {
  'use server';
  const skinTone = formData.get('skinTone') as string;
  const hairColor = formData.get('hairColor') as string;
  const hairStyle = formData.get('hairStyle') as string;
  const number = formData.get('number') as string;

  if (!['light', 'mid', 'dark'].includes(skinTone)) return;
  if (!['dark', 'brown', 'blond', 'red'].includes(hairColor)) return;
  if (!['short', 'tall', 'shaved', 'cap'].includes(hairStyle)) return;

  await prisma.user.update({
    where: { walletAddress: token },
    data: {
      avatarSkinTone: PALETTE.skin[skinTone as keyof typeof PALETTE.skin],
      avatarHairColor: PALETTE.hair[hairColor as keyof typeof PALETTE.hair],
      avatarHairStyle: hairStyle,
      avatarNumber: (number ?? '').trim().slice(0, 3),
    },
  });

  revalidatePath(`/preview/${token}`);
  redirect(`/preview/${token}`);
}

function colorKeyFromHex(hex: string | null, palette: Record<string, string>): string {
  if (!hex) return Object.keys(palette)[0];
  const match = Object.entries(palette).find(([, v]) => v.toLowerCase() === hex.toLowerCase());
  return match ? match[0] : Object.keys(palette)[0];
}

export default async function CustomizePage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
  });

  if (!user || user.chain !== 'preview') {
    notFound();
  }

  const currentSkin = colorKeyFromHex(user.avatarSkinTone, PALETTE.skin);
  const currentHair = colorKeyFromHex(user.avatarHairColor, PALETTE.hair);
  const currentHairStyle = user.avatarHairStyle ?? 'short';
  const currentNumber = user.avatarNumber ?? '';

  const boundSave = saveAvatar.bind(null, token);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Top ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Link
            href={`/preview/${encodeURIComponent(token)}`}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              textDecoration: 'none',
            }}
          >
            ← Back
          </Link>
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            marginBottom: 32,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Build your kit
        </h1>

        <form action={boundSave}>
          {/* Preview avatar — note: this won't live-update on changes since
              it's server-rendered. For Tuesday the save-and-see flow is fine. */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <MiniAvatar
              skin={user.avatarSkinTone ?? undefined}
              hair={user.avatarHairColor ?? undefined}
              hairStyle={user.avatarHairStyle ?? 'short'}
              number={user.avatarNumber ?? ''}
              size={180}
            />
          </div>

          {/* Skin tone */}
          <Section title="Skin tone">
            <SwatchRow>
              {(['light', 'mid', 'dark'] as const).map((key) => (
                <SwatchRadio
                  key={key}
                  name="skinTone"
                  value={key}
                  color={PALETTE.skin[key]}
                  checked={key === currentSkin}
                />
              ))}
            </SwatchRow>
          </Section>

          {/* Hair color */}
          <Section title="Hair color">
            <SwatchRow>
              {(['dark', 'brown', 'blond', 'red'] as const).map((key) => (
                <SwatchRadio
                  key={key}
                  name="hairColor"
                  value={key}
                  color={PALETTE.hair[key]}
                  checked={key === currentHair}
                />
              ))}
            </SwatchRow>
          </Section>

          {/* Hair style */}
          <Section title="Hair style">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['short', 'tall', 'shaved', 'cap'] as const).map((style) => (
                <StyleChip
                  key={style}
                  name="hairStyle"
                  value={style}
                  label={style}
                  checked={style === currentHairStyle}
                />
              ))}
            </div>
          </Section>

          {/* Number */}
          <Section title="Jersey number">
            <input
              type="text"
              name="number"
              defaultValue={currentNumber}
              maxLength={3}
              placeholder="9"
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
            style={{
              background: PALETTE.mustard,
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
              cursor: 'pointer',
              marginTop: 16,
            }}
          >
            Save & continue →
          </button>
        </form>
      </div>
    </div>
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
}: {
  name: string;
  value: string;
  color: string;
  checked: boolean;
}) {
  return (
    <label style={{ cursor: 'pointer', position: 'relative' }}>
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
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
          transition: 'border-color 0.15s',
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
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label style={{ cursor: 'pointer', position: 'relative' }}>
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
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
        }}
      >
        {label}
      </div>
    </label>
  );
}
