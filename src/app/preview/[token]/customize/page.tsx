/**
 * Preview customize — kit/skin/hair/number editor. Server component
 * loads the user, passes initial state to the client form which does
 * the live avatar preview + save.
 */

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../_components/MiniAvatar';
import { CustomizeForm } from './CustomizeForm';

interface PageProps {
  params: Promise<{ token: string }>;
}

const KIT_HEX: Record<string, string> = {
  red: PALETTE.red,
  navy: PALETTE.navy,
  sage: PALETTE.sage,
  mustard: PALETTE.mustard,
  ink: PALETTE.ink,
};

async function saveAvatar(token: string, formData: FormData) {
  'use server';
  const kitColor = formData.get('kitColor') as string;
  const skinTone = formData.get('skinTone') as string;
  const hairColor = formData.get('hairColor') as string;
  const hairStyle = formData.get('hairStyle') as string;
  const number = formData.get('number') as string;

  if (!['red', 'navy', 'sage', 'mustard', 'ink'].includes(kitColor)) return;
  if (!['light', 'mid', 'dark'].includes(skinTone)) return;
  if (!['dark', 'brown', 'blond', 'red'].includes(hairColor)) return;
  if (!['short', 'tall', 'shaved', 'cap'].includes(hairStyle)) return;

  await prisma.user.update({
    where: { walletAddress: token },
    data: {
      avatarKitColor: KIT_HEX[kitColor],
      avatarSkinTone: PALETTE.skin[skinTone as keyof typeof PALETTE.skin],
      avatarHairColor: PALETTE.hair[hairColor as keyof typeof PALETTE.hair],
      avatarHairStyle: hairStyle,
      avatarNumber: (number ?? '').trim().slice(0, 3),
    },
  });

  revalidatePath(`/preview/${token}`);
  redirect(`/preview/${token}`);
}

function colorKeyFromHex<K extends string>(
  hex: string | null,
  palette: Record<K, string>,
): K {
  const keys = Object.keys(palette) as K[];
  if (!hex) return keys[0];
  const match = keys.find((k) => palette[k].toLowerCase() === hex.toLowerCase());
  return match ?? keys[0];
}

export default async function CustomizePage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
  });

  if (!user || user.chain !== 'preview') {
    notFound();
  }

  const initial = {
    kitColor: colorKeyFromHex(user.avatarKitColor, KIT_HEX) as 'red' | 'navy' | 'sage' | 'mustard' | 'ink',
    skinTone: colorKeyFromHex(user.avatarSkinTone, PALETTE.skin),
    hairColor: colorKeyFromHex(user.avatarHairColor, PALETTE.hair),
    hairStyle: (user.avatarHairStyle ?? 'short') as 'short' | 'tall' | 'shaved' | 'cap',
    number: user.avatarNumber ?? '',
  };

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
            marginBottom: 24,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Build your kit
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          Tap a swatch — the avatar above updates as you go. When it looks
          like you (or whatever you're going for), hit save.
        </p>

        <CustomizeForm token={token} initial={initial} saveAction={boundSave} />
      </div>
    </div>
  );
}
