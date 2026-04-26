import { describe, expect, it } from 'vitest';
import { resolveAvatarImageUrl } from '../server/services/avatar/avatar-source';

describe('resolveAvatarImageUrl', () => {
  it('prefers an explicit user avatar over a Telegram photo', () => {
    expect(resolveAvatarImageUrl({
      avatar: 'https://cdn.sportwarren.com/profile.png',
      platformIdentities: [
        { platform: 'telegram', photoUrl: 'https://t.me/photo.jpg' },
      ],
    })).toBe('https://cdn.sportwarren.com/profile.png');
  });

  it('falls back to a Telegram photo when no explicit avatar exists', () => {
    expect(resolveAvatarImageUrl({
      avatar: null,
      platformIdentities: [
        { platform: 'telegram', photoUrl: 'https://t.me/photo.jpg' },
      ],
    })).toBe('https://t.me/photo.jpg');
  });

  it('ignores blank avatar values', () => {
    expect(resolveAvatarImageUrl({
      avatar: '   ',
      platformIdentities: [
        { platform: 'telegram', photoUrl: '   ' },
      ],
    })).toBeNull();
  });
});
