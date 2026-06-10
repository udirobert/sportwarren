'use client';

import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import {
  buildShareLinks,
  pickPreferredChannel,
  type ShareChannel,
  type SharePayload,
} from '@/lib/share/links';
import { trackEvent } from '@/lib/analytics';

interface ShareLinksProps {
  payload: SharePayload;
  /** Override the channel order. Default = pickPreferredChannel('web'). */
  channels?: ShareChannel[];
  /** Visual layout. */
  layout?: 'row' | 'stacked';
  /** Visual weight. `primary` = filled gradient (hero use), `ghost` = outlined (inline). */
  variant?: 'primary' | 'ghost';
  /** Optional click-tracking event name. */
  trackEventName?: string;
  /** Optional click-tracking context. */
  trackProps?: Record<string, unknown>;
  /** Optional aria-label override; defaults to the visible label. */
  ariaLabel?: string;
}

interface ChannelConfig {
  channel: ShareChannel;
  label: string;
  href: (links: ReturnType<typeof buildShareLinks>) => string;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  hoverBg: string;
}

const CHANNEL_CONFIG: Record<ShareChannel, Omit<ChannelConfig, 'channel'>> = {
  whatsapp: {
    label: 'WhatsApp',
    href: (l) => l.whatsapp,
    icon: MessageCircle,
    iconColor: 'text-emerald-300',
    hoverBg: 'hover:bg-emerald-500/15',
  },
  telegram: {
    label: 'Telegram',
    href: (l) => l.telegram,
    icon: Send,
    iconColor: 'text-sky-300',
    hoverBg: 'hover:bg-sky-500/15',
  },
  web: {
    label: 'Share',
    href: () => '#',
    icon: MessageCircle,
    iconColor: 'text-gray-300',
    hoverBg: 'hover:bg-white/10',
  },
};

/**
 * One pill per share channel (WhatsApp / Telegram by default). Renders in
 * the order the caller prefers and reuses the existing lucide icons and
 * brand colors already in the design system.
 */
export const ShareLinks: React.FC<ShareLinksProps> = ({
  payload,
  channels,
  layout = 'row',
  variant = 'ghost',
  trackEventName,
  trackProps,
  ariaLabel,
}) => {
  const links = buildShareLinks(payload);
  const order = channels ?? pickPreferredChannel('web');

  const handleClick = (channel: ShareChannel) => {
    if (trackEventName) {
      trackEvent(trackEventName, { channel, ...(trackProps ?? {}) });
    }
  };

  const containerClass =
    layout === 'stacked'
      ? 'flex flex-col gap-2'
      : 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2';

  const basePillClass =
    variant === 'primary'
      ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition-all hover:scale-[1.02] backdrop-blur-sm'
      : 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white transition hover:border-white/20';

  return (
    <div className={containerClass} role="group" aria-label="Share via">
      {order.map((channel) => {
        const config = CHANNEL_CONFIG[channel];
        const Icon = config.icon;
        const href = config.href(links);
        return (
          <a
            key={channel}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => handleClick(channel)}
            aria-label={ariaLabel ?? `Share via ${config.label}`}
            className={`${basePillClass} ${config.hoverBg}`}
          >
            <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
            <span>{config.label}</span>
          </a>
        );
      })}
    </div>
  );
};
